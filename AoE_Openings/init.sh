#!/bin/bash

#set up db
python manage.py makemigrations
python manage.py migrate

#add in fixtures
python manage.py loaddata opening_stats/fixtures/batch1.json
