const actionHelper = require('./lib/action_helper');

//array to back-up the node & disconnect the streaming client when redeploying flow
const clients = {};

/**
 * Configure and/or reset a subscription node
 * @param {NodeRED node} node - the Subscription Node
 * @param {Node configuration object} config the stored configuration
 */
const setupSubscriptionNode = (node, config) => {
  node.config = config;
  node.subscriptionActive = false;
  node.client = {}; // The faye client
  // back-up the node and disconnect/clean-up when
  // redeploying flow to avoid duplicated subscription
  if (!clients[node.id]) {
    clients[node.id] = node;
    node.startSubscriptionId = config.replayId;
  } else {
    // On redeployment we want to start
    node.startSubscriptionId = clients[node.id].lastReceivedId || config.replayId;
    if (clients[node.id].client.disconnect) {
      clients[node.id].client.disconnect();
      clients[node.id] = node;
    }
  }

  actionHelper.idle(node);
};

const handleStreamError = (node, err) => {
  node.log('Subscription error!!!');
  actionHelper.error(node, err.message, err);
  node.client.disconnect();
  node.subscriptionActive = false;
  return node.error(err, err.message);
};

const handleStreamData = (node, data) => {
  const lastReplayId = node.lastReplayId || node.startSubscriptionId;
  const newReplayId = data.event.replayId;
  if (lastReplayId === newReplayId) {
    // TODO: should a duplicate replay Error be swallowed?
    const err = new Error('Duplicate replay id');
    actionHelper.error(node, newReplayId, err);
    return;
  }
  actionHelper.receiving(node);
  node.send({
    payload: data
  });
  actionHelper.subscribed(node, node.subscriptionMessage);
};

const createSubscription = (node, org, msg, resolve, reject) => {
  if (node.subscriptionActive) {
    if (node.config.resubScribeOnDoubeSubscription) {
      // Terminate subscription first, ignore the resolve/reject
      terminateSubscription(node, () => {}, () => {});
    } else {
      // We don't subscribe again
      resolve();
      return;
    }
  }
  const config = node.config;
  const subscriptionOpts = {
    // Topic in message takes priority over configuration
    topic: msg.topic || config.pushTopic,
    replayId: msg.replayId || node.startSubscriptionId
  };

  try {
    node.subscriptionMessage = 'Subscribed to:' + subscriptionOpts.topic;
    node.client = org.createStreamClient();
    const stream = node.client.subscribe(subscriptionOpts);
    node.log(node.subscriptionMessage);
    node.subscriptionActive = true;
    stream.on('error', (err) => handleStreamError(node, err));
    stream.on('data', (data) => handleStreamData(node, data));
  } catch (ex) {
    reject(ex);
  }

  actionHelper.subscribed(node, node.subscriptionMessage);
  resolve();
};

const terminateSubscription = (node, resolve, reject) => {
  // Terminate in any case
  if (node.subscriptionActive) {
    node.subscriptionActive = false;
    try {
      if (node.client.disconnect) {
        node.client.disconnect();
        node.status({ fill: 'gray', shape: 'ring', text: 'idle' });
        resolve();
      }
    } catch (err) {
      reject(err);
    }
  } else {
    // Nothing to do for an inactive connection
    resolve();
  }
};

const handleInput = (node, msg) => {
  const action = msg.action || (node.subscriptionActive ? 'unsubscribe' : 'subscribe');
  const realAction = (org) => {
    return new Promise((resolve, reject) => {
      if (action === 'subscribe') {
        createSubscription(node, org, msg, resolve, reject);
      } else {
        terminateSubscription(node, resolve, reject);
      }
    });
  };
  actionHelper.inputToSFAction(node, msg, realAction);
};

// Make available to NodeRED
module.exports = function(RED) {
  function Streaming(config) {
    const node = this;
    node.connection = RED.nodes.getNode(config.connection);
    setupSubscriptionNode(node, config);
    node.on('input', (msg) => handleInput(node, msg));
    RED.nodes.createNode(node, config);
  }
  RED.nodes.registerType('streaming', Streaming);
};
