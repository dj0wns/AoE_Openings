# Generated by Django 3.2.5 on 2021-11-24 04:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('opening_stats', '0002_openingelotechs'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='matchplayeractions',
            unique_together={('match', 'player', 'event_type', 'event_id')},
        ),
    ]