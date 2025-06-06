# reservations/serializers.py
from rest_framework import serializers
from .models import Reservation, ReservationStatus
from pets.serializers import PetSerializer # Reutilizamos el PetSerializer de la app pets
from pets.models import Pet # ¡IMPORTANTE: Debes importar el modelo Pet para la excepción!
from datetime import date # Para validación de fechas

class ReservationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationStatus
        fields = ['id', 'name']
        read_only_fields = ['id']

class ReservationSerializer(serializers.ModelSerializer):
    pet = PetSerializer(read_only=True)
    status = ReservationStatusSerializer(read_only=True)

    pet_id = serializers.UUIDField(write_only=True, required=True)
    status_id = serializers.UUIDField(write_only=True, required=False) # OK que sea opcional

    class Meta:
        model = Reservation
        fields = [
            'id', 'pet', 'pet_id', 'status', 'status_id',
            'start_date', 'end_date', 'observations',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        if 'start_date' in data and 'end_date' in data:
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError("La fecha de fin no puede ser anterior a la fecha de inicio.")

        if self.instance is None and 'start_date' in data:
            if data['start_date'] < date.today():
                raise serializers.ValidationError("La fecha de inicio no puede ser en el pasado.")

        return data

    def create(self, validated_data):
        pet_id = validated_data.pop('pet_id')
        status_id = validated_data.pop('status_id', None)

        user = self.context['request'].user
        try:
            pet = user.pets.get(id=pet_id)
        except Pet.DoesNotExist: # ¡CORRECCIÓN AQUÍ! Era 'pet.DoesNotExist', debería ser 'Pet.DoesNotExist'
            raise serializers.ValidationError({"pet_id": "La mascota seleccionada no pertenece a este usuario."})

        if status_id:
            try:
                status_obj = ReservationStatus.objects.get(id=status_id)
            except ReservationStatus.DoesNotExist:
                raise serializers.ValidationError({"status_id": "Estado de reserva inválido."})
        else:
            try:
                status_obj = ReservationStatus.objects.get(name='Pending')
            except ReservationStatus.DoesNotExist:
                raise serializers.ValidationError(
                    "El estado 'Pending' no está configurado. Contacte al administrador."
                )

        reservation = Reservation.objects.create(
            pet=pet,
            status=status_obj,
            **validated_data
        )
        return reservation

    def update(self, instance, validated_data):
        pet_id = validated_data.pop('pet_id', None)
        status_id = validated_data.pop('status_id', None)

        if pet_id:
            user = self.context['request'].user
            try:
                new_pet = user.pets.get(id=pet_id)
                instance.pet = new_pet
            except Pet.DoesNotExist: 
                raise serializers.ValidationError({"pet_id": "La mascota seleccionada no pertenece a este usuario."})

        if status_id:
            try:
                new_status = ReservationStatus.objects.get(id=status_id)
                instance.status = new_status
            except ReservationStatus.DoesNotExist:
                raise serializers.ValidationError({"status_id": "Estado de reserva inválido."})


        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance