from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet
from .views import ExpenseCSVExportView, ExpensePDFExportView
from django.urls import path


router = DefaultRouter()
router.register('expenses', ExpenseViewSet, basename='expenses')

urlpatterns = router.urls
urlpatterns += [
     path('expenses/export/pdf/', ExpensePDFExportView.as_view()),
    path('expenses/export/csv/', ExpenseCSVExportView.as_view()),
   


]
