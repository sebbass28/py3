from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Skill, Profile, MatchRequest
from .serializers import SkillSerializer, ProfileSerializer, UserSerializer, UserCreateSerializer, MatchRequestSerializer

class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

class SkillViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows skills to be viewed or edited.
    """
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

from rest_framework import viewsets, permissions, generics, filters

class ProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows profiles to be viewed or edited.
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__username', 'department', 'skills_offered__name']

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        profile = request.user.profile
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(profile, data=request.data, partial=(request.method == 'PATCH'))
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows users to be viewed.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

from rest_framework.views import APIView

class DashboardData(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        profile = request.user.profile
        # People who want what I offer
        learners = Profile.objects.filter(skills_wanted__in=profile.skills_offered.all()).distinct().exclude(user=request.user)
        # People who offer what I want
        mentors = Profile.objects.filter(skills_offered__in=profile.skills_wanted.all()).distinct().exclude(user=request.user)
        
        suggested_mentors_data = []
        for p in mentors:
            match_data = profile.get_matching_score(p)
            if match_data['score'] > 0:
                suggested_mentors_data.append({
                    'profile': ProfileSerializer(p).data,
                    'score': match_data['score'],
                    'skills': SkillSerializer(match_data['teach'], many=True).data
                })
        
        suggested_mentors_data.sort(key=lambda x: x['score'], reverse=True)
        
        received_requests = request.user.received_requests.filter(status='PENDING')
        
        data = {
            'suggested_mentors': suggested_mentors_data[:5],
            'learners_count': learners.count(),
            'mentors_count': mentors.count(),
            'received_requests': MatchRequestSerializer(received_requests, many=True).data,
            'my_skills_count': profile.skills_offered.count(),
        }
        return Response(data)

class MatchRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows match requests to be viewed or edited.
    """
    serializer_class = MatchRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the match requests
        for the currently authenticated user.
        """
        user = self.request.user
        return MatchRequest.objects.filter(models.Q(sender=user) | models.Q(receiver=user))

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
