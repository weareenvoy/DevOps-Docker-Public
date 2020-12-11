#!/bin/bash
set -eo pipefail
IFS=$'\n\t'

THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ "$THIS_DIR" = "${PWD}" ]; then
  echo
else
  echo "ERROR: The working directory must be ./packages/controller"
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
npm install pm2@latest pm2-windows-startup@latest -g

echo
echo '----- Registering the app with pm2... -----'
pm2 start --name controller-app ./lib/index.js

echo
echo '----- Configuring pm2 to run at startup... -----'
pm2-startup install

echo
echo '----- Saving pm2 configuration... -----'
pm2 save

echo
echo '--------------------------------------------------'
echo 'Controller application configured to run at startup.'

echo '--------------------------------------------------'
echo
echo 'REBOOT NOW TO START THE APP.'
