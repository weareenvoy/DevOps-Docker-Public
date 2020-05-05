Maxon Floating License Server Container Image
-----------------------------------------------

This image provides the [Maxon License Server](https://www.maxon.net/en-us/try/)

### Usage
#### Preparation
You can customize the service port used by the MLS service if needed, which defaults to `5264`. This can either be done directly in the Dockerfile, using an ENV named `MAXON_PORT` or in the DockerHub build interface.

Additional information regarding ports is available in the (very sparse) [Maxon Docs](https://support.maxon.net/kb/faq.php?id=54?id=54&lang=en-US)

#### Launch
The service automatically starts on the specified port (see `MAXON_PORT` ENV config above). You should be able to access the license server in a web browser at http://hostname:port using the default login of `admin`/`admin`

#### Maintenance
By default the Maxon license server will use `/var/opt/maxon/licenseserver` as the path into which it saves its running configuration. If you'd like to persist this configuration between restarts, you should save the contents of that directory to the Docker host machine and then mount it as a `VOLUME`. If you attempt to mount this volume before the licene server is up and running for the first time, the service will refuse to start.

If you're feeling brave you can also attempt to [configure SSL](https://support.maxon.net/kb/faq.php?id=56) for the service. You'll probably want to add the additional `g_runLicenseServerSSL=true` argument to the CMD command in the Dockerfile, and you might want to add a `VOLUME` to mount the `/opt/maxon/licenseserver/bin/resource/ssl` directory to a reasonable place on the Docker host if you don't want your certs overwritten when the container restarts.

**NOTE:** Attempts have been made to put an nginx reverse proxy in front of the MLS for TSL/SSL termination because this seems like the "right" way to do it, but the Basic Authentication challenge seems to fail, regardless of how this is configured in nginx.
