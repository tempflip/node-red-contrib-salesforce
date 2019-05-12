/**
 * Contains common code pattern for Salesforce actions.
 * Used by actual nodes to achieve DRY
 */
const nforce = require('./nforce_wrapper');

const inputToSFAction = (node, msg, payloadHelper) => {
  const connection = node.connection;

  // show initial status of progress
  nforce.connect(node, 'connecting...');

  // create connection object
  const orgResult = nforce.createConnection(connection, msg);
  const org = orgResult.org;
  const orgConfig = orgResult.config;

  // Auth and run the specific action
  nforce
    .authenticate(org, orgConfig, nforce.getOAuth(orgConfig))
    .then((oauth) => {
      nforce.setOAuth(oauth, orgConfig);
      // Elements that we need in all payloads send to nForce
      let rawPayload = {
        oauth,
        apiVersion: orgConfig.apiversion
      };
      return payloadHelper(nforce, org, rawPayload);
    })
    .then((results) => {
      msg.payload = results;
      node.send(msg);
      node.status({});
    })
    .catch((err) => nforce.error(node, msg, err));
};

module.exports = { inputToSFAction };
