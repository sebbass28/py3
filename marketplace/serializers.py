from rest_framework import serializers
from .models import Category, Product, Order, Patient, OrderImage, Invoice
from django.contrib.auth import get_user_model

User = get_user_model()

# --- SERIALIZER DE USUARIO (REPRESENTACIÓN EN PEDIDOS) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'company_name', 'role']

# --- SERIALIZER PARA FOTOS CLÍNICAS (SOLUCIÓN AL COLOR) ---
class OrderImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderImage
        fields = ['id', 'image', 'description', 'created_at']

# --- SERIALIZER DE CATEGORÍAS (CATÁLOGO) ---
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

# --- SERIALIZER DE PACIENTES (FICHA MÉDICA) ---
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

# --- SERIALIZER DE PRODUCTOS (CATÁLOGO DEL LABORATORIO) ---
class ProductSerializer(serializers.ModelSerializer):
    lab = UserSerializer(read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = '__all__'

# --- SERIALIZER DE FACTURAS (DOCUMENTOS LEGALES) ---
class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

# --- SERIALIZER MAESTRO: EL PEDIDO (ESTRUCTURA COMPLEJA) ---
class OrderSerializer(serializers.ModelSerializer):
    clinic = UserSerializer(read_only=True)
    lab = UserSerializer(read_only=True)
    patient = PatientSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    
    # Gestión de imágenes multimedia e Facturas
    images = OrderImageSerializer(many=True, read_only=True)
    invoices = InvoiceSerializer(many=True, read_only=True)
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)
