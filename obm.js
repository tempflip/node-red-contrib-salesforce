module.exports = function (RED) {
    var parser = require('xml2js').parseString;

    function ParseObm(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        this.on('input', msg => {
            parser(msg.payload, (err, result) => {
                if (err) {
                    node.error(err, msg);
                    node.status({ fill: 'red', shape: 'dot', text: 'Error parsing XML.' });
                } else {
                    // TODO: debulkify incoming messages ??
                    const returnMsg = Object.assign({}, msg);
                    const httpMsg = Object.assign({}, msg);
                    try {
                        // get rid of the stuff we don't need
                        const root = result['soapenv:Envelope']['soapenv:Body'][0].notifications[0];
                        const data = root.Notification[0].sObject[0];
                        // start building payload
                        returnMsg.payload = {
                            organizationId: root.OrganizationId[0],
                            actionId: root.ActionId[0],
                            type: data.$['xsi:type'].split(':')[1],
                            sobject: {}
                        };
                        // check for a sessionId
                        if (Array.isArray(root.SessionId)) {
                            returnMsg.payload.sessionId = root.SessionId[0];
                        }
                        // look at each node and see if it contains an array with data
                        for (let [key, val] of Object.entries(data)) {
                            if (Array.isArray(val)) {
                                returnMsg.payload.sobject[key.split(':')[1].toLowerCase()] = val[0];
                            }
                        };
                        // Prepare the return message for http
                        if (httpMsg.headers) {
                            httpMsg.headers['Content-Type'] = 'application/xml';
                        } else {
                            httpMsg.headers = {
                                "Content-Type": "application/xml"
                            };
                        }

                        httpMsg.payload = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
        <soapenv:Body>
            <notificationsResponse xmlns="http://soap.sforce.com/2005/09/outbound">
                <Ack>true</Ack>
           </notificationsResponse>
        </soapenv:Body>
    </soapenv:Envelope>`;
                        node.send([returnMsg, httpMsg]);
                        node.status({});
                    } catch (err) {
                        node.status({ fill: 'red', shape: 'dot', text: 'Error!' });
                        node.error(err, msg);
                    }
                }
            });
        });
    }
    RED.nodes.registerType('obm', ParseObm);
};