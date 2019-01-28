module.exports = function (RED) {

    var nforce = require('./nforce8_wrapper');

    function Dml(config) {
        RED.nodes.createNode(this, config);
        this.connection = RED.nodes.getNode(config.connection);
        var node = this;
        this.on('input', msg => {

            // show initial status of progress
            node.status({ fill: "green", shape: "ring", text: "connecting...." });

            // check for overriding message properties
            const theAction = (msg.hasOwnProperty("action") && config.action === '') ? msg.action : config.action;
            const theObject = (msg.hasOwnPropety("object") && config.object === '') ? msg.object : config.object;

            // create connection object
            const orgResult = nforce.createConnection(this.connection);
            const payload = nforce.force.createSObject(theObject, msg.payload);
            const sobj = { sobject: payload };

            // Auth and run DML
            nforce
                .authenticate(orgResult.org, orgResult.config)
                .then(oauth => {
                    let dmlResult;
                    const org = orgResult.org;
                    switch (theAction) {
                        case 'insert':
                            dmlResult = org.insert(sobj);
                            break;
                        case 'update':
                            dmlResult = org.update(sobj);
                            break;
                        case 'upsert':
                            if (msg.hasOwnProperty("externalId")) {
                                sobj.sobject.setExternalId(msg.externalId.field, msg.externalId.value);
                            }
                            dmlResult = org.upsert(sobj);
                            break;
                        case 'delete':
                            dmlResult = org.delete(sobj);
                            break;
                        default:
                            const err = new Error('Unknown method:' + theAction);
                            node.status({ fill: 'red', shape: 'dot', text: 'Unknown method:' + theAction });
                            node.error(err, msg);
                    }

                    return dmlResult;
                }).then(results => {
                    msg.payload = {
                        success: true,
                        object: theObject.toLowerCase(),
                        action: theAction,
                        id: (results.id) ? results.id
                            : (msg.externalId) ? msg.externalId
                                : msg.payload.id
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
    RED.nodes.registerType("dml", Dml);
};