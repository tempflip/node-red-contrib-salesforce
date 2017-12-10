module.exports = function(RED) {
    var nforce = require('./nforce_wrapper');

    function Streaming(config) {
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);
        var node = this;

        // create connection object
        const org = nforce.createConnection(this.connection);

        org.authenticate({ username: this.connection.username, password: this.connection.password }, function(err, oauth) {
            if (err) node.error(err);
            const opts = {};
            if (config.topicType === 'platform') {
                opts.isEvent = true;
            } else if (config.topicType === 'generic') {
                opts.isSystem = true;
            }
            opts.topic = config.pushTopic;
            var client = org.createStreamClient();
            var stream = client.subscribe(opts);
            node.log('Subscribing to topic: ' + config.pushTopic);

            stream.on('error', function(err) {
                node.log('Subscription error!!!');
                node.log(err);
                client.disconnect();
            });

            stream.on('data', function(data) {
                node.send({
                    payload: data
                });
            });
        });
    }
    RED.nodes.registerType('streaming', Streaming);
};