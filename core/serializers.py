from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Skill, Profile, MatchRequest

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills_offered = SkillSerializer(many=True, read_only=True)
    skills_wanted = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = '__all__'

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class MatchRequestSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    skill = SkillSerializer(read_only=True)

    class Meta:
        model = MatchRequest
        fields = '__all__'
