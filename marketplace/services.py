import requests
from .models import Product, Category
from django.contrib.auth import get_user_model

User = get_user_model()

def import_external_products(lab_user, source_url, source_type='Shopify'):
    """
    Simulates importing products from an external store.
    In a real scenario, this would use the store's API (Shopify, WooCommerce, etc.)
    """
    # Mock data for demonstration
    mock_products = [
        {
            "name": "Corona E-Max (Importada)",
            "price": 120.00,
            "material": "Disilicato de Litio",
            "description": "Producto sincronizado desde la tienda externa del laboratorio.",
            "delivery_days": 4,
            "external_url": f"{source_url}/products/emax-crown",
            "category_name": "Fija"
        },
        {
            "name": "Prótesis Híbrida Premium",
            "price": 850.00,
            "material": "Titanio/Acrílico",
            "description": "Producto de alta gama importado automáticamente.",
            "delivery_days": 10,
            "external_url": f"{source_url}/products/hybrid-premium",
            "category_name": "Implantoprótesis"
        }
    ]
    
    imported_count = 0
    for item in mock_products:
        category, _ = Category.objects.get_or_create(name=item['category_name'])
        
        product, created = Product.objects.update_or_create(
            lab=lab_user,
            external_url=item['external_url'],
            defaults={
                'name': item['name'],
                'price': item['price'],
                'material': item['material'],
                'description': item['description'],
                'delivery_days': item['delivery_days'],
                'category': category,
                'is_external': True,
                'external_source': source_type
            }
        )
        if created:
            imported_count += 1
            
    return imported_count
