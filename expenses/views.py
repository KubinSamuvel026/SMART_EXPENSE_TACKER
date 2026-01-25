from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status

from django.db.models import Sum
from django.http import HttpResponse
from datetime import date
from io import BytesIO
import csv

from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

from .models import Expense
from .serializers import ExpenseSerializer
from budgets.models import Budget
class ExpenseViewSet(ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user)

        month = self.request.query_params.get("month")
        category = self.request.query_params.get("category")

        if month and "-" in month:
            try:
                year, month_num = map(int, month.split("-"))
                queryset = queryset.filter(
                    date__year=year,
                    date__month=month_num
                )
            except ValueError:
                pass

        if category:
            queryset = queryset.filter(category=category)

        return queryset

    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)

        today = date.today()
        month_start = today.replace(day=1)

        total_spent = (
            Expense.objects.filter(
                user=self.request.user,
                category=expense.category,
                date__gte=month_start,
                date__lte=today
            ).aggregate(total=Sum("amount"))["total"] or 0
        )

        budget = Budget.objects.filter(
            user=self.request.user,
            category=expense.category
        ).first()

        if budget and total_spent > budget.monthly_limit:
            self.warning_message = (
                f"Warning: You exceeded {expense.category} budget "
                f"({budget.monthly_limit}). Current spending: {total_spent}"
            )
        else:
            self.warning_message = None

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        if hasattr(self, "warning_message") and self.warning_message:
            return Response(
                {
                    "expense": response.data,
                    "warning": self.warning_message
                },
                status=status.HTTP_201_CREATED
            )

        return response

class ExpenseCSVExportView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        queryset = Expense.objects.filter(user=request.user)

        month = request.query_params.get("month")
        category = request.query_params.get("category")

        if month and "-" in month:
            year, month_num = month.split("-")
            queryset = queryset.filter(
                date__year=int(year),
                date__month=int(month_num)
            )

        if category:
            queryset = queryset.filter(category=category)

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="expenses.csv"'

        writer = csv.writer(response)
        writer.writerow(["Date", "Category", "Amount", "Description"])

        for expense in queryset:
            writer.writerow([
                expense.date,
                expense.category,
                expense.amount,
                expense.description
            ])

        return response

class ExpensePDFExportView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        queryset = Expense.objects.filter(user=request.user)

        month = request.query_params.get('month')
        category = request.query_params.get('category')

        if month and '-' in month:
            year, month_num = month.split('-')
            queryset = queryset.filter(
                date__year=int(year),
                date__month=int(month_num)
            )

        if category:
            queryset = queryset.filter(category=category)

        buffer = BytesIO()
        pdf = SimpleDocTemplate(buffer, pagesize=A4)

        data = [['Date', 'Category', 'Amount', 'Description']]

        for expense in queryset:
            data.append([
                str(expense.date),
                expense.category,
                str(expense.amount),
                expense.description,
            ])

        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.grey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (2,1), (2,-1), 'RIGHT'),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
        ]))

        pdf.build([table])

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="expenses.pdf"'
        return response
