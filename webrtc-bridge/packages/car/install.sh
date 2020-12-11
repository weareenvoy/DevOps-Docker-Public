#!/bin/bash
set -eo pipefail
IFS=$'\n\t'

THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ "$THIS_DIR" = "${PWD}" ]; then
  echo
else
  echo "ERROR: The working directory must be ./packages/car"
  exit 1
fi

echo
echo '----- Installing dependencies listed in package.json... -----'
npm install

echo
echo '----- Building the app... -----'
npm run build

echo
echo '----- Installing pm2... -----'
npm install pm2@latest -g

echo
echo '----- Registering the app with pm2... -----'
pm2 start --name car-app ./lib/index.js

echo
echo '----- Configuring pm2 to run at startup... -----'
eval $(pm2 startup systemd | tail -n1)

echo
echo '----- Saving pm2 configuration... -----'
pm2 save

echo
echo '--------------------------------------------------'
echo 'Car application configured to run at startup.'

echo '--------------------------------------------------'
echo
echo 'REBOOT NOW TO START THE APP:'
echo '   sudo reboot'

# change to make git happy
