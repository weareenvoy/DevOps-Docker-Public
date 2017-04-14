#!/bin/bash

AgentInstallPrefix=$(rpm -q --queryformat '%{INSTPREFIXES}\n' OktaProvisioningAgent|tail -1)
. $AgentInstallPrefix/defs.sh
if [ -f $AgentInstallPrefix/conf/settings.conf ]; then
    . $AgentInstallPrefix/conf/settings.conf
else
    . $AgentInstallPrefix/settings-default.conf
fi

configure_instructions()
{
    echo
    echo "Please configure your Okta Provisioning Agent by running the script"
    echo "Production:"
    echo "$AgentInstallPrefix/configure_agent.sh"
    echo
    echo "OR"
    echo
    echo "Dev:"
    echo "$AgentInstallPrefix/configure_agent.sh -d"
    echo
    echo "Docker command example:"
    echo "docker run -ti --rm -v \$(pwd)/conf:$AgentInstallPrefix/conf weareenvoy/okta-opp-agent $AgentInstallPrefix/configure_agent.sh"
    echo
}

if [ ! -f $ConfigFile ]; then
    echo "Config file $ConfigFile not readable."
    configure_instructions
    exit 1
fi

$JAVA -Dagent_home=${AgentInstallPrefix} $JAVA_OPTS -jar $AgentJar -mode normal -configFilePath $ConfigFile
