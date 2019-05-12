const nforce = require('./nforce_wrapper');

/**
 * Executes a DML operation on a single object
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

  // check for overriding message properties
  // action and object overwrite the configured ones
  const theAction = msg.action ? msg.action : config.action;
  const theObject = msg.object ? msg.object : config.object;

  // Auth and run DML
  nforce
    .authenticate(org, orgConfig, nforce.getOAuth(orgConfig))
    .then((oauth) => {
      nforce.setOAuth(oauth, orgConfig);

      // Specific action
      const sobj = nforce.force.createSObject(theObject, msg.payload);
      const payload = { sobject: sobj };
      // Headers determine some of the behavior - we pass them on
      nforce.extractHeaders(payload, msg);

      let dmlResult;
      switch (theAction) {
        case 'insert':
          dmlResult = org.insert(payload);
          break;
        case 'update':
          dmlResult = org.update(payload);
          break;
        case 'upsert':
          if (msg.hasOwnProperty('externalId')) {
            sobj.sobject.setExternalId(msg.externalId.field, msg.externalId.value);
          }
          dmlResult = org.upsert(payload);
          break;
        case 'delete':
          dmlResult = org.delete(payload);
          break;
        default:
          // eslint-disable-next-line no-case-declarations
          const err = new Error('Unknown method:' + theAction);
          nforce.error(node, msg, err);
      }

      return dmlResult;
    })
    .then((results) => {
      msg.payload = {
        success: true,
        object: theObject.toLowerCase(),
        action: theAction,
        id: results.id ? results.id : msg.externalId ? msg.externalId : msg.payload.id
      };

      node.send(msg);
      node.status({});
    })
    .catch((err) => nforce.error(node, msg, err));
};

module.exports = function(RED) {
  function Dml(config) {
    this.connection = RED.nodes.getNode(config.connection);
    const node = this;
    this.on('input', (msg) => handleInput(node, msg));
    RED.nodes.createNode(this, config);
  }
  RED.nodes.registerType('dml', Dml);
};
