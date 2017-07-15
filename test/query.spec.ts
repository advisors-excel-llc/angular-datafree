import {expect} from "chai";
import {default as DFQuery, DFDefaultParamsMap, DFOrderDirection} from "../src/query";

describe('DFQuery', function() {
    it('should build a valid query', function() {
        let map:DFDefaultParamsMap = new DFDefaultParamsMap();
        map.page = 'start';
        map.limit = 'stop';

        let query:DFQuery = new DFQuery('/test', 'GET', {
            page: 0,
            limit: 10,
            orderBy: 'testA',
            orderDirection: DFOrderDirection.ASC
        }, map);

        expect(query.$page).to.be.eq(0);
        expect(query.$limit).to.be.eq(10);
        expect(query.$orderBy).to.be.eq('testA');
        expect(query.$orderDirection).to.be.eq(DFOrderDirection.ASC);
    });
});