# users/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from .serializers import *
from django.contrib.auth import get_user_model # Importar get_user_model
from .models import Role
from django.shortcuts import get_object_or_404

UserModel = get_user_model() # Obtener el modelo de usuario

class RegisterView(generics.CreateAPIView):
    queryset = UserModel.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save() # Crea el usuario sin rol aún

        # Asigna el rol "Cliente Regular" al usuario recién creado
        try:
            cliente_regular_role = Role.objects.get(name='Cliente Regular')
            user.role = cliente_regular_role
            user.save() # Guarda el usuario con su nuevo rol
        except Role.DoesNotExist:
            # Manejar el error si el rol "Cliente Regular" no existe
            return Response(
                {"detail": "Error: El rol 'Cliente Regular' no está configurado en la base de datos."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user": self.get_serializer(user).data, # Usa self.get_serializer para incluir todos los campos del serializer
            "token": token.key
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer # Útil para la documentación

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.user # Accedemos al usuario validado desde el serializer
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
        })
    
class LogoutView(APIView):
    permission_classes = (IsAuthenticated,) # Solo usuarios autenticados pueden hacer logout

    def post(self, request, *args, **kwargs):
        # Elimina el token asociado al usuario de la solicitud
        try:
            request.user.auth_token.delete()
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": "Error al cerrar sesión."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        # Retorna el usuario autenticado para las operaciones de Retrieve y Update
        return self.request.user

    def update(self, request, *args, **kwargs):
        # Permite una actualización parcial por defecto
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer # Útil para la documentación

    def post(self, request, *args, **kwargs):
        # Pasamos el request al contexto del serializer para acceder a request.user
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        new_password = serializer.validated_data['new_password']

        user.set_password(new_password) # Hashea y establece la nueva contraseña
        user.save()

        # Opcional: Eliminar tokens existentes para forzar un nuevo login
        # Esto aumenta la seguridad, pero el usuario tendrá que volver a iniciar sesión
        # If you want to force re-login after password change
        # Token.objects.filter(user=user).delete()

        return Response({"detail": "Contraseña actualizada exitosamente."}, status=status.HTTP_200_OK)

class UserListView(generics.ListAPIView):
    queryset = UserModel.objects.all().select_related('role') # Cargar el rol para evitar N+1 queries
    serializer_class = UserListSerializer
    permission_classes = (IsAdminUser,) # Solo administradores pueden ver esta lista

class AssignRoleView(APIView):
    permission_classes = (IsAdminUser,) # Solo administradores pueden asignar roles
    serializer_class = RoleAssignmentSerializer # Para documentación

    def post(self, request, user_id, *args, **kwargs):
        # Asegurarse de que el usuario al que se le va a asignar el rol exista
        user_to_assign = get_object_or_404(UserModel, id=user_id)

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        role_name = serializer.validated_data['role_name']

        try:
            role = Role.objects.get(name=role_name)
            user_to_assign.role = role
            user_to_assign.save()
            return Response({"detail": f"Rol '{role.name}' asignado exitosamente al usuario '{user_to_assign.username}'."},
                            status=status.HTTP_200_OK)
        except Role.DoesNotExist:
            return Response({"detail": "El rol especificado no existe."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"Error al asignar rol: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
