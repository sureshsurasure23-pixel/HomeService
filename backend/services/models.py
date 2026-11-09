from django.db import models
from accounts.models import ProviderProfile

class ServiceCategory(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default='Sparkles')
    image_url = models.URLField(max_length=500)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Service(models.Model):
    provider = models.ForeignKey(ProviderProfile, on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='services')
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_mins = models.PositiveIntegerField(default=60)
    image_url = models.URLField(max_length=500)
    features = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - ${self.price}"
