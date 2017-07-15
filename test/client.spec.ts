import {expect} from "chai";
import * as angular from "angular";
import "angular-mocks";
import DFQuery, {DFDefaultParamsMap, DFOrderDirection} from "../src/query";
import DFClientFactory from "../src/factory";
import DFClient from "../src/client";

describe('DFClient', function() {
    let factory:DFClientFactory;
    let client:DFClient;
    let map:DFDefaultParamsMap = new DFDefaultParamsMap();
    map.page = 'start';
    map.limit = 'stop';

    let query:DFQuery = new DFQuery('/test', 'GET', {
        page: 0,
        limit: 10,
        orderBy: 'testA',
        orderDirection: DFOrderDirection.ASC
    }, map);

    beforeEach(angular.mock.module('ae.datafree'));

    beforeEach(angular.mock.inject(($injector) => {
        factory = $injector.get('DFClientFactory');
        client = factory.createClient(query);
    }));

    it('should build valid params', function() {
        let params:any = client.buildQueryParams();

        expect(params.start).to.be.eq(0);
        expect(params.stop).to.be.eq(10);
        expect(params.order_by).to.be.eq('testA');
        expect(params.order_direction).to.be.eq(DFOrderDirection.ASC);
        expect(params.url).to.be.undefined;
        expect(params.method).to.be.undefined;
        expect(params).to.be.deep.eq({
            start: 0,
            stop: 10,
            order_by: 'testA',
            order_direction: DFOrderDirection.ASC
        });
    });
});