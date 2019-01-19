module.exports = function (RED) {
    const nforce = require('./nforce_wrapper');

    function Query(config) {
        const node = this;
        RED.nodes.createNode(node, config);
        this.connection = RED.nodes.getNode(config.connection);

        this.on('input', function (msg) {
            // show initial status of progress
            node.status({ fill: 'green', shape: 'ring', text: 'connecting....' });

            // use msg query if node's query is blank
            // TODO: should the msg.query ALWAYS overwrite the config query of existent?
            var query = '';
            if (msg.hasOwnProperty('query') && config.query === '') {
                query = msg.query;
            } else {
                query = config.query;
            }

            // create connection object
            const orgResult = nforce.createConnection(this.connection);

            // auth and run query
            nforce
                .authenticate(orgResult.org, orgResult.config)
                .then(function () {
                    return org.query({ fetchAll: config.fetchAll, query: query }).catch(function (err) {
                        node.status({ fill: 'red', shape: 'dot', text: 'Error:' + e.message });
                        node.error(err, msg);
                    });
                })
                .then(function (results) {
                    if (config.returnJSON) {
                        msg.payload = results.records.map(function (record) {
                            return record.toJSON();
                        });
                    } else {
                        msg.payload = {
                            size: results.totalSize,
                            records: results.records
                        };
                    }
                    node.send(msg);
                    node.status({});
                })
                .catch(function (err) {
                    node.status({ fill: 'red', shape: 'dot', text: 'Error:' + e.message });
                    node.error(err, msg);
                });
        });
    }
    RED.nodes.registerType('soql', Query);
};
