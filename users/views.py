from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User
from .serializers import UserSerializer, MyTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# --- VISTA PARA REGISTRE DE USUARIOS (SIGN UP) ---
class RegisterView(generics.CreateAPIView):
    # 1. Definimos el catálogo de usuarios (todos los registrados)
    queryset = User.objects.all()
    # 2. Permitimos el acceso público para que cualquiera pueda crear su cuenta
    permission_classes = (AllowAny,)
    # 3. Usamos el serializador que valida los datos del formulario (Email, Password, Rol)
    serializer_class = UserSerializer

# --- VISTA PARA INICIO DE SESIÓN (LOGIN CON JWT) ---
class MyTokenObtainPairView(TokenObtainPairView):
    # 1. Usamos nuestra versión personalizada que inyecta el 'role' y 'company_name' en el Token
    serializer_class = MyTokenObtainPairSerializer

# --- VISTA PARA GESTIÓN DEL PERFIL PROPIO (ME) ---
class ProfileView(generics.RetrieveUpdateAPIView):
    # 1. Usamos el serializador de usuario para mostrar los datos actuales
    serializer_class = UserSerializer
    # 2. Seguridad: Obligatorio estar logueado para ver o editar tu perfil
    permission_classes = (IsAuthenticated,)

    # ACCIÓN: ¿Qué objeto estamos editando?
    def get_object(self):
        # 1. Retornamos siempre el usuario que está haciendo la petición ahora mismo
        # Esto evita que un usuario intente editar el perfil de otro cambiando la ID
        return self.request.user
