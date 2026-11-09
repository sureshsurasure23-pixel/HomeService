from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('provider', 'Service Provider'),
        ('admin', 'Administrator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class ProviderProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='provider_profile')
    business_name = models.CharField(max_length=200)
    bio = models.TextField()
    experience_years = models.PositiveIntegerField(default=1)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=35.00)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    total_reviews = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    id_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
