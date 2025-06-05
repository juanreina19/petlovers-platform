# pets/serializers.py
from rest_framework import serializers
from .models import Pet, PetType

# Serializer for PetType
class PetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetType
        fields = ['id', 'name']
        read_only_fields = ['id']

# Serializer for Pet
class PetSerializer(serializers.ModelSerializer):
    pet_type = PetTypeSerializer(read_only=True) # Read-only, displays full PetType object
    pet_type_id = serializers.UUIDField(write_only=True, required=True) # For writing (creating/updating)

    class Meta:
        model = Pet
        fields = [
            'id', 'user', 'name', 'age', 'pet_type', 'pet_type_id', 'animal_breed',
            'description', 'photo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at'] # 'user' is assigned by view

    def create(self, validated_data):
        pet_type_id = validated_data.pop('pet_type_id')
        try:
            pet_type = PetType.objects.get(id=pet_type_id)
        except PetType.DoesNotExist:
            raise serializers.ValidationError({"pet_type_id": "Invalid pet type ID."})

        # The 'user' will be assigned by the view (perform_create)
        pet = Pet.objects.create(pet_type=pet_type, **validated_data)
        return pet

    def update(self, instance, validated_data):
        # Handle pet_type_id if provided
        pet_type_id = validated_data.pop('pet_type_id', None)
        if pet_type_id:
            try:
                pet_type = PetType.objects.get(id=pet_type_id)
                instance.pet_type = pet_type
            except PetType.DoesNotExist:
                raise serializers.ValidationError({"pet_type_id": "Invalid pet type ID."})

        # Update other fields of the pet
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save() # The custom save method in Pet model will handle photo optimization
        return instance