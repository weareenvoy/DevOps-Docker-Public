FROM ubuntu:18.04

ARG AntMediaServerURL=https://artifacts.weareenvoy.net/docker-artifacts/ant-media-server-2.1.0-community-2.1.0-20200720_1340.zip
ARG AntMediaServerFile=ant-media-server.zip
ARG MongoDBServer=
ARG MongoDBUsername=
ARG MongoDBPassword=

RUN apt-get update
RUN apt-get install -y libcap2 wget net-tools

# pull from remote server instead
#ADD ./${AntMediaServer} /home

RUN cd home \
    && pwd \
    && wget https://raw.githubusercontent.com/ant-media/Scripts/master/install_ant-media-server.sh \
    && chmod 755 install_ant-media-server.sh

RUN cd home \
    && pwd \
	&& wget -O ${AntMediaServerFile} ${AntMediaServerURL}
    && ./install_ant-media-server.sh ${AntMediaServerFile}


RUN /bin/bash -c 'if [ ! -z "${MongoDBServer}" ]; then \
                    /usr/local/antmedia/change_server_mode.sh cluster ${MongoDBServer} ${MongoDBUsername} ${MongoDBPassword}; \
                 fi'

ENTRYPOINT service antmedia start && /bin/bash
