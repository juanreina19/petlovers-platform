import uuid
from django.db import models
from users.models import User
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import Image
import os


class PetType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Pet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pets')
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    pet_type = models.ForeignKey(PetType, on_delete=models.SET_NULL, null=True)
    animal_breed = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    photo = models.ImageField(upload_to='pets/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.photo:
            try:
                img = Image.open(self.photo)

                if img.format != 'WEBP':
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")

                    img_io = BytesIO()
                    img.save(img_io, format='WEBP', quality=80)

                    base_name = os.path.splitext(self.photo.name)[0]
                    new_image_name = f"{base_name}.webp"

                    self.photo.save(new_image_name, ContentFile(img_io.getvalue()), save=False)
            except Exception as e:
                print(f"Error al optimizar la imagen: {e}")

        super().save(*args, **kwargs)
