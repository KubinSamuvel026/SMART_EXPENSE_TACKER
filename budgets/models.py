from django.db import models
from django.conf import settings

class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.CharField(max_length=20)
    monthly_limit = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.user} - {self.category}"
