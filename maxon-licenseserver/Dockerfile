FROM centos/systemd
LABEL maintainer="Alex Franks <alex-envoy@users.noreply.github.com>"

# add this to build env in DockerHub if/when it changes
ARG RPM_URL_ARG=https://installer.maxon.net/installer/21.102_RBLicenseserver298191/maxonlicenseserver-21.102-298183.el7.x86_64.rpm
ARG PUID=913
ARG PGID=913
ARG UNAME=maxon
ARG MAXON_PORT_ARG=5264
ARG HOSTNAME_ARG=lvthn-cinemalic

RUN yum update -y
RUN yum clean all
RUN yum install -y redhat-lsb-core wget net-tools
RUN yum clean all;
RUN rm -rf /var/cache/yum
#### don't need this since centos generously provides a systemd image #### 
# clean up systemd since we "need" it, h/t https://serverfault.com/questions/824975/failed-to-get-d-bus-connection-operation-not-permitted
#RUN (cd /lib/systemd/system/sysinit.target.wants/; for i in *; do [ $i == systemd-tmpfiles-setup.service ] || rm -f $i; done)
#RUN rm -f /lib/systemd/system/multi-user.target.wants/*
#RUN rm -f /etc/systemd/system/*.wants/*
#RUN rm -f /lib/systemd/system/local-fs.target.wants/*
#RUN rm -f /lib/systemd/system/sockets.target.wants/*udev*
#RUN rm -f /lib/systemd/system/sockets.target.wants/*initctl*
#RUN rm -f /lib/systemd/system/basic.target.wants/*
#RUN rm -f /lib/systemd/system/anaconda.target.wants/*
#VOLUME /sys/fs/cgroup
#CMD /usr/sbin/init
###

#RUN ls -lh /lib64/libstdc*

RUN groupadd -g $PGID $UNAME 
RUN useradd --create-home -s /bin/bash -u $PUID -g $PGID $UNAME
USER $UNAME

ENV RPM_URL=${RPM_URL_ARG}
WORKDIR /tmp/$UNAME
RUN wget -O /tmp/$UNAME/maxon.rpm ${RPM_URL}
RUN yum install -y maxon.rpm
#RUN rm -f maxon.rpm

# these need to be writable
VOLUME /opt/maxon/licenseserver
VOLUME /var/opt/maxon/licenseserver
EXPOSE ${MAXON_PORT_ARG}

ENV HOSTNAME=${HOSTNAME_ARG}
ENV MAXON_PORT=${MAXON_PORT_ARG}

#ENV LM_LICENSE_FILE=/licenses
ENV PATH=/opt/$UNAME/licenseserver/bin:${PATH}
# add the maxon lib path to LD_LIBRARY_PATH
ENV LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/opt/maxon/licenseserver/lib64

WORKDIR /opt/maxon/licenseserver
RUN ls -lh /opt/maxon/licenseserver
CMD ["/opt/maxon/licenseserver/bin/licenseserver", "g_runLicenseServer=true"]
