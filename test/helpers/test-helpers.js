/**
 * Created by alex.boyce on 4/6/17.
 */
require('../../dist/angular-datafree.min.js');

require('angular-mocks');
var chai = require('chai');
chai.use('sinon-chai');
chai.use('chai-as-promised');

var sinon = require('sinon');

beforeEach(function() {
    // Create a new sandbox before each test
    this.sinon = sinon.sandbox.create();
});

afterEach(function() {
    // Cleanup the sandbox to remove all the stubs
    this.sinon.restore();
});

module.exports = {
    rootUrl: 'http://localhost:9000',
    expect: chai.expect,
    should: chai.should
};