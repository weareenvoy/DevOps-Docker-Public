Thinkbox Deadline Floating License Server Container Image
-----------------------------------------------

This image provides the [Thinkbox License Server](https://www.awsthinkbox.com/license-server-download)

### Usage
#### Preparation
Edit your license file to specify the vendor port:
Find the below line and append `port=2708`

Before:
```
VENDOR thinkbox
```

After:
```
VENDOR thinkbox port=2708
```


Place license file(s) in a folder to be mapped into the container. If using multiple license files, ensure ports are unique and forwarded when creating container.

#### Launch
This will run the license server with the specified hostname and MAC address (must match license file):
```
docker run -d --restart=unless-stopped \
    --name=thinkbox-licenseserver \
    --hostname=lvthn-lic02 \
    --mac-address=90:e6:ba:a6:57:04 \
    -v $(pwd)/licenses:/licenses \
    -p 2708:2708 -p 43887:43887 \
    weareenvoy/thinkbox-licenseserver
```

This will output server/license status:
```
docker exec -ti thinkbox-licenseserver lmstat -a
```
