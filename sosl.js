module.exports = function(RED) {
    const nforce = require('./nforce_wrapper');

    function Query(config) {
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);
        const node = this;
        var query = '';
        this.on('input', function(msg) {
            // show initial status of progress
            node.status({ fill: 'green', shape: 'ring', text: 'connecting....' });

            // use msg query if node's query is blank
            if (msg.hasOwnProperty('query') && config.query === '') {
                query = msg.query;
            } else {
                query = config.query;
            }

            // create connection object
            const org = nforce.createConnection(this.connection);

            // auth and run query
            org
                .authenticate({ username: this.connection.username, password: this.connection.password })
                .then(function() {
                    return org.search({ search: query });
                })
                .then(function(results) {
                    msg.payload = {
                        size: results.length,
                        records: results
                    };
                    msg.payload = results;
                    node.send(msg);
                    node.status({});
                })
                .error(function(err) {
                    node.status({ fill: 'red', shape: 'dot', text: 'Error:' + err.message + '!' });
                    node.error(err, msg);
                });
        });
    }
    RED.nodes.registerType('sosl', Query);
};