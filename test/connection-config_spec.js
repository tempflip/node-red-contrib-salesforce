/**
 * Tests for the connection configuration object
 */
const should = require('should');
const helper = require('node-red-node-test-helper');

helper.init(require.resolve('node-red'));

const RED = {
  nodes: {
    createNode: function(node, config) {
      should(node).not.be.null;
      should(config).not.be.null;
    },
    registerType: function(node, config) {
      should(node).not.be.null;
      should(config).not.be.null;
    }
  }
};

describe('Salesforce Configuration Node', function() {
  it('should be loaded', function(done) {
    require('../connection-config.js')(RED);
    done();
  });
});
