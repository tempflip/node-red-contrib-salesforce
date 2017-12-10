const nforce = require('nforce');

module.exports = {
    createConnection: function(configOptions) {
        // create connection object
        const orgOptions = {
            clientId: configOptions.consumerKey,
            clientSecret: configOptions.consumerSecret,
            redirectUri: configOptions.callbackUrl,
            environment: configOptions.environment,
            mode: 'single'
        };

        // Overwrite the endpoints eventually - access instance directly
        if (configOptions.usePotUrl) {
            orgOptions.authEndpoint = configOptions.poturl;
            orgOptions.testAuthEndpoint = configOptions.poturl;
        }

        return nforce.createConnection(orgOptions);
    }
};