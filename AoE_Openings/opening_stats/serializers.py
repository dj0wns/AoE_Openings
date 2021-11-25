from opening_stats.models import Players, Openings, Matches
from rest_framework import serializers

class PlayerSerializer(serializers.ModelSerializer):
  class Meta:
    model = Players
    fields = ['name']

class OpeningsSerializer(serializers.ModelSerializer):
  class Meta:
    model = Openings
    fields = "__all__"

class MatchesSerializer(serializers.ModelSerializer):
  class Meta:
    model = Matches
    fields = "__all__"
