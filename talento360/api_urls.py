from django.urls import path, include
from rest_framework.routers import DefaultRouter
from marketplace import views as market_views
from users import views as user_views
from core import views as core_views

router = DefaultRouter()

# --- MÓDULO MARKETPLACE (Pedidos y Productos) ---
router.register(r'categories', market_views.CategoryViewSet)
router.register(r'patients', market_views.PatientViewSet, basename='patient')
router.register(r'products', market_views.ProductViewSet)
router.register(r'orders', market_views.OrderViewSet, basename='order')

# Nuevo endpoint para gestionar las fotos clínicas de los pedidos
router.register(r'order-images', market_views.OrderImageViewSet, basename='order-image')

# --- MÓDULO CORE (Talento y Matchmaking - Heredado del proyecto original) ---
router.register(r'skills', core_views.SkillViewSet)
router.register(r'profiles', core_views.ProfileViewSet)
router.register(r'match-requests', core_views.MatchRequestViewSet, basename='match-requests')

urlpatterns = [
    # Incluimos todas las rutas generadas automáticamente por el router de DRF
    path('', include(router.urls)),
    
    # Rutas auxiliares de lógica de negocio original
    path('core/dashboard-data/', core_views.DashboardData.as_view(), name='dashboard-data'),
]
