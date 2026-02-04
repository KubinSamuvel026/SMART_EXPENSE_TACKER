from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from .serializers import RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from django.http import JsonResponse
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

def health(request):
    return JsonResponse({"status": "ok"})
class RegisterView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if (not email) or (not password):
            return Response(
                {"error": f"{email,password} Email and password required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "User already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        return Response(
            {"message": "User registered successfully"},
            status=status.HTTP_201_CREATED
        )
        

