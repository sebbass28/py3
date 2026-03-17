from django.urls import path, include
from rest_framework.routers import SimpleRouter
from . import views

router = SimpleRouter()
router.register(r'skills', views.SkillViewSet)
router.register(r'profiles', views.ProfileViewSet)
router.register(r'users', views.UserViewSet)
router.register(r'match-requests', views.MatchRequestViewSet, basename='match-requests')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.UserCreate.as_view(), name='user-register'),
    path('dashboard-data/', views.DashboardData.as_view(), name='dashboard-data'),
]
