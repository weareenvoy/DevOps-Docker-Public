FROM centos:7
MAINTAINER Alex Franks <alex-envoy@users.noreply.github.com>

RUN yum update -y && \
    yum install -y https://weareenvoy-admin.okta.com/artifacts/OPP/02.00.15/OktaProvisioningAgent-02.00.15-5ccfa6b.x86_64.rpm && \
    yum clean all

RUN mv /opt/OktaProvisioningAgent/conf/settings.conf /opt/OktaProvisioningAgent/settings-default.conf

ADD start.sh /start.sh

VOLUME ["/opt/OktaProvisioningAgent/conf"]

CMD ["/start.sh"]
