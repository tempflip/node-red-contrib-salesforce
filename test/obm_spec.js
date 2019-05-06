/**
 * Tests for the connection configuration object
 */
const should = require('should');
const helper = require('node-red-node-test-helper');
const obmNode = require('../obm.js');

helper.init(require.resolve('node-red'));

describe('Salesforce OBM Node', function() {
  beforeEach(function(done) {
    helper.startServer(done);
  });

  afterEach(function(done) {
    helper.unload().then(function() {
      helper.stopServer(done);
    });
  });

  it('should be loaded', function(done) {
    const flow = [{ id: 'n1', type: 'obm', name: 'obm' }];
    helper.load(obmNode, flow, function() {
      const n1 = helper.getNode('n1');
      should(n1).have.property('name', 'obm');
      done();
    });
  });

  it('should return a SOAP message', (done) => {
    const flow = [{ id: 'n1', type: 'obm', name: 'obm', wires: [[], ['n2']] }, { id: 'n2', type: 'helper' }];
    helper.load(obmNode, flow, () => {
      var n2 = helper.getNode('n2');
      var n1 = helper.getNode('n1');
      n2.on('input', function(msg) {
        msg.should.have.property(
          'payload',
          `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
        <soapenv:Body>
            <notificationsResponse xmlns="http://soap.sforce.com/2005/09/outbound">
                <Ack>true</Ack>
           </notificationsResponse>
        </soapenv:Body>
    </soapenv:Envelope>`
        );
        done();
      });
      n1.receive({
        payload: `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<soapenv:Body>
  <notifications xmlns="http://soap.sforce.com/2005/09/outbound">
   <OrganizationId>00D1XXXXXXXXXX</OrganizationId>
   <ActionId>04kXXXXXXXXXXXXXX</ActionId>
   <SessionId xsi:nil="true"/>
   <EnterpriseUrl>https://<instance>.salesforce.com/services/Soap/c/34.0/00DXXXXXXXXXX</EnterpriseUrl>
   <PartnerUrl>https://<instance>.salesforce.com/services/Soap/u/34.0/00DXXXXXXXXXX</PartnerUrl>
   <Notification>
    <Id>04XXXXXXXXXXXXXXX</Id>
    <sObject xsi:type="sf:<Object APi Name>" xmlns:sf="urn:sobject.enterprise.soap.sforce.com">
     <sf:Id>a34XXXXXXXXXXXXXXX</sf:Id>
     <sf:Status__c>Complete</sf:Status__c>
     <sf:ID__c>325625</sf:ID__c>
     <sf:Name>Test Message</sf:Name>
     <sf:O_Id__c>1525888</sf:O_Id__c>
    </sObject>
   </Notification>
  </notifications>
</soapenv:Body>
</soapenv:Envelope>`
      });
    });
    done();
  });
});
