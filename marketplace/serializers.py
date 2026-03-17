from rest_framework import serializers
from .models import Category, Product, Order, Patient
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'company_name', 'address', 'phone']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    lab = UserSerializer(read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    clinic = UserSerializer(read_only=True)
    lab = UserSerializer(read_only=True)
    patient = PatientSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        # Additional logic for automated status or notifications could go here
        return super().create(validated_data)
