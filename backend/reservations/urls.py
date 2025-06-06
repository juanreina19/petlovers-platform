# reservations/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet, ReservationStatusViewSet

router = DefaultRouter()
router.register(r'reservation-statuses', ReservationStatusViewSet, basename='reservation-status')
router.register(r'reservations', ReservationViewSet, basename='reservation')

urlpatterns = [
    path('', include(router.urls)),
]