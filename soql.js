const nforce = require('./nforce_wrapper');

/**
 * Executes a SOQL query based on configuration and msg
 *
 * @param {node-red-node} node the current node
 * @param {msg} msg the incoming message
 */
const handleInput = (node, msg) => {
  const config = node.config;
  const connection = node.connection;

  // show initial status of progress
  nforce.connect(node, 'connecting...');

  // create connection object
  const orgResult = nforce.createConnection(connection, msg);
  const org = orgResult.org;
  const orgConfig = orgResult.config;
  // auth and run query
  nforce
    .authenticate(org, orgConfig, nforce.getOAuth(orgConfig))
    .then((oauth) => {
      nforce.setOAuth(oauth, orgConfig);
      // use msg query if provided
      const payload = {
        fetchAll: config.fetchAll,
        query: msg.query || config.query,
        oauth: oauth
      };

      return org.query(payload).catch((err) => nforce.error(node, msg, err));
    })
    .then((results) => {
      msg.payload = results.records.map((r) => r.toJSON());
      node.send(msg);
      node.status({});
    })
    .catch((err) => nforce.error(node, msg, err));
};

/* Make code available */
module.exports = function(RED) {
  function SoqlQuery(config) {
    const node = this;
    node.connection = RED.nodes.getNode(config.connection);
    node.config = config;
    this.on('input', (msg) => handleInput(node, msg));
    RED.nodes.createNode(node, config);
  }
  RED.nodes.registerType('soql', SoqlQuery);
};
