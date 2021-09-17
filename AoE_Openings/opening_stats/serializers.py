from opening_stats.models import Players, Openings
from rest_framework import serializers

class PlayerSerializer(serializers.ModelSerializer):
  class Meta:
    model = Players
    fields = ['name']

class OpeningsSerializer(serializers.ModelSerializer):
  class Meta:
    model = Openings
    fields = "__all__"
