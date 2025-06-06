import uuid
from django.db import models
import os
from PIL import Image
from django.core.files.base import ContentFile
from io import BytesIO

class ProductCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Guardar la instancia primero para asegurar que self.photo sea accesible
        super().save(*args, **kwargs)

        if self.image and not self.image.name.lower().endswith('.webp'):
            try:
                self.image.seek(0)
                img = Image.open(self.image)

                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")

                img_io = BytesIO()
                # Ajustar calidad para mayor optimización si es necesario
                img.save(img_io, format='WEBP', quality=75) # Calidad 75 es un buen balance

                base_name = os.path.splitext(os.path.basename(self.image.name))[0]
                new_image_name = f"{base_name}.webp"

                self.image.save(new_image_name, ContentFile(img_io.getvalue()), save=False)
                super().save(update_fields=['photo']) # Guardar solo el campo de la foto
            except Exception as e:
                print(f"Error optimizing product image: {e}")
                # Considera loggear este error en un entorno de producción.
