module.exports = function(RED) {
    function ConnectionConfig(n) {
        RED.nodes.createNode(this, n);
        this.consumerKey = n.consumerKey;
        this.consumerSecret = n.consumerSecret;
        this.callbackUrl = n.callbackUrl;
        this.environment = n.environment;
        this.poturl = n.poturl;
        // Optional reading of username/password from environment
        if (n.useEnvCredentials) {
            const envUser = n.name + '_UserName';
            const envPassword = n.name + '_PassWord';
            this.username = process.env[envUser];
            this.password = process.env[envPassword];
        } else {
            this.username = n.username;
            this.password = n.password;
        }
    }
    RED.nodes.registerType('connection-config', ConnectionConfig);
};