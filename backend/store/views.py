# store/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import ProductCategory, Product
from .serializers import ProductCategorySerializer, ProductSerializer

class ProductCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que permite ver las categorías de productos.
    """
    queryset = ProductCategory.objects.all().order_by('name')
    serializer_class = ProductCategorySerializer
    permission_classes = [AllowAny]

class ProductViewSet(viewsets.ModelViewSet): # ¡ModelViewSet para CRUD completo!
    """
    API endpoint que permite a los usuarios ver una lista de productos disponibles y
    a los administradores agregar, editar o eliminar productos.
    """
    # Queryset base para la vista de administración (todos los productos)
    queryset = Product.objects.all().select_related('category') # ¡Usamos 'category' aquí!
    serializer_class = ProductSerializer

    def get_permissions(self):
        # Permisos dinámicos:
        # - list y retrieve son públicos (AllowAny)
        # - create, update, partial_update, destroy son solo para administradores (IsAdminUser)
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    def list(self, request, *args, **kwargs):
        # Para usuarios no-admin, filtramos por stock > 0
        if not request.user.is_staff:
            self.queryset = self.queryset.filter(stock__gt=0)
        return super().list(request, *args, **kwargs)

    # para eliminar el archivo de imagen del almacenamiento al borrar el producto
    def perform_destroy(self, instance):
        if instance.image:
            instance.image.delete(save=False)
        instance.delete()