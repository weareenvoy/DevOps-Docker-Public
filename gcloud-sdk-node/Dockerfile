FROM google/cloud-sdk:latest
LABEL maintainer="Alex Franks <alex-envoy@users.noreply.github.com>"

# Software Installation - adding node, npm, yarn
RUN curl -sSL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update
RUN apt-get install -y --no-install-recommends groff nodejs
RUN apt-get clean
RUN npm install --global yarn

# this will need to be specified for gcloud/gsutil to work properly
ARG GCP_AUTH_KEY_PATH
