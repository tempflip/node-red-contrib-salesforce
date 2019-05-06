/**
 * Tests for the connection configuration object
 */
const should = require('should');
const helper = require('node-red-node-test-helper');
const soslNode = require('../sosl.js');

helper.init(require.resolve('node-red'));

describe('Salesforce SOSL Node', function() {
  beforeEach(function(done) {
    helper.startServer(done);
  });

  afterEach(function(done) {
    helper.unload().then(function() {
      helper.stopServer(done);
    });
  });

  it('should be loaded', function(done) {
    const flow = [{ id: 'n1', type: 'sosl', name: 'sosl' }];
    helper.load(soslNode, flow, function() {
      const n1 = helper.getNode('n1');
      should(n1).have.property('name', 'sosl');
      done();
    });
  });

  /*
   * TODO:
   * Execute SOSL to mock server
   */
});
