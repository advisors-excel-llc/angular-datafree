/**
 * Created by alex.boyce on 4/6/17.
 */

require('../../dist/angular-datafree.min.js');

require('angular-mocks');
var chai = require('chai');
var should = chai.should;

describe('Datafree Client Factory', function() {
    var DFClientFactory, client, $httpBackend;

    before(module('ae.datafree'));
    before(inject(function($injector) {
        DFClientFactory = $injector('DFClientFactory');
        $httpBackend = $injector('$httpBackend');

        query = DFClientFactory.createQuery('/query');
        client = DFClientFactory.createClient();
    }));

    after(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should successfully create a client', function() {
        should.exist(client);
        should.exist(client.query);

        client.query.$page.should.be.equal(0);
        client.query.$limit.should.be.equal(10);
        client.query.$url.should.be.equal('/query');
        client.query.$method.should.be.equal('GET');
    });
});