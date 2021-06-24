FROM google/cloud-sdk:latest
LABEL maintainer="Alex Franks <alex-envoy@users.noreply.github.com>"

# Software Installation
RUN curl -sSL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update
RUN apt-get install -y --no-install-recommends python3 python3-pip python3-setuptools groff less curl nodejs
RUN apt-get clean
RUN npm install --global yarn

# this will need to be specified
ARG GCP_AUTH_KEY_PATH
