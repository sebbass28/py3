from django.urls import path, include
from rest_framework.routers import DefaultRouter
from marketplace import views as market_views
from users import views as user_views
from core import views as core_views

router = DefaultRouter()

# Marketplace
router.register(r'categories', market_views.CategoryViewSet)
router.register(r'patients', market_views.PatientViewSet, basename='patient')
router.register(r'products', market_views.ProductViewSet)
router.register(r'orders', market_views.OrderViewSet, basename='order')

# Users
router.register(r'users', user_views.UserViewSet, basename='user')

# Core
router.register(r'skills', core_views.SkillViewSet)
router.register(r'profiles', core_views.ProfileViewSet)
router.register(r'match-requests', core_views.MatchRequestViewSet, basename='match-requests')

urlpatterns = [
    path('', include(router.urls)),
    path('core/register/', core_views.UserCreate.as_view(), name='user-register'),
    path('core/dashboard-data/', core_views.DashboardData.as_view(), name='dashboard-data'),
    path('users/signup/', user_views.UserViewSet.as_view({'post': 'signup'}), name='api-signup'),
]
