from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User
from .serializers import UserSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Vista para el registro de nuevos usuarios. Usa CreateAPIView para manejar el POST de forma automática
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Permitimos que cualquier persona (aunque no esté logueada) acceda a esta vista
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

# Vista personalizada para el login. Sobrescribe la de SimpleJWT para usar nuestro Serializer con el 'role'
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# Vista para obtener o actualizar el perfil del usuario autenticado
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    # Solo usuarios logueados pueden acceder a su perfil
    permission_classes = (IsAuthenticated,)

    # Sobrescribimos este método para que la API devuelva SIEMPRE los datos del usuario que hace la petición
    def get_object(self):
        return self.request.user
