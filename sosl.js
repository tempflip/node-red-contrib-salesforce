module.exports = function (RED) {
    const nforce = require('./nforce_wrapper');

    function SoslQuery(config) {
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);
        const node = this;
        this.on('input', function (msg) {
            // show initial status of progress
            node.status({ fill: 'green', shape: 'ring', text: 'connecting....' });

            // use msg query if node's query is blank
            const query = (msg.hasOwnProperty('query') && config.query === '')
                ? msg.query
                : config.query;

            // create connection object
            const orgResult = nforce.createConnection(this.connection);
            const org = orgResult.org;


            // auth and run query
            nforce
                .authenticate(org, orgResult.config)
                .then(oath => {
                    return org.search({ search: query });
                })
                .then(results => {
                    msg.payload = results.map(r => r.toJSON);
                    node.send(msg);
                    node.status({});
                })
                .catch(err => {
                    node.status({ fill: 'red', shape: 'dot', text: 'Error:' + e.message });
                    node.error(err, msg);
                });
            // auth and run query
            org
                .authenticate({ username: this.connection.username, password: this.connection.password })
                .then(function () {
                    return org.search({ search: query });
                })
                .then(function (results) {
                    msg.payload = {
                        size: results.length,
                        records: results
                    };
                    msg.payload = results;
                    node.send(msg);
                    node.status({});
                })
                .error(function (err) {
                    node.status({ fill: 'red', shape: 'dot', text: 'Error:' + err.message + '!' });
                    node.error(err, msg);
                });
        });
    }
    RED.nodes.registerType('sosl', SoslQuery);
};
