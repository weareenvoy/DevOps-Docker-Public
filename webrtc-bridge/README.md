# RC Car

## Overview

This repo contains three nodejs server applications that together implement remote-controlling a car over a public internet connection.

The **Car** app runs on the Raspberry Pi that is attached to the actual car.

The **Controller** app runs on the Windows laptop where the XBox controller is used to control the car. In addition, it serves the HTML page containing the video player. The HTML page is intended to be opened in a browser from the Windows laptop.

The **Bridge** app runs in the cloud (currently at Heroku). All communication between the Car and the Controller is relayed through the Bridge using web sockets. This includes both the data produced by the XBox controller to control the car and the video stream from the pi's camera.

More details on each app are below.

## Controller app

- Sends data to the Car (via the Bridge).

  - Creates a web socket to the Bridge app.

    - Attempts to reconnect every 5 seconds if not open.

  - Hosts a UDP server that receives data produced by the XBox controller (via Touch Designer).

    - Each packet received by the UDP server is forwarded to the Car (via the Bridge) on the web socket.

- Serves the HTML page that is used to view video received from the Car.

  - The page is opened a browser on the Windows laptop (default: http://localhost:3001).

  - Loads the WSAvcPlayer video player (via the h264-live-player npm module). This player opens a web socket to the bridge. It sends start/stop message for the video to the Bridge when those buttons are clicked. When the player is started, each video frame is received as a web socket message from the Bridge.

  - _Note: Although this page is served by the Controller app, they are entirely independent. There is no direct communication between the Controller app and the HTML page._

### One-time Windows setup

_**NOTE: All commands are assumed to be run in bash. Git Bash is installed with Git**_

- Install git from https://git-scm.com/download/win

  Use defaults, except select the option to use the Windows Command window.

- Install node 12.x from nodejs.org

  On the "Tools for Native Modules" screen of the wizard, check the box. This will cause a script to run after the node install. The script needs you to press a key a couple of times to start. The script takes a while... Get coffee.

- Install pm2

  `npm install pm2 -g`

#### Configure Controller app to run at startup

Configure your credentials in git.

Clone the repo (update the path below!):

```bash
# ACTION REQUIRED: Change the following path to where you want the repo:
cd c:/path/to/where/you/want/the/repo

# Clone the repo.
git clone git@lvthn:tmobile/tmo-rc-car/webrtc.git

# Set working directory to the Controller app.
cd ./webrtc/packages/controller
```

Create the file `.env` (ie., at `./packages/controller/.env`). This will hold environment variables used when running the app. Set its contents to the following, modifying any of the values as needed:

```ini
NODE_ENV=production
PORT=3001
BRIDGE_SERVER_URL=https://lvthn-rc-server.herokuapp.com/
UDP_RECEIVE_PORT=9000
UDP_SEND_PORT=9001
TOKEN_SIGNING_SECRET=tmoexperience
LOG_LEVEL=info
```

_Note: Any environment variable that is already set will take precedence over the `.env` file!_

Open the file `./src/public/index.html` and set the value of the BRIDGE_SERVER_URL variable to the same as in the `.env` file above.

Run the install script:

```bash
chmod +x ./install.sh
install.sh
```

The install script should end by asking you to reboot.

After the reboot completes, double-check that everything is configured correctly:

```bash
# Check that pm2 has started the app.
pm2 list

# Check the app logs for any errors.
pm2 logs
```

### Deploy update to Windows

Set the working directory to `[repo root]/packages/controller`.

```bash
npm run update
```

This script stops the app in pm2, pulls the latest code, builds and restarts the app in pm2.

## Car app

- Creates a web socket to the Bridge app.

  - Attempts to reconnect every 5 seconds if not open.

- Receives control data from the Controller (via the Bridge).

  - Contains a UDP client for sending control data to the car.

    - Each UDP packet received from the Bridge is forwarded to the car using the UDP client.

- Sends data to the Controller (via the Bridge).

  - Hosts a UDP server that receives data produced by the car.

    - Each packet received by the UDP server is forwarded to the Controller (via the bridge) on the web socket.

- Receives video from the pi camera.

  - Each H.264 video frame is forwarded to the HTML page (via the Bridge).

  - Receives video start/stop web socket messages from the bridge.

    - So that video frames are not forwarded to the bridge when no one is watching.

### One-time pi setup

These instructions assume the user running the app is 'pi' and can run sudo. (This is the default setup in Raspbian OS.)

#### Update settings in raspi-config

- Enable camera.
- Set GPU memory to 256.
- Reboot.

#### Install nodejs

Install build tools for native npm modules.

```bash
sudo apt-get install -y gcc g++ make
```

Install nvm (to manage node versions)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
# ACTION REQUIRED: exit and restart bash
nvm install 10 # v12 should work also
node --version # should report v10.x (v10.22 or later)
```

#### Configure car app to run at startup

Configure your credentials in git.

Clone the repo (update the path below!):

```bash
# ACTION REQUIRED: Change the following path to where you want the repo:
cd /home/pi/path/to/where/you/want/the/repo

# Clone the repo.
git clone git@lvthn:tmobile/tmo-rc-car/webrtc.git

# Set working directory to the Car app.
cd ./webrtc/packages/car
```

Create the file `.env` (ie., at `./packages/car/.env`). This will hold environment variables used when running the app. Set its contents to the following, modifying any of the values as needed:

```ini
NODE_ENV=production
BRIDGE_SERVER_URL=https://lvthn-rc-server.herokuapp.com
UDP_RECEIVE_PORT=9000
UDP_SEND_PORT=9001
TOKEN_SIGNING_SECRET=tmoexperience
LOG_LEVEL=info
```

_Note: Any environment variable that is already set will take precedence over the `.env` file!_

Run the install script:

```bash
chmod +x ./install.sh
install.sh
```

The install script should end by asking you to reboot:

```bash
sudo reboot
```

After the reboot completes, double-check that everything is configured correctly:

```bash
# Check that pm2 is running. Should list 'car-app'
systemctl status pm2-pi

# Check that pm2 has started the app.
pm2 list

# Check the app logs for any errors.
pm2 logs
```

### Deploy update to pi

Set the working directory to `[repo root]/packages/car`.

```bash
npm run update
```

This script stops the app in pm2, pulls the latest code, builds and restarts the app in pm2.

## Bridge app

- Hosts a web socket server.

  - Authenticates the Controller and Car apps before accepting web socket messages.

    - Use json web tokens (JWTs). Car and Controller each create a token and send it when a web socket is opened. This requires a secret (random value) to be shared by all three apps. The secret is used to sign the token so the Bridge can verify it.

  - Forwards UDP packets (each wrapped in a web socket message) to the destination app using a web socket. Each web socket message has a "target" property identifying the app that it should be forwarded to.

  - Forwards video frames received from the Car to the HTML page.

  - Receives video start/stop web socket messages from the HTML page.

    - Forwards these to the Car, so that video frames are only sent when the HTML video player is connected.

### One-time Heroku setup

Install heroku cli from https://devcenter.heroku.com/articles/heroku-cli

Run the commands below:

- Replace `lvthn-rc-server` as the app name in the examples. You will need to use a unique app name.
- Replace `<random value>` and `<dyno type>` in the script below.
  - Documentation of dyno types: https://devcenter.heroku.com/articles/dyno-types
  - Use at least "hobby" (\$7/month) because the free version will sleep after a while. It can take 10+ seconds to spin up on first request after sleep. Also, there is a max number of hours per month.
  - To get resource monitoring (CPU, RAM, etc.) use at least "standard-1x (\$25/month)

```bash
# Authenticate with Heroku. This will open a browser for you to login.
heroku login

# Create a new Heroku app and set environment variables.
heroku apps:create lvthn-rc-server
heroku config:set --app lvthn-rc-server NPM_CONFIG_PRODUCTION=false # To handle our build correctly.
heroku config:set --app lvthn-rc-server TOKEN_SIGNING_SECRET=<random value>
heroku config:set --app lvthn-rc-server LOG_LEVEL=info

# Create a git remote for Heroku.
git remote add heroku https://git.heroku.com/lvthn-rc-server.git

# Get the latest code.
git pull origin main

# Deploy - this will initially use a free dyno (instances).
# You will see the build output.
git push heroku main

# Change dyno type:
heroku scale --app lvthn-rc-server web.1:<dyno type>
```

### Deploy update to heroku

```
git pull origin main
git push heroku main
```

The build happens at Heroku after the code is pushed. The app will only be deployed if the build succeeds.

Heroku looks for `build` and `start` scripts in a `package.json` file in the repo root. All these do is run the correct commands to build and start the Bridge app.

### Heroku tips

- In addition to setting environment variables using the `heroku` cli, you can set them in the web Dashboard (in the Settings tab).

- Add the free version of the Papertrail add-on to the app (in the Dashboard or with `heroku --app lvthn-rc-server addons:create papertrail`)

  While uou can view the tail of the logs in Heroku (in the "More" menu at the top right), even the free version of Papertrail will store GB worth of logs for a couple days, and has a robust search feature. The only downside is that new log entries only appear after a deloy of a few seconds.

## Local development

Prerequisites for local development:

- nodejs v12.x.x
- A Raspberry Pi. The Car app must run on a pi, because it attempts to call `raspivid` to get video from the camera module.
- The Bridge app can be run anywhere (including on the pi), as long as its IP address is reachable by both Car and Controller apps.

_Note: If you are developing on the same devices where you have installed pm2 for production, you must stop the pm2 processes with 'pm2 stop all' before you run 'npm run dev', or you will likely have port conflicts._

### One-time setup

Clone the repo on the pi and on the machine(s) where you will run the Bridge and Controller apps.

```bash
# ACTION REQUIRED: Change the following path to where you want the repo:
cd /path/to/the/repo

# Clone the repo.
git clone git@lvthn:tmobile/tmo-rc-car/webrtc.git
```

The `.env` files below contain environment variables. Any existing env vars will take precedence. `.env` files will **not** override existing values.

On the machine where you will run the Controller, create the file `./packages/controller/.env` containing:

```ini
NODE_ENV=development
PORT=3001 # Where the HTML page will be served.
BRIDGE_SERVER_URL=http://x.x.x.x:3000 # Update to the IP:port of the Bridge app.
UDP_RECEIVE_PORT=9000 # Where Touch Designer sends control packets.
UDP_SEND_PORT=9001 # Where Touch Designer receives ACKs of control packets.
TOKEN_SIGNING_SECRET=foo # Must match value in other apps in this environment.
LOG_LEVEL=debug
```

On the pi, create the file `./packages/car/.env` containing:

```ini
NODE_ENV=development
BRIDGE_SERVER_URL=http://x.x.x.x:3000 # Update to the IP:port of the Bridge app.
UDP_RECEIVE_PORT=9010 # Where car receives control packets.
UDP_SEND_PORT=9011 # Where car sends ACKs of control packets.
TOKEN_SIGNING_SECRET=foo # Must match value in other apps in this environment.
LOG_LEVEL=debug
```

On the machine where you will run the Bridge, create the file `./packages/bridge/.env` containing:

```ini
NODE_ENV=development
PORT=3000 # Where the web socket server will be hosted.
TOKEN_SIGNING_SECRET=foo # Must match value in other apps in this environment.
LOG_LEVEL=debug
```

### Running the apps

To run each app, you must set the working directory to that app (e.g., `./packages/car` for the Car app).

When pulling new changes to the repo:

```bash
cd ./packages/controller
git pull origin main
npm install
npm run dev
```

Changes you make to the `.env` file or `.ts` files in that app's directory will initiate a rebuild and restart the app. You can also force a restart by typing `rs` and hitting Enter in the terminal.

_Note: On the pi, the file change watchers may run out of resources. If you see that warning when starting the Car app, you will have to stop the app (Ctrl-C) and rerun `npm run dev` in order to pick up code changes._

Additional npm scripts you can run. _Always stop the app before running these._

```bash
# Delete ./lib (the built .js files)
npm run clean

# Delete ./lib and ./node_modules
# You must reinstall dependencies running purge.
npm run purge
npm install
```

In the Controller app only, there is also a `send` script to send test UDP packets. It will send a packet once each second until you stop the script (Ctrl-C).

```bash
# You must pass a single string argument.
npm run send "foo"
```

## Logging

### Contents

Logs are formatted as JSON and written to stdout (including errors). Each entry has a timestamp, message, log level, and usually additional data related to the log entry.

Log verbosity is controlled by the LOG_LEVEL environment variable:

- "info" - Logs important app startup message, important state changes (e.g., web socket status), and errors that indicate a major problem.

- "debug" - Also logs statistics about frames and udp packets sent/received - every 5 seconds. Logs errors that occur during processing of individual video frames or udp packets.

- "silly" - Logs contents of each udp packet, and first 8 bytes of each video frame.

### Viewing

In development, you will see the logs in the terminal where you ran the app.

In production, the Car and Controller apps are run by `pm2`, which copies stdout to a file. For complete info, see https://pm2.keymetrics.io/docs/usage/log-management/.

```bash
# For all these commands, the app name is optional.
# If omitted, pm2 will show logs for all processes it is managing.

# View logs examples:
pm2 logs controller-app
pm2 logs car-app
pm2 logs

# Flush logs examples - deletes all logs.
# Logs are also flushed each time you run "npm run update".
pm2 flush controller-app
pm2 flush car-app
pm2 flush
```
