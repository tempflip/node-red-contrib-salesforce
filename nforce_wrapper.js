const nforce8 = require('nforce8');

const createConnection = function (configOptionsRaw, msg) {
    // Update configOptions from msg if there's incoming credentials
    const configOptions = getConfig(configOptionsRaw, msg);
    msg = msg || {};
    const orgOptions = {
        mode: 'single',
        redirectUri: configOptions.callbackUrl,
        environment: configOptions.environment
    };

    // Overwrite the endpoints eventually - access instance directly
    if (configOptions.usePotUrl) {
        orgOptions.authEndpoint = configOptions.poturl;
        orgOptions.testAuthEndpoint = configOptions.poturl;
    }

    const connectionResult = nforce8.createConnection(orgOptions);
    const result = {
        connection: connectionResult,
        config: configOptions
    };

    return result;
};

// wrapper around the org.authenticate function
// TODO: Token authentication for Salesforce roundtrip
const authenticate = function (org, configOptions) {
    // TODO: Check if we have a incomign session
    return org.authenticate(configOptions);
};

/**
 * Define
 * @param {*} configOptions the current configuration settings
 * @param {*} msg the actual incoming message that might contain identity information
 */
const getConfig = function (configOptions, msg) {
    configOptions = configOptions || {};
    const connectionOptionResult = Object.assign({}, configOptions);
    //  Check if  credentials from message overwrite credentials from config
    if (configOptions.allowMsgCredentials && msg.hasOwnProperty("sf")) {
        //TODO: Do we really need to check for empty configuration values
        // or is it OK to overwrite when sf values are present?
        if (msg.sf.consumerKey && this.connection.consumerKey === '') {
            connectionOptionResult.consumerKey = msg.sf.consumerKey;
        }
        if (msg.sf.consumerSecret && this.connection.consumerSecret === '') {
            connectionOptionResult.consumerSecret = msg.sf.consumerSecret;
        }
        if (msg.sf.username && this.connection.username === '') {
            connectionOptionResult.username = msg.sf.username;
        }
        if (msg.sf.password && this.connection.password === '') {
            connectionOptionResult.password = msg.sf.password;
        }
    }

    return connectionOptionResult;
}

module.exports = {
    createConnection: createConnection,
    authenticate: authenticate
}