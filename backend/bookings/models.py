from django.db import models
from django.conf import settings
from services.models import Service
from accounts.models import ProviderProfile

class Booking(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
        ('Confirmed', 'Confirmed'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    )

    booking_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='received_bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='service_bookings')
    booking_date = models.DateField()
    booking_time = models.CharField(max_length=30)
    location_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    requirements = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    cancellation_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Prevent double-booking for same provider, date and time
        constraints = [
            models.UniqueConstraint(
                fields=['provider', 'booking_date', 'booking_time'],
                name='unique_provider_slot_booking',
                condition=~models.Q(status__in=['Cancelled', 'Rejected'])
            )
        ]
