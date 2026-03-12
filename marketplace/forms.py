from django import forms
from .models import Product, Order

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['category', 'name', 'description', 'price', 'image_url']
        widgets = {
            'category': forms.Select(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-2 border'}),
            'name': forms.TextInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-2 border'}),
            'description': forms.Textarea(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-2 border', 'rows': 3}),
            'price': forms.NumberInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-2 border'}),
            'image_url': forms.URLInput(attrs={'class': 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-2 border'}),
        }

class OrderStatusForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['status']
        widgets = {
            'status': forms.Select(attrs={'class': 'block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-500 focus:ring-medical-500 sm:text-sm p-1 border'})
        }
