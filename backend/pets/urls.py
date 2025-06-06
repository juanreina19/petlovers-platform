# pets/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import * # Import PetTypeViewSet

router = DefaultRouter()
router.register(r'pet-types', PetTypeViewSet, basename='pet-type') # New route for pet types
router.register(r'pets', PetViewSet, basename='pet')

urlpatterns = [
    path('', include(router.urls)),
     # Nuevas rutas de administrador
    path('admin/user-pet-counts/', UserPetCountView.as_view(), name='admin-user-pet-counts'),
    path('admin/all-pets/', AllPetsListView.as_view(), name='admin-all-pets'),
]