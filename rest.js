/**
 * Access the Generic Salesforce REST API = anything goes
 */

const handleInput = (node, msg) => {
  //TODO: Implement
};

module.exports = function(RED) {
  function Rest(config) {
    const node = this;
    node.connection = RED.nodes.getNode(config.connection);
    node.config = config;
    node.on('input', (msg) => handleInput(node, msg));
    RED.nodes.createNode(node, config);
  }
  RED.nodes.registerType('sfdc-rest', Rest);
};
