# AoE_Openings


## How to Setup a Development Environment

```git clone --recurse-submodules https://github.com/dj0wns/AoE_Openings```

### Set up the Backend

Update Pip dependencies
```pip install -r requirements.txt```

###Set up a postgress database
Set up a postgres database and add the login to `AoE_Openings/AoE_Openings/settings.py`, similar to (https://docs.djangoproject.com/en/4.1/ref/databases/#postgresql-notes)[https://docs.djangoproject.com/en/4.1/ref/databases/#postgresql-notes]

Then after that is set up, use the `AoE_Openings/manage.py` script to init the db. To do this:
```python manage.py makemigrations
python manage.py migrate```

This should initialize the database for everything the backend needs to run.

Then modify some settings in AoE_Openings/settings.py to enable debug mode.
1. set `DEBUG = True`
2. add `127.0.0.1` to `ALLOWED_HOSTS`
3. provide `SECRET_KEY` with some gibberish

Lastly collect static to get all your static files in one place.
`python manage.py collectstatic`


Then try to run the backend:
1. `python manage.py run` should start the server on port 8000 and you should be able to connect to it `127.0.0.1:8000`
