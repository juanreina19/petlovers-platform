import uuid
from django.db import models
from pets.models import Pet

class ReservationStatus(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=30, unique=True)

    class Meta:
        verbose_name_plural = "Reservation Statuses"

    def __str__(self):
        return self.name

class Reservation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='reservations')
    status = models.ForeignKey(ReservationStatus, on_delete=models.SET_NULL, null=True, related_name='reservations')
    start_date = models.DateField()
    end_date = models.DateField()
    observations = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_date', 'created_at'] 

    def __str__(self):
        return f"Reserva para {self.pet.name} ({self.start_date} a {self.end_date}) - {self.status.name if self.status else 'Sin Estado'}"

