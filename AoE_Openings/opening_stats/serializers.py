from opening_stats.models import Players, Openings, Matches, MatchPlayerActions, Patches
from rest_framework import serializers

class PlayersSerializer(serializers.ModelSerializer):
  id = serializers.IntegerField()
  class Meta:
    model = Players
    fields = ['id']

class PatchesSerializer(serializers.ModelSerializer):
  id = serializers.IntegerField()
  class Meta:
    model = Patches
    fields = ['id']

class OpeningsSerializer(serializers.ModelSerializer):
  class Meta:
    model = Openings
    fields = "__all__"

class MatchesSerializer(serializers.ModelSerializer):
  id = serializers.IntegerField()
  class Meta:
    model = Matches
    fields = "__all__"

class MatchPlayerActionsSerializer(serializers.ModelSerializer):
  class Meta:
    model = MatchPlayerActions
    fields = "__all__"

class MatchInputSerializer(serializers.Serializer):
  matches = MatchesSerializer(many=True)
  match_player_actions = MatchPlayerActionsSerializer(many=True)

class TestSerializer(serializers.Serializer):
  matches = serializers.CharField(max_length=200)
  pass

#
# We receive<3
# N matches, [match_player_actions]
# input = [
#      {match:match_dict, match_player_actions: [action1, action2...]},
#      {match:match_dict, match_player_actions: [action1, action2...]}
#  ]
#
#
#
