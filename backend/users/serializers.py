from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']


class LoginSerializer(serializers.Serializer):
    class Meta:
        model = User
        fields = ['username', 'password']