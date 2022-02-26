#This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
import uuid
from django.db import models

class AdvancedQueryResults(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    data = models.JSONField(null=False)

class AdvancedQueryQueue(models.Model):
    time = models.DateTimeField(auto_now_add=True)
    time_completed = models.DateTimeField(null=True)
    last_checkin = models.DateTimeField(auto_now_add=True)
    stale = models.BooleanField(default=False, null=True)
    result = models.ForeignKey('AdvancedQueryResults', on_delete=models.CASCADE, null=True)
    query = models.TextField()

    class Meta:
        db_table = 'advanced_query_queue'
        indexes = [
          models.Index(fields=['stale','query']),
          ]

class MatchPlayerActions(models.Model):
    match = models.ForeignKey('Matches', on_delete=models.CASCADE)
    player = models.ForeignKey('Players', on_delete=models.CASCADE)
    event_type = models.IntegerField()
    event_id = models.IntegerField()
    time = models.IntegerField()
    duration = models.IntegerField()

    class Meta:
        db_table = 'match_player_actions'
        unique_together = [['match', 'player', 'event_type', 'event_id']]


class Matches(models.Model):
    average_elo = models.IntegerField()
    map_id = models.IntegerField()
    time = models.DateTimeField(blank=True, null=True)
    patch_id = models.FloatField()
    ladder_id = models.IntegerField(blank=True, null=True)
    patch_number = models.IntegerField()
    player1 = models.ForeignKey('Players', on_delete=models.CASCADE, related_name='%(class)s_player1')
    player1_opening_flag0 = models.BooleanField()
    player1_opening_flag1 = models.BooleanField()
    player1_opening_flag2 = models.BooleanField()
    player1_opening_flag3 = models.BooleanField()
    player1_opening_flag4 = models.BooleanField()
    player1_opening_flag5 = models.BooleanField()
    player1_opening_flag6 = models.BooleanField()
    player1_opening_flag7 = models.BooleanField()
    player1_opening_flag8 = models.BooleanField()
    player1_opening_flag9 = models.BooleanField()
    player1_opening_flag10 = models.BooleanField()
    player1_opening_flag11 = models.BooleanField()
    player1_opening_flag12 = models.BooleanField()
    player1_opening_flag13 = models.BooleanField()
    player1_opening_flag14 = models.BooleanField()
    player1_opening_flag15 = models.BooleanField()
    player1_opening_flag16 = models.BooleanField()
    player1_opening_flag17 = models.BooleanField()
    player1_opening_flag18 = models.BooleanField()
    player1_opening_flag19 = models.BooleanField()
    player1_opening_flag20 = models.BooleanField()
    player1_opening_flag21 = models.BooleanField()
    player1_opening_flag22 = models.BooleanField()
    player1_opening_flag23 = models.BooleanField()
    player1_opening_flag24 = models.BooleanField()
    player1_opening_flag25 = models.BooleanField()
    player1_opening_flag26 = models.BooleanField()
    player1_opening_flag27 = models.BooleanField()
    player1_opening_flag28 = models.BooleanField()
    player1_opening_flag29 = models.BooleanField()
    player1_opening_flag30 = models.BooleanField()
    player1_opening_flag31 = models.BooleanField()
    player1_civilization = models.IntegerField()
    player1_victory = models.IntegerField()
    player1_parser_version = models.IntegerField()
    player2 = models.ForeignKey('Players', on_delete=models.CASCADE, related_name='%(class)s_player2')
    player2_opening_flag0 = models.BooleanField()
    player2_opening_flag1 = models.BooleanField()
    player2_opening_flag2 = models.BooleanField()
    player2_opening_flag3 = models.BooleanField()
    player2_opening_flag4 = models.BooleanField()
    player2_opening_flag5 = models.BooleanField()
    player2_opening_flag6 = models.BooleanField()
    player2_opening_flag7 = models.BooleanField()
    player2_opening_flag8 = models.BooleanField()
    player2_opening_flag9 = models.BooleanField()
    player2_opening_flag10 = models.BooleanField()
    player2_opening_flag11 = models.BooleanField()
    player2_opening_flag12 = models.BooleanField()
    player2_opening_flag13 = models.BooleanField()
    player2_opening_flag14 = models.BooleanField()
    player2_opening_flag15 = models.BooleanField()
    player2_opening_flag16 = models.BooleanField()
    player2_opening_flag17 = models.BooleanField()
    player2_opening_flag18 = models.BooleanField()
    player2_opening_flag19 = models.BooleanField()
    player2_opening_flag20 = models.BooleanField()
    player2_opening_flag21 = models.BooleanField()
    player2_opening_flag22 = models.BooleanField()
    player2_opening_flag23 = models.BooleanField()
    player2_opening_flag24 = models.BooleanField()
    player2_opening_flag25 = models.BooleanField()
    player2_opening_flag26 = models.BooleanField()
    player2_opening_flag27 = models.BooleanField()
    player2_opening_flag28 = models.BooleanField()
    player2_opening_flag29 = models.BooleanField()
    player2_opening_flag30 = models.BooleanField()
    player2_opening_flag31 = models.BooleanField()
    player2_civilization = models.IntegerField()
    player2_victory = models.IntegerField()
    player2_parser_version = models.IntegerField()

    class Meta:
        db_table = 'matches'


class Openings(models.Model):
    name = models.TextField()

    class Meta:
        db_table = 'openings'


class Players(models.Model):
    name = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'players'

#const table for storing specific tech names and ids
class Techs(models.Model):
  name = models.TextField()
  duration = models.IntegerField()

  class Meta:
    db_table = 'techs'

#const table for storing specific map names and ids
class Maps(models.Model):
  name = models.TextField()

  class Meta:
    db_table = 'maps'

#const table for storing specific ladder names and ids
class Ladders(models.Model):
  name = models.TextField()

  class Meta:
    db_table = 'ladders'

#const table for storing specific ladder names and ids
class Patches(models.Model):

  class Meta:
    db_table = 'patches'

class CivEloWins(models.Model):
  civilization = models.IntegerField()
  map_id = models.IntegerField()
  ladder_id = models.IntegerField()
  patch_number = models.IntegerField()
  elo = models.IntegerField()
  victory_count = models.IntegerField(default=0)
  loss_count = models.IntegerField(default=0)

  class Meta:
    db_table = 'civ_elo_wins'
    unique_together = [['civilization', 'map_id', 'ladder_id', 'patch_number', 'elo']]

class OpeningEloWins(models.Model):
  opening1_id = models.IntegerField()
  opening2_id = models.IntegerField()
  map_id = models.IntegerField()
  ladder_id = models.IntegerField()
  patch_number = models.IntegerField()
  elo = models.IntegerField()
  opening1_victory_count = models.IntegerField(default=0)
  opening1_loss_count = models.IntegerField(default=0)
  opening2_victory_count = models.IntegerField(default=0)
  opening2_loss_count = models.IntegerField(default=0)

  class Meta:
    db_table = 'opening_elo_wins'
    unique_together = [['opening1_id', 'opening2_id', 'map_id', 'ladder_id', 'patch_number', 'elo']]

class OpeningEloTechs(models.Model):
  opening_id = models.IntegerField()
  tech_id = models.IntegerField()
  map_id = models.IntegerField()
  ladder_id = models.IntegerField()
  patch_number = models.IntegerField()
  elo = models.IntegerField()
  average_time = models.FloatField(default=0.)
  count = models.IntegerField(default=0)

  class Meta:
    db_table = 'opening_elo_techs'
    unique_together = [['opening_id', 'tech_id', 'map_id', 'ladder_id', 'patch_number', 'elo']]

