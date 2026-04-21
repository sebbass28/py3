from rest_framework import serializers
from .models import (
    Category, Product, Order, Patient, OrderImage, Invoice, OrderMessage, OrderEvent, Notification,
    IntegrationConnection, IntegrationSyncLog
)
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
    cases_count = serializers.SerializerMethodField()

    def get_cases_count(self, obj):
        # Exponemos número de casos para facilitar vista clínica sin queries extras.
        return obj.cases.count()

    class Meta:
        model = Patient
        fields = '__all__'
        # La clínica se asigna en backend (perform_create), no debe venir del frontend.
        read_only_fields = ['clinic', 'created_at']

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


# --- SERIALIZER DE MENSAJES (CHAT DE PEDIDO) ---
class OrderMessageSerializer(serializers.ModelSerializer):
    # Mostramos datos resumidos del emisor para renderizar el chat en frontend.
    sender = UserSerializer(read_only=True)

    class Meta:
        model = OrderMessage
        fields = ['id', 'order', 'sender', 'content', 'image', 'read_by_clinic', 'read_by_lab', 'created_at']
        read_only_fields = ['id', 'sender', 'read_by_clinic', 'read_by_lab', 'created_at']

    def validate(self, attrs):
        # Exigimos al menos texto o imagen para evitar mensajes vacíos.
        content = (attrs.get('content') or '').strip()
        image = attrs.get('image')
        if not content and not image:
            raise serializers.ValidationError("Debes enviar texto o una imagen.")
        return attrs


# --- SERIALIZER DE EVENTOS DE PEDIDO (TIMELINE) ---
class OrderEventSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = OrderEvent
        fields = ['id', 'order', 'actor', 'event_type', 'description', 'metadata', 'created_at']
        read_only_fields = ['id', 'actor', 'created_at']


# --- SERIALIZER DE NOTIFICACIONES IN-APP ---
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'order', 'title', 'message', 'target_role', 'is_read', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class IntegrationConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationConnection
        fields = ['id', 'owner', 'name', 'external_system', 'api_key', 'is_active', 'created_at', 'last_sync_at']
        read_only_fields = ['id', 'owner', 'api_key', 'created_at', 'last_sync_at']


class IntegrationSyncLogSerializer(serializers.ModelSerializer):
    connection_name = serializers.ReadOnlyField(source='connection.name')
    external_system = serializers.ReadOnlyField(source='connection.external_system')

    class Meta:
        model = IntegrationSyncLog
        fields = [
            'id', 'connection', 'connection_name', 'external_system', 'direction',
            'entity_type', 'external_id', 'status', 'message', 'payload', 'created_at'
        ]
        read_only_fields = fields

# --- SERIALIZER MAESTRO: EL PEDIDO (ESTRUCTURA COMPLEJA) ---
class OrderSerializer(serializers.ModelSerializer):
    clinic = UserSerializer(read_only=True)
    lab = UserSerializer(read_only=True)
    patient = PatientSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    
    # Gestión de imágenes multimedia e Facturas
    images = OrderImageSerializer(many=True, read_only=True)
    invoices = InvoiceSerializer(many=True, read_only=True)
    events = OrderEventSerializer(many=True, read_only=True)
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        return super().create(validated_data)
