/**
 * Creates a JWT Session for a given userid
 * handle with utmost care!!
 */

const handleInput = (node, msg) => {
  //TODO: Implement
  const userId = msg.userId;
};

// Make available to NodeRED
module.exports = function(RED) {
  function JwtSession(config) {
    const node = this;
    node.config = config;
    node.connection = RED.nodes.getNode(config.connection);
    node.on('input', (msg) => handleInput(node, msg));
    RED.nodes.createNode(node, config);
  }
  RED.nodes.registerType('sfdc-jwt', JwtSession);
};
