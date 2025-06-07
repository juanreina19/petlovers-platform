# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import User, Role # Asumiendo que User está en .models

# Obtener el modelo de usuario activo en Django
UserModel = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = UserModel
        # 'role' no se incluye en fields aquí porque se asignará automáticamente en la vista
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone_number']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = UserModel.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', None) # Asegúrate de que phone_number sea opcional
        )
        # El rol se asignará en la vista, no aquí en el serializer's create method.
        return user


class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    user = None # Añadimos un atributo para almacenar el usuario autenticado

    def validate(self, data):
        username_or_email = data.get('username_or_email')
        password = data.get('password')

        if not username_or_email or not password:
            msg = ('Debe incluir "username_or_email" y "password".')
            raise serializers.ValidationError(msg, code='authorization')

        user = None

        # Intenta encontrar el usuario por email
        try:
            user = UserModel.objects.get(email=username_or_email)
        except UserModel.DoesNotExist:
            # Si no se encuentra por email, intenta por username
            try:
                user = UserModel.objects.get(username=username_or_email)
            except UserModel.DoesNotExist:
                pass # El usuario no existe ni por email ni por username

        if user and user.check_password(password):
            # Si el usuario existe y la contraseña es correcta
            self.user = user # Almacenamos el usuario en el atributo user del serializer
            return data
        else:
            msg = ('No se pudo iniciar sesión con las credenciales proporcionadas.')
            raise serializers.ValidationError(msg, code='authorization')
        
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        # Incluye los campos que el usuario puede ver y actualizar.
        # Excluye 'password', 'is_staff', 'is_superuser', etc., por seguridad.
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role']
        read_only_fields = ['id', 'username', 'role'] # Campos que no deberían ser modificados por el usuario

    def to_representation(self, instance):
        # Sobreescribir para mostrar el nombre del rol en lugar de su ID/UUID
        representation = super().to_representation(instance)
        if instance.role:
            representation['role'] = instance.role.name
        else:
            representation['role'] = None # Si no hay rol asignado
        return representation

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        confirm_new_password = data.get('confirm_new_password')

        # El usuario se obtiene del contexto (la vista lo pasará)
        user = self.context.get('request').user

        # 1. Verificar que la contraseña antigua sea correcta
        if not user.check_password(old_password):
            raise serializers.ValidationError({"old_password": "La contraseña actual es incorrecta."})

        # 2. Verificar que las nuevas contraseñas coincidan
        if new_password != confirm_new_password:
            raise serializers.ValidationError({"new_password": "Las nuevas contraseñas no coinciden."})

        # 3. Opcional: Agregar validaciones de seguridad para la nueva contraseña
        # Por ejemplo: longitud mínima, complejidad, etc.
        if len(new_password) < 8:
            raise serializers.ValidationError({"new_password": "La nueva contraseña debe tener al menos 8 caracteres."})
        # Puedes añadir más validaciones aquí, como contener números, mayúsculas, símbolos, etc.

        data['user'] = user # Añadir el usuario validado para usarlo en la vista
        return data

class UserListSerializer(serializers.ModelSerializer):
    role = serializers.StringRelatedField() # Muestra el __str__ del Role

    class Meta:
        model = UserModel
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'is_active', 'date_joined']
        read_only_fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'is_active', 'date_joined']

# --- Serializer para Asignación de Rol ---
class RoleAssignmentSerializer(serializers.Serializer):
    # UUIDField para el ID del rol o CharField para el nombre del rol.
    # Usaremos CharField para el nombre del rol, que es más legible para el administrador.
    role_name = serializers.CharField(required=True)

    def validate_role_name(self, value):
        try:
            Role.objects.get(name=value)
        except Role.DoesNotExist:
            raise serializers.ValidationError("El rol especificado no existe.")
        return value
