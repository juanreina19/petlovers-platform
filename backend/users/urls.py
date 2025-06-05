from django.urls import path
from .views import *
from rest_framework import routers

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Rutas de Administrador
    path('admin/users/', UserListView.as_view(), name='admin-user-list'), # Listar todos los usuarios
    path('admin/users/<uuid:user_id>/assign-role/', AssignRoleView.as_view(), name='admin-assign-role'),
]