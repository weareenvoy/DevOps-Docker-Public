Okta On-Premises Provisioning Agent Container Image
---------------------------------------------------

This image provides the [Okta OPP agent](https://support.okta.com/help/Documentation/Knowledge_Article/29448976-Configuring-On-Premises-Provisioning#installing)


### Usage
The agent needs to be configured before use.

This will run the configure_agent.sh script and output the configuration file locally:
```
docker run -ti --rm -v $(pwd)/conf:/opt/OktaProvisioningAgent/conf weareenvoy/okta-opp-agent /opt/OktaProvisioningAgent/configure_agent.sh
```

This will run the agent using the generated configuration file:
```
docker run -d --name=okta-opp-agent -v $(pwd)/conf:/opt/OktaProvisioningAgent/conf weareenvoy/okta-opp-agent
```
