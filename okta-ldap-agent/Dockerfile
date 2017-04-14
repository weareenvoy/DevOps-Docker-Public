FROM centos:7
MAINTAINER Aaron Picht <apicht@users.noreply.github.com>

RUN yum update -y && \
    yum install -y https://download.okta.com/static/ldap-agent/OktaLDAPAgent-05.02.05.x86_64.rpm && \
    yum clean all

RUN mv /opt/Okta/OktaLDAPAgent/conf/log4j.properties /opt/Okta/OktaLDAPAgent/log4j-default.properties

ADD start.sh /start.sh

VOLUME ["/opt/Okta/OktaLDAPAgent/conf"]

CMD ["/start.sh"]
