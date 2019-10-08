Keyshot Floating License Server Container Image
-----------------------------------------------

This image provides the [Keyshot License Server](https://luxion.atlassian.net/wiki/spaces/K8M/pages/311984257/Luxion+License+Server+Installation)

### Usage
#### Preparation
Edit your license file to specify the vendor port:
Find the below line and append `port=43387`

Before:
```
VENDOR LUXION
```

After:
```
VENDOR LUXION port=43887
```


Place license file(s) in a folder to be mapped into the container. If using multiple license files, ensure ports are unique and forwarded when creating container.

#### Launch
This will run the license server with the specified hostname and MAC address (must match license file):
```
docker run -d --restart=unless-stopped \
    --name=keyshot-licenseserver \
    --hostname=envoy-keylicserv \
    --mac-address=12:34:56:78:9a:bc \
    -v $(pwd)/licenses:/licenses \
    -p 27000:27000 -p 43887:43887 \
    weareenvoy/keyshot-licenseserver
```

This will output server/license status:
```
docker exec -ti keyshot-licenseserver lmstat -a
```
