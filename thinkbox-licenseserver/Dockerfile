FROM centos:7
LABEL maintainer="Alex Franks <alex-envoy@users.noreply.github.com>"

# add this to build env in DockerHub if/when it changes
ARG LM_URL=https://aws-thinkbox.cdn.prismic.io/aws-thinkbox%2Fe5cf6123-6e6d-45ed-b1d8-8956eae68e95_manualinstall-11.13.1.2.0-linux64.tar.gz
ARG PUID=912
ARG PGID=912
ARG THINKBOX_PORT_ARG=2708
ARG LMGRD_PORT_ARG=27008
ARG HOSTNAME_ARG=lvthn-lic02
# must specify MACADDR_ARG during container build!
ARG MACADDR_ARG

RUN yum update -y && \
    yum install -y redhat-lsb-core wget net-tools && \
    yum clean all && \
    rm -rf /var/cache/yum

RUN groupadd -g $PGID flexlm && \
    useradd --create-home -s /bin/bash -u $PUID -g $PGID flexlm
WORKDIR /home/flexlm
USER flexlm

RUN wget -O lm.tgz ${LM_URL} && \
    tar xzvf lm.tgz && \
    rm -f lm.tgz

ENV MACADDR=${MACADDR_ARG}
ENV HOSTNAME=${HOSTNAME_ARG}
ENV THINKBOX_PORT=${THINKBOX_PORT_ARG}
ENV LMGRD_PORT=${LMGRD_PORT_ARG}
VOLUME /licenses
EXPOSE ${THINKBOX_PORT} ${LMGRD_PORT}

ENV LM_LICENSE_FILE=/licenses \
    PATH=/home/flexlm/linux-x64:${PATH}

CMD ["/home/flexlm/linux-x64/lmgrd", "-z"]
