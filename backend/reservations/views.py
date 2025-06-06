# reservations/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from datetime import date
from django.db.models import Count, F # Importamos F para comparaciones de campos en anotaciones
from .models import Reservation, ReservationStatus
from .serializers import *


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
        queryset = Reservation.objects.all().select_related('pet__user', 'status')

        if user.is_staff:
            status_name = self.request.query_params.get('status', None)
            if status_name:
                queryset = queryset.filter(status__name__iexact=status_name)
            return queryset
        else:
            return queryset.filter(pet__user=user)

    def perform_create(self, serializer):
        reservation = serializer.save()
        print(f"Reserva creada para {reservation.pet.name}. ID: {reservation.id}. Confirmación enviada (simulada).")

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

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def analytics(self, request):
        """
        Devuelve la cantidad total de reservas por mascota o por usuario.
        Se puede filtrar por 'by=pet' o 'by=user'. Por defecto, agrupa por mascota.
        """
        group_by = request.query_params.get('by', 'pet')

        if group_by == 'pet':
            analytics_data = Reservation.objects.values(
                item_id=F('pet__id'),      # Nuevo alias: item_id
                item_name=F('pet__name')   # Nuevo alias: item_name
            ).annotate(
                total_reservations=Count('id')
            ).order_by('-total_reservations')
        elif group_by == 'user':
            analytics_data = Reservation.objects.values(
                item_id=F('pet__user__id'),       # Nuevo alias: item_id
                item_name=F('pet__user__username') # Nuevo alias: item_name
            ).annotate(
                total_reservations=Count('id')
            ).order_by('-total_reservations')
        else:
            return Response(
                {"detail": "Parámetro 'by' inválido. Use 'pet' o 'user'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ReservationCountSerializer(analytics_data, many=True)
        return Response(serializer.data)