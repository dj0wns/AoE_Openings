# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class MatchPlayerActions(models.Model):
    match_player_id = models.IntegerField()
    event_type = models.IntegerField()
    event_id = models.IntegerField()
    time = models.IntegerField()
    duration = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'match_player_actions'


class MatchPlayers(models.Model):
    player_id = models.IntegerField()
    match_id = models.IntegerField()
    opening_id = models.IntegerField(blank=True, null=True)
    civilization = models.IntegerField(blank=True, null=True)
    victory = models.IntegerField(blank=True, null=True)
    parser_version = models.IntegerField(blank=True, null=True)
    time_parsed = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'match_players'


class Matches(models.Model):
    average_elo = models.IntegerField()
    map_id = models.IntegerField()
    time = models.DateTimeField(blank=True, null=True)
    patch_id = models.TextField(blank=True, null=True)  # This field type is a guess.
    ladder_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'matches'


class Openings(models.Model):
    name = models.TextField()

    class Meta:
        managed = False
        db_table = 'openings'


class Players(models.Model):
    name = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'players'
