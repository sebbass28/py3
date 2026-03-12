from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'skills', views.SkillViewSet)
router.register(r'profiles', views.ProfileViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'match-requests', views.MatchRequestViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.UserCreate.as_view(), name='user-register'),
    path('dashboard-data/', views.DashboardData.as_view(), name='dashboard-data'),
]
