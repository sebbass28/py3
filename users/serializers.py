from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Los Serializers en Django REST Framework (DRF) transforman objetos de la base de datos a JSON y viceversa
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Definimos los campos que se enviarán/recibirán desde el frontend
        fields = ('id', 'username', 'email', 'role', 'company_name', 'address', 'phone', 'vat_id', 'password')
        # La contraseña solo se puede escribir (al registrar), nunca se envía de vuelta por seguridad
        extra_kwargs = {'password': {'write_only': True}}

    # Sobrescribimos el método create para usar 'create_user', que se encarga de hashear (encriptar) la contraseña
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

# Personalización del Token JWT para que incluya información extra de identidad
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        # Obtenemos el token base generado por SimpleJWT
        token = super().get_token(user)

        # Añadimos "Custom Claims" (campos personalizados) al cuerpo del token (Payload)
        # Esto permite que el frontend sepa quién es el usuario sin hacer otra petición extra a la API
        token['username'] = user.username
        token['role'] = user.role
        token['company_name'] = user.company_name
        
        return token
