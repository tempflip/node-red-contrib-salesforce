/**
 * Tests for the connection configuration object
 */
const should = require('should');
const helper = require('node-red-node-test-helper');
const dmlNode = require('../dml.js');

helper.init(require.resolve('node-red'));

describe('Salesforce DML Node', function() {
  beforeEach(function(done) {
    helper.startServer(done);
  });

  afterEach(function(done) {
    helper.unload().then(function() {
      helper.stopServer(done);
    });
  });

  it('should be loaded', function(done) {
    const flow = [{ id: 'n1', type: 'dml', name: 'dml' }];
    helper.load(dmlNode, flow, function() {
      const n1 = helper.getNode('n1');
      should(n1).have.property('name', 'dml');
      done();
    });
  });

  /*
   * TODO:
   * Execute DML to mock server
   */
});
