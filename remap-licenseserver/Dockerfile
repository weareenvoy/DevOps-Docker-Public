FROM centos:7
LABEL maintainer="Alex Franks <alex-envoy@users.noreply.github.com>"

# add this to build env in DockerHub if/when it changes
ARG LIC_INSTALLER=https://revisionfx.com/wp-content/uploads/FloatingLicensing.tar.gz
ARG LIC_INSTALLER_BIN="RVLFloatLicenseSoftware-2.3-linux-x64-installer.run"
ARG LIC_INSTALLER_FILE="re_fls.tar.gz"
#ARG PUID=912
#ARG PGID=912
ARG REVISION_PORT_ARG=9412
#ARG RVLSERVER_PORT_ARG=27008
ARG HOSTNAME_ARG="lvthn-remaplic"
# must specify MACADDR_ARG during container build!
ARG MACADDR_ARG

RUN yum update -y && \
    yum install -y redhat-lsb-core wget net-tools && \
    yum clean all && \
    rm -rf /var/cache/yum

WORKDIR /root

RUN wget -O ${LIC_INSTALLER_FILE} ${LIC_INSTALLER} && \
    tar xzvf ${LIC_INSTALLER_FILE}

#RUN pwd && ls -lh
#RUN ./${LIC_INSTALLER_BIN} --help
RUN ./${LIC_INSTALLER_BIN} --mode unattended --unattendedmodeui none --acceptEULA 1

ENV MACADDR=${MACADDR_ARG}
ENV HOSTNAME=${HOSTNAME_ARG}
ENV REVISION_PORT=${REVISION_PORT_ARG}
#ENV RVLSERVER_PORT=${RVLSERVER_PORT_ARG}
#VOLUME /licenses
COPY *.lic /usr/local/revision/floatinglicenses/Licenses/
EXPOSE ${REVISION_PORT}

CMD ["/sbin/rvlserver"]
