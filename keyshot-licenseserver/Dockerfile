FROM centos:7
LABEL maintainer="Alex Franks <alex-envoy@users.noreply.github.com>"

ARG LM_URL=https://www.keyshot.com/download/347154/
ARG PUID=911
ARG PGID=911

RUN yum update -y && \
    yum install -y redhat-lsb-core unzip wget && \
    yum clean all && \
    rm -rf /var/cache/yum

RUN groupadd -g $PGID flexlm && \
    useradd --create-home -s /bin/bash -u $PUID -g $PGID flexlm
WORKDIR /home/flexlm
USER flexlm

RUN wget -O lm.zip ${LM_URL} && \
    unzip lm.zip && \
    rm -f lm.zip

VOLUME /licenses
EXPOSE 27000 43887

ENV LM_LICENSE_FILE=/licenses \
    PATH=/home/flexlm/luxion_flexlm:${PATH}

CMD ["/home/flexlm/luxion_flexlm/lmgrd", "-z"]
