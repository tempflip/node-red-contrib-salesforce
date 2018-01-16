module.exports = function(RED) {
    const nforce = require('./nforce_wrapper');
    
    // TODO: Add incoming connection to change
    // Subscription topic and provide credentials

    function Streaming(config) {
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);
        const node = this;

        // create connection object
        node.status({ fill: 'blue', shape: 'ring', text: 'connecting....' });
        const org = nforce.createConnection(this.connection);

        org.authenticate({ username: this.connection.username, password: this.connection.password }, function(err, oauth) {
            if (err) {
                node.status({ fill: 'red', shape: 'dot', text: 'Error:' + err.message });
                return node.error(err, msg);
            }
            const opts = {};
            if (config.topicType === 'platform') {
                opts.isEvent = true;
            } else if (config.topicType === 'generic') {
                opts.isSystem = true;
            }
            opts.topic = config.pushTopic;
            const client = org.createStreamClient();
            const stream = client.subscribe(opts);
            const subscriptionMessage = 'Subscription on ' + config.topicType + ' to:' + config.pushTopic;
            node.log(subscriptionMessage);
            node.status({ fill: 'blue', shape: 'dot', text: subscriptionMessage });
            stream.on('error', function(err) {
                node.log('Subscription error!!!');
                node.status({ fill: 'red', shape: 'dot', text: 'Error:' + err.message });
                node.log(err, msg);
                client.disconnect();
            });

            stream.on('data', function(data) {
                node.status({ fill: 'green', shape: 'dot', text: 'Receiving data' });
                node.send({
                    payload: data
                });
                node.status({ fill: 'blue', shape: 'dot', text: subscriptionMessage });
            });
        });
    }
    RED.nodes.registerType('streaming', Streaming);
};