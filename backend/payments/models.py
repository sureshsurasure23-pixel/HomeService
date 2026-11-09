from django.db import models
from django.conf import settings
from bookings.models import Booking

class Payment(models.Model):
    METHOD_CHOICES = (
        ('Cash on Service', 'Cash on Service'),
        ('Online Payment', 'Online Payment'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    )

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=30, choices=METHOD_CHOICES)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    transaction_id = models.CharField(max_length=100, unique=True)
    gateway = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
