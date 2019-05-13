/**
 * Tests for the connection configuration object
 */
const should = require('should');
const helper = require('node-red-node-test-helper');
const streamingNode = require('../streaming.js');

helper.init(require.resolve('node-red'));

describe('Salesforce Streaming Node', function() {
  beforeEach(function(done) {
    helper.startServer(done);
  });

  afterEach(function(done) {
    helper.unload().then(function() {
      helper.stopServer(done);
    });
  });

  it('should be loaded', function(done) {
    const flow = [{ id: 'n1', type: 'sfdc-streaming', name: 'streaming' }];
    helper.load(streamingNode, flow, function() {
      const n1 = helper.getNode('n1');
      should(n1).have.property('name', 'streaming');
      done();
    });
  });

  /*
   * TODO:
   * Execute DML to mock server
   */
});
