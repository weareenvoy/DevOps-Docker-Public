Thinkbox Deadline Floating License Server Container Image
-----------------------------------------------

This image provides the [Thinkbox License Server](https://www.awsthinkbox.com/license-server-download)

### Usage
#### Preparation
Edit your license file to specify the Thinkbox vendor ports:
Find the lines below and append `port=2708`

Before:
```
VENDOR thinkbox
```

After:
```
VENDOR thinkbox port=2708
```

You can also customize the service port used by the LMGRD service if needed, which defaults to 27000:
Before:
```
SERVER HOSTNAME MACADDRESS 27000
```

After:
```
SERVER HOSTNAME MACADDRESS 27008
```

Additional information regarding ports is available in the [Thinkbox Docs](https://docs.thinkboxsoftware.com/products/licensing/1.0/Licensing%20Guide/setport.html)

Just as the port numbers are customizable when running the container, the MAC address and hostname can either be specified upon container build or at runtime.  **NOTE** These need to match what is already present in the license file provided from Thinkbox, or the services will refuse to start. Check the logs in the container if it starts cleanly but the service is not available on the specified ports.

Place license file(s) in a folder to be mapped into the `/licenses` path in the container. If using multiple license files, ensure ports are unique and forwarded when creating container.

#### Launch
This will run the license server with the specified hostname and MAC address (must match MAC address present in license file):
```
docker run -d --restart=unless-stopped \
    -e "MACADDR=ab:cd:ef:01:23:45" \
    -e "HOSTNAME=hostname" \
    -e "LMGRD_PORT=#####" \
    -e "THINKBOX_PORT=####" \
    --name=thinkbox-licenseserver \
    --hostname=${HOSTNAME} \
    --mac-address=${MACADDR} \
    -v $(pwd)/licenses:/licenses \
    -p ${THINKBOX_PORT}:${THINKBOX_PORT} -p ${LMGRD_PORT}:${LMGRD_PORT} \
    weareenvoy/thinkbox-licenseserver
```

This will output server/license status:
```
docker exec -ti thinkbox-licenseserver lmstat -a
```
