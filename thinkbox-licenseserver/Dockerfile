FROM centos:7
LABEL maintainer="Alex Franks <alex-envoy@users.noreply.github.com>"

ARG LM_URL=https://aws-thinkbox.cdn.prismic.io/aws-thinkbox%2Fe5cf6123-6e6d-45ed-b1d8-8956eae68e95_manualinstall-11.13.1.2.0-linux64.tar.gz
ARG PUID=912
ARG PGID=912
ARG PORT_ARG=2708

RUN yum update -y && \
    yum install -y redhat-lsb-core wget && \
    yum clean all && \
    rm -rf /var/cache/yum

RUN groupadd -g $PGID flexlm && \
    useradd --create-home -s /bin/bash -u $PUID -g $PGID flexlm
WORKDIR /home/flexlm
USER flexlm

RUN wget -O lm.tgz ${LM_URL} && \
    tar xzvf lm.tgz && \
    rm -f lm.tgz

ENV PORT=${PORT_ARG}
VOLUME /licenses
EXPOSE ${PORT} 43887

ENV LM_LICENSE_FILE=/licenses \
    PATH=/home/flexlm/linux-64:${PATH}

CMD ["/home/flexlm/linux-64/lmgrd", "-z"]
