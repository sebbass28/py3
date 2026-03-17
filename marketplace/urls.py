from django.urls import path, include
from rest_framework.routers import SimpleRouter
from . import views

router = SimpleRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'patients', views.PatientViewSet, basename='patient')
router.register(r'products', views.ProductViewSet)
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
