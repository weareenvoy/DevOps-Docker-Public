#!/bin/bash

AgentInstallPrefix=$(rpm -q --queryformat '%{INSTPREFIXES}\n' OktaLDAPAgent|tail -1)
. $AgentInstallPrefix/scripts/defs.sh

if [ ! -f $AgentInstallPrefix/conf/logback.xml ]; then
    cp $AgentInstallPrefix/logback-default.xml $AgentInstallPrefix/conf/logback.xml
fi

configure_instructions()
{
    echo
    echo "Please configure your Okta LDAP Agent by running the script"
    echo "$AgentInstallPrefix/scripts/configure_agent.sh"
    echo
    echo "Docker command example:"
    echo "docker run -ti --rm -v \$(pwd)/conf:$AgentInstallPrefix/conf weareenvoy/okta-ldap-agent $AgentInstallPrefix/scripts/configure_agent.sh"
    echo
}

if [ ! -f $ConfigFile ]; then
    echo "Config file $ConfigFile not readable."
    configure_instructions
    exit 1
fi

$JAVA -Dlogback.configurationFile="$AgentInstallPrefix/conf/logback.xml" -Dagent_home="$AgentInstallPrefix" -jar $AgentJar -mode normal -configFilePath $ConfigFile
