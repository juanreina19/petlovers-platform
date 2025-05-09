from django.urls import path
from . import views
from rest_framework import routers

urlpatterns = [
    path('login', views.login, name='login'),
    path('register', views.register, name='register'),
]