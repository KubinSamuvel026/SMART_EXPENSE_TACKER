from django.urls import path
from .views import MonthlyAnalyticsView, DailyAnalyticsView

urlpatterns = [
    path('analytics/daily/', DailyAnalyticsView.as_view()),
    path('analytics/monthly/', MonthlyAnalyticsView.as_view()),
]
