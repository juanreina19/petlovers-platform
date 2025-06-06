# store/serializers.py
from rest_framework import serializers
from .models import ProductCategory, Product

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name']
        read_only_fields = ['id']

class ProductSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(read_only=True) # Usamos el nombre del campo 'category'
    category_id = serializers.UUIDField(write_only=True, required=False) # Para enviar el ID de la categoría, y que sea opcional

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 'image', # Usamos el nombre del campo 'image'
            'category', 'category_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_category_id(self, value):
        if value is None: # Si no se proporciona un ID, es válido (campo null=True)
            return None
        if not ProductCategory.objects.filter(id=value).exists():
            raise serializers.ValidationError("Categoría de producto no encontrada.")
        return value

    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        category = None
        if category_id:
            try:
                category = ProductCategory.objects.get(id=category_id)
            except ProductCategory.DoesNotExist:
                raise serializers.ValidationError({"category_id": "Categoría de producto inválida."})

        product = Product.objects.create(category=category, **validated_data)
        return product

    def update(self, instance, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id is not None: # Solo actualizar si se proporciona un ID de categoría
            try:
                category = ProductCategory.objects.get(id=category_id)
                instance.category = category
            except ProductCategory.DoesNotExist:
                raise serializers.ValidationError({"category_id": "Categoría de producto inválida."})
        elif 'category_id' in self.initial_data and category_id is None: # Si se envía null explícitamente
            instance.category = None


        # Actualizar otros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save() # Llama al método save del modelo para la optimización de la imagen
        return instance