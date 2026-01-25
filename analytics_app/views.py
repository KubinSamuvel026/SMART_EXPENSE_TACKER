from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from django.db.models import Sum
from datetime import date
from django.db.models.functions import TruncDay
from expenses.models import Expense


class MonthlyAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        today = date.today()
        month_start = today.replace(day=1)

        expenses = Expense.objects.filter(
            user=request.user,
            date__gte=month_start,
            date__lte=today
        )

        total = expenses.aggregate(total=Sum('amount'))['total'] or 0

        by_category = (
            expenses.values('category')
            .annotate(total=Sum('amount'))
        )

        category_data = {
            item['category']: item['total'] for item in by_category
        }

        return Response({
            "total": total,
            "by_category": category_data
        })


class DailyAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        today = date.today()
        month_start = today.replace(day=1)

        expenses = (
            Expense.objects
            .filter(user=request.user, date__gte=month_start, date__lte=today)
            .annotate(day=TruncDay('date'))
            .values('day')
            .annotate(total=Sum('amount'))
            .order_by('day')
        )

        data = [
            {"day": e["day"].strftime("%d"), "total": e["total"]}
            for e in expenses
        ]

        return Response(data)

