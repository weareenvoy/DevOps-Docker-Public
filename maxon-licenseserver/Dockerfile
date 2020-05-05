FROM centos:7
LABEL maintainer="Alex Franks <alex-envoy@users.noreply.github.com>"

# add this to build env in DockerHub if/when it changes
ARG RPM_URL_ARG=https://installer.maxon.net/installer/21.102_RBLicenseserver298191/maxonlicenseserver-21.102-298183.el7.x86_64.rpm
ARG PUID=913
ARG PGID=913
ARG UNAME=maxon
ARG MAXON_PORT_ARG=5264
ARG HOSTNAME_ARG=lvthn-cinemalic

RUN yum update -y
RUN yum install -y redhat-lsb-core wget net-tools
RUN yum clean all
RUN rm -rf /var/cache/yum

ENV RPM_URL=${RPM_URL_ARG}
WORKDIR /tmp/$UNAME
RUN wget -O /tmp/$UNAME/maxon.rpm ${RPM_URL}
RUN yum install -y maxon.rpm
#RUN rm -f maxon.rpm

RUN groupadd -g $PGID $UNAME 
RUN useradd --create-home -s /bin/bash -u $PUID -g $PGID $UNAME
USER $UNAME

ENV HOSTNAME=${HOSTNAME_ARG}
ENV MAXON_PORT=${MAXON_PORT_ARG}
VOLUME /licenses
EXPOSE ${MAXON_PORT}

ENV LM_LICENSE_FILE=/licenses
ENV PATH=/opt/$UNAME/licenseserver:${PATH}

WORKDIR /opt/maxon/licenseserver
CMD ["/opt/maxon/licenseserver/bin/licenseserver", "g_runLicenseServer=true"]
