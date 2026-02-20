from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('marketplace/', views.product_list, name='product_list'),
    path('product/<int:pk>/', views.product_detail, name='product_detail'),
    path('product/<int:product_id>/order/', views.create_order, name='create_order'),
    path('product/add/', views.add_product, name='add_product'),
    path('order/<int:order_id>/update/', views.update_order_status, name='update_order_status'),
]
