# Migrate to new deployment

This file contains one-time steps to migrate from the initial deployment process to the newer one. The new process is documented in README.md.

We no longer copy files to a deployment directory before running them. To simplify things, we now run directly out of the repo directory.

Once this migration is done once, this file can be deleted.

Follow these instructions on _both_ the pi and the Windows machine. For Windows. All commands should be run in Git Bash.

## Remove the old deployment

- Remove car app from pm2

  If there are no other apps registered in pm2:

  ```bash
  pm2 stop all
  pm2 delete all
  pm2 save --force
  ```

  OR, if there are other apps you want to keep:

  ```bash
  pm2 list

  # Get name of the node app. It's probably "index".
  # Replace "index" in the next set of commands with the name you have.
  pm2 stop index
  pm2 delete index

  pm2 save --force
  ```

- Pi only: Remove old deployed directory

  ```bash
  rm -rf /home/pi/rccar-deployed/
  ```

- Windows only: Delete environment variables added in Windows System properties control panel.

## Setup new deployment

The following steps are copied from the "Configure controller/car app to run at startup" sections of README.md.

Create the file `.env` (ie., at `./packages/[app]/.env`). This will hold environment variables used when running the app. Set its contents to the following, modifying any of the values as needed:

For the Car app on the pi:

```ini
NODE_ENV=production
BRIDGE_SERVER_URL=https://jtb-rc-test.herokuapp.com
UDP_RECEIVE_PORT=9000
UDP_SEND_PORT=9001
LOG_LEVEL=info
TOKEN_SIGNING_SECRET=notasecret
```

For the Controller app on Windows:

```ini
NODE_ENV=production
PORT=3001 # Or whatever. You can use port 80 if available.
BRIDGE_SERVER_URL=https://jtb-rc-test.herokuapp.com/
UDP_RECEIVE_PORT=9000
UDP_SEND_PORT=9001
LOG_LEVEL=info
TOKEN_SIGNING_SECRET=notasecret
```

_Note: Any environment variable that is already set will take precedence over the `.env` file!_

Windows only: Open the file `./src/public/index.html` and set the value of the BRIDGE_SERVER_URL variable to the same as in the `.env` file above.

Run the install script (install.sh):

```bash
chmod +x ./install.sh
install.sh
```

The install script should end by asking you to reboot:

On the pi, you can do this from the command line:

```bash
sudo reboot
```

After the reboot completes, double-check that the app is running:

```bash
# Pi only - check that pm2 is running.
systemctl status pm2-pi

# Check that pm2 has started the app.
pm2 list

# Check the app logs for any errors.
pm2 logs
```

Deploying updates can now follow the instructions in README.md.
