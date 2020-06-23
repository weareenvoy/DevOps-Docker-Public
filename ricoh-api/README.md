# Ricoh Printer API

## Overview
This API will manage users on the printers configured in ricohapi/config.py. By default it will list users in the first printer provided, but this can be overridden by adding ?printer=1 (where 1 is the index in the config list). add and delete operations will add/delete on all printers. The identifier of users should be their email address.

* `GET /users` Get a complete list of users
* `GET /users/{id}` Get a specific user. Ex: `GET /users/scott@weareenvoy.com`
* `POST /users` Create a new user. Payload ex: {"userid": "99","name": "Scott Roach","displayName": "Scott Roach","email": "sroach@weareenvoy.com"}. Returns 201 on success or a 409 when the user already exists
* `DELETE /users/{id}` Delete a specific user. Ex: `DELETE /users/scott@weareenvoy.com`. Returns a 204.

## Installing and running
### Local
Clone the repo and create your virtualenv `mkvirtualenv -p /usr/local/bin/python3 ricohapi` and install requirements `pip install -r requirements.txt`.

You can then run the app by exporting a few vars and running flask. `export FLASK_APP=ricohapi/api.py; export FLASK_DEBUG=1; flask run`

### Production
Clone the project in /var/www/ricohapi (or modify the service file).

Create the virtualenv `virtualenv -p python3 venv`, source the venv `source venv/bin/activate`, and install requirements `pip install -r requirements.txt`.

Then we can run our systemd service `sudo ln -s /var/www/ricohapi/ricohapi.service /etc/systemd/system/` and `sudo systemctl start ricohapi && sudo systemctl enable ricohapi`.

You will need to have Nginx proxy requests to /tmp/ricohapi.sock

### Docker
To run with the dockerfile follow these steps:
1. `docker build -t envoy-ricoh-api .`
1. `docker run envoy-ricoh-api`

To get the docker file onto the synology follow these steps:
1. `docker build -t envoy-ricoh-api .`
1. `docker save envoy-ricoh-api > envoy-ricoh-api.tar`
1. Upload it to a directory on the synology.
1. Navigate to Docker > Image > Add > From File and select the file that you uploaded in the previous step.
1. Select the newly created docker image and click `Launch` and configure your settings.