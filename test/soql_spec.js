/**
 * Tests for the connection configuration object
 */
const should = require('should');
const helper = require('node-red-node-test-helper');
const soqlNode = require('../soql.js');

helper.init(require.resolve('node-red'));

describe('Salesforce SOQL Node', function() {
  beforeEach(function(done) {
    helper.startServer(done);
  });

  afterEach(function(done) {
    helper.unload().then(function() {
      helper.stopServer(done);
    });
  });

  it('should be loaded', function(done) {
    const flow = [{ id: 'n1', type: 'sfdc-soql', name: 'soql' }];
    helper.load(soqlNode, flow, function() {
      const n1 = helper.getNode('n1');
      should(n1).have.property('name', 'soql');
      done();
    });
  });

  /*
   * TODO:
   * Execute SOQL to mock server
   */
});
