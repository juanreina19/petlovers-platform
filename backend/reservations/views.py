# reservations/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action # Para acciones personalizadas
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from datetime import date # Para validación de fechas
from .models import Reservation, ReservationStatus
from .serializers import ReservationSerializer, ReservationStatusSerializer

class ReservationStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para ver los estados de reserva disponibles.
    """
    queryset = ReservationStatus.objects.all().order_by('name')
    serializer_class = ReservationStatusSerializer
    permission_classes = [AllowAny]

class ReservationViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite a los usuarios gestionar sus propias reservas
    y a los administradores gestionar todas las reservas.
    """
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Reservation.objects.all().select_related('pet__user', 'status')
        return Reservation.objects.filter(pet__user=user).select_related('pet', 'status')

    def perform_create(self, serializer):
        # La lógica de asignación de 'pet' y 'status' ya está en el serializer.
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        reservation = get_object_or_404(Reservation, pk=pk)
        user = request.user

        if reservation.pet.user != user:
            return Response(
                {"detail": "No tienes permiso para cancelar esta reserva."},
                status=status.HTTP_403_FORBIDDEN
            )

        if reservation.start_date <= date.today():
            return Response(
                {"detail": "No se puede cancelar una reserva que ya ha iniciado o está en curso."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cancelled_status = ReservationStatus.objects.get(name='Cancelled')
        except ReservationStatus.DoesNotExist:
            return Response(
                {"detail": "El estado 'Cancelled' no está configurado. Contacte al administrador."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if reservation.status == cancelled_status:
            return Response(
                {"detail": "Esta reserva ya ha sido cancelada."},
                status=status.HTTP_200_OK
            )

        reservation.status = cancelled_status
        reservation.save()

        serializer = self.get_serializer(reservation)
        return Response(
            {"detail": "Reserva cancelada exitosamente.", "reservation": serializer.data},
            status=status.HTTP_200_OK
        )