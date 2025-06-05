# pets/views.py
from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count

class PetTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows Pet Types to be viewed.
    Admins can add/manage these via Django Admin.
    """
    queryset = PetType.objects.all()
    serializer_class = PetTypeSerializer
    permission_classes = [IsAuthenticated] # Or allow anyone if you want all users to see types

class PetViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to manage their pets.
    """
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensure a user can only see, edit, or delete their own pets
        return Pet.objects.filter(user=self.request.user).select_related('pet_type')

    def perform_create(self, serializer):
        # Assign the authenticated user as the owner of the pet
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer) # This calls instance.save() which handles photo optimization
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserPetCountView(generics.ListAPIView):
    """
    API endpoint para que los administradores vean cuántas mascotas tiene cada usuario.
    """
    # Agrupa por usuario y cuenta las mascotas.
    queryset = (
        Pet.objects.values("user__id", "user__username", "user__email") # Incluimos email también
        .annotate(pet_count=Count("id"))
        .order_by("user__username")
    )
    permission_classes = [IsAdminUser] # Solo administradores pueden acceder

    def list(self, request, *args, **kwargs):
        # Formatea la respuesta para que sea más clara
        data = [
            {
                "user_id": item["user__id"],
                "username": item["user__username"],
                "email": item["user__email"], # Añadimos email
                "pet_count": item["pet_count"],
            }
            for item in self.get_queryset()
        ]
        return Response(data)

class AllPetsListView(generics.ListAPIView):
    """
    API endpoint para que los administradores vean una lista de todas las mascotas registradas.
    """
    # Incluye al usuario y el tipo de mascota relacionado para evitar N+1 queries.
    queryset = Pet.objects.all().select_related("user", "pet_type")
    serializer_class = PetSerializer # Reutilizamos el PetSerializer para mostrar los detalles de la mascota
    permission_classes = [IsAdminUser] # Solo administradores pueden acceder
