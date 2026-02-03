from django.urls import path
from .views import RegisterView,CustomTokenObtainPairView,health
from .views import health
# from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', CustomTokenObtainPairView.as_view()),
    path("health/", health),
]
