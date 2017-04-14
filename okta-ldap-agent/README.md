Okta LDAP Agent Container Image
-------------------------------

This image provides the [Okta LDAP agent](https://support.okta.com/help/Documentation/Knowledge_Article/87604166-LDAP-Agent-Deployment-Guide)


### Usage
The agent needs to be configured before use.

This will run the configure_agent.sh script and output the configuration file locally:
```
docker run -ti --rm -v $(pwd)/conf:/opt/Okta/OktaLDAPAgent/conf weareenvoy/okta-ldap-agent /opt/Okta/OktaLDAPAgent/scripts/configure_agent.sh
```

This will run the agent using the generated configuration file:
```
docker run -d --name=okta-opp-agent -v $(pwd)/conf:/opt/Okta/OktaLDAPAgent/conf weareenvoy/okta-ldap-agent
```
