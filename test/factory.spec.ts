/**
 * Created by alex.boyce on 4/7/17.
 */

import {expect} from "chai";
import * as angular from 'angular';
import {MockDataset, IMockData} from './mock-data';
import "angular-mocks";
import {DFClientFactory} from "../src/factory";
import DFClient from "../src/client";
import DFQuery, {DFDataResponseType, DFOrderDirection} from "../src/query";
import "../src/angular-datafree";
import {IHttpBackendService, IHttpService, IPromise} from "angular";

describe('Datafree Client Body', () => {
    let client:DFClient;
    let dfFactory:DFClientFactory;
    let $httpBackend:IHttpBackendService;
    let $http:IHttpService;

    beforeEach(angular.mock.module('ae.datafree'));

    beforeEach(angular.mock.inject(($injector) => {
        $http = $injector.get('$http');
        $httpBackend = $injector.get('$httpBackend');
        dfFactory = $injector.get('DFClientFactory');
        let query:DFQuery = new DFQuery('/query');

        client = dfFactory.createClient(query);

        $httpBackend.when('GET', /\/query/)
            .respond((method:string, url:string, d:string|Object, headers:Object, params?:any) => {
                let page = parseInt(params.page, 10);
                let limit = parseInt(params.limit, 10);
                let orderBy = params.order_by;
                let orderDir = params.order_direction;
                let filter = params.q;
                let md:Array<IMockData> = MockDataset.data;
                let data:Array<IMockData>;
                let start:number = page * limit;

                if (angular.isDefined(filter)) {
                    let rx:RegExp = new RegExp(filter, 'gi');
                    md = md.filter(function(item) {
                        for (let key of Object.keys(item)) {
                            if (rx.test(item[key])) {
                                return true;
                            }
                        }

                        return false;
                    });
                }

                if (orderBy != null) {
                    md = md.sort(function(a:Object, b:Object) {
                        if (a.hasOwnProperty(orderBy) && b.hasOwnProperty(orderBy)) {
                            if (a[orderBy] > b[orderBy]) {
                                return orderDir == DFOrderDirection.DESC ? -1 : 1;
                            } else if (a[orderBy] < b[orderBy]) {
                                return orderDir == DFOrderDirection.DESC ? 1 : -1;
                            }
                        }

                        return 0;
                    });
                }

                data = md.slice(start, start + limit);

                headers['X-Count'] = md.length;

                return [
                    200,
                    data,
                    headers,
                    'Ok'
                ];
            })
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be instantiated', () => {
        expect(client).to.be.ok;
        expect(client.$query).to.be.ok;

        expect(client.$query.$page).to.be.eq(0);
        expect(client.$query.$limit).to.be.eq(10);
        expect(client.$query.$url).to.be.eq('/query');
        expect(client.$query.$method).to.be.eq('GET');
    });

    it('should get a response from the backend', function(done:Function) {
        $httpBackend.expectGET(/\/query/);

        expect($http({
            method:'GET',
            url: '/query',
            params: {
                page: 0,
                limit: 10
            }
        }).then((res) => {
            expect(res.headers('X-Count')).to.be.eq('100');
            done();
        }, (res) => {
            done(res);
        })).to.be.fulfilled;

        $httpBackend.flush();
    });

    it('should get first page', (done:Function) => {
        $httpBackend.expectGET(/\/query/);

        client.$query.$orderBy = 'id';
        client.$query.$orderDirection = DFOrderDirection.ASC;

        let promise:IPromise<Array<Object>> = client.first();

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(10);
            expect(client.$query.$total).to.be.eq(100);

            let ids:Array<number> = data.map((item:IMockData) => {
                return item.id;
            });

            expect(ids).to.have.members([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

            done();
        }, (response) => {
            done(response);
        });

        expect(promise).to.be.fulfilled;

        $httpBackend.flush();
    });

    it ('should subscribe to changes', (done:Function) => {
        $httpBackend.expectGET(/\/query/);

        client.subscribe((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(10);
            expect(client.$query.$total).to.be.eq(100);
            done();
        });

        expect(client.send()).to.be.fulfilled;

        $httpBackend.flush();
    });

    it('should get second page', (done:Function) => {
        $httpBackend.expectGET(/\/query/);

        let promise:IPromise<Array<Object>> = client.next();

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(10);
            expect(client.$query.$total).to.be.eq(100);

            let ids:Array<number> = data.map((item:IMockData) => {
                return item.id;
            });

            expect(ids).to.have.members([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

            done();
        }, (response) => {
            done(response);
        });

        expect(promise).to.be.fulfilled;

        $httpBackend.flush();
    });

    it('should get last page', (done:Function) => {
        $httpBackend.expectGET(/\/query/);

        let promise:IPromise<Array<Object>> = client.last();

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(10);
            expect(client.$query.$total).to.be.eq(100);

            let ids:Array<number> = data.map((item:IMockData) => {
                return item.id;
            });

            expect(ids).to.have.members([91, 92, 93, 94, 95, 96, 97, 98, 99, 100]);

            done();
        }, (response) => {
            done(response);
        });

        expect(promise).to.be.fulfilled;

        $httpBackend.flush();
    });

    it('should filter just the women', (done:Function) => {
        $httpBackend.expectGET(/\/query/);

        let promise:IPromise<Array<Object>> = client.filter('Female');

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(10);
            expect(client.$query.$total).to.be.eq(56);
            done();
        });

        expect(promise).to.be.fulfilled;

        $httpBackend.flush();
    });

    it('should get change the limit', (done:Function) => {
        $httpBackend.expectGET(/\/query/);

        let promise:IPromise<Array<Object>> = client.limit(20);

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(20);
            expect(client.$query.$total).to.be.eq(100);

            let ids:Array<number> = data.map((item:IMockData) => {
                return item.id;
            });

            expect(ids).to.have.members([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

            done();
        }, (response) => {
            done(response);
        });

        expect(promise).to.be.fulfilled;

        $httpBackend.flush();
    });

    it('should get order the results by first_name ASC', (done:Function) => {
        $httpBackend.expectGET(/\/query/);

        let promise:IPromise<Array<Object>> = client.order('first_name', DFOrderDirection.ASC);

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(10);
            expect(client.$query.$total).to.be.eq(100);

            let ids:Array<number> = data.map((item:IMockData) => {
                return item.id;
            });

            expect(ids).to.have.members([18, 59, 28, 60, 15, 72, 47, 2, 86, 31]);

            done();
        }, (response) => {
            done(response);
        });

        expect(promise).to.be.fulfilled;

        $httpBackend.flush();
    });

    it('should get order the results by first_name DESC', (done:Function) => {
        $httpBackend.expectGET(/\/query/);

        let promise:IPromise<Array<Object>> = client.order('first_name', DFOrderDirection.DESC);

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(10);
            expect(client.$query.$total).to.be.eq(100);

            let ids:Array<number> = data.map((item:IMockData) => {
                return item.id;
            });

            expect(ids).to.have.members([69, 4, 48, 80, 55, 67, 30, 6, 19, 79]);

            done();
        }, (response) => {
            done(response);
        });

        expect(promise).to.be.fulfilled;

        $httpBackend.flush();
    });
});

describe('Datafree Client Property', () => {
    let client: DFClient;
    let dfFactory: DFClientFactory;
    let $httpBackend: IHttpBackendService;
    let $http: IHttpService;

    beforeEach(angular.mock.module('ae.datafree'));

    beforeEach(angular.mock.inject(($injector) => {
        $http = $injector.get('$http');
        $httpBackend = $injector.get('$httpBackend');
        dfFactory = $injector.get('DFClientFactory');
        let query: DFQuery = new DFQuery('/query');

        query.$dataResponseType = DFDataResponseType.PROPERTY;
        query.$dataProperty = 'data';
        query.$countProperty = 'count';

        client = dfFactory.createClient(query);

        $httpBackend.when('GET', /\/query/)
            .respond((method: string, url: string, d: string | Object, headers: Object, params?: any) => {
                let page = parseInt(params.page, 10);
                let limit = parseInt(params.limit, 10);
                let orderBy = params.order_by;
                let orderDir = params.order_direction;
                let filter = params.q;
                let md: Array<IMockData> = MockDataset.data;
                let data: Object;
                let start: number = page * limit;

                if (angular.isDefined(filter)) {
                    let rx: RegExp = new RegExp(filter, 'gi');
                    md = md.filter(function (item) {
                        for (let key of Object.keys(item)) {
                            if (rx.test(item[key])) {
                                return true;
                            }
                        }

                        return false;
                    });
                }

                if (orderBy != null) {
                    md = md.sort(function (a: Object, b: Object) {
                        if (a.hasOwnProperty(orderBy) && b.hasOwnProperty(orderBy)) {
                            if (a[orderBy] > b[orderBy]) {
                                return orderDir == DFOrderDirection.DESC ? -1 : 1;
                            } else if (a[orderBy] < b[orderBy]) {
                                return orderDir == DFOrderDirection.DESC ? 1 : -1;
                            }
                        }

                        return 0;
                    });
                }

                data = {
                    'data' : md.slice(start, start + limit),
                    'count': md.length
                };

                return [
                    200,
                    data,
                    headers,
                    'Ok'
                ];
            })
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be instantiated', () => {
        expect(client).to.be.ok;
        expect(client.$query).to.be.ok;

        expect(client.$query.$page).to.be.eq(0);
        expect(client.$query.$limit).to.be.eq(10);
        expect(client.$query.$url).to.be.eq('/query');
        expect(client.$query.$method).to.be.eq('GET');
        expect(client.$query.$dataResponseType).to.be.eq(DFDataResponseType.PROPERTY);
        expect(client.$query.$dataProperty).to.be.eq('data');
        expect(client.$query.$countProperty).to.be.eq('count');
    });

    it('should get a response from the backend', function (done: Function) {
        $httpBackend.expectGET(/\/query/);

        expect($http({
            method: 'GET',
            url: '/query',
            params: {
                page: 0,
                limit: 10
            }
        }).then((res:any) => {
            expect(res.data).to.have.hasOwnProperty('data');
            expect(res.data).to.have.hasOwnProperty('count');
            expect(res.data.data).to.be.an('array');
            done();
        }, (res) => {
            done(res);
        })).to.be.fulfilled;

        $httpBackend.flush();
    });

    it('should get first page', (done: Function) => {
        $httpBackend.expectGET(/\/query/);

        client.$query.$orderBy = 'id';
        client.$query.$orderDirection = DFOrderDirection.ASC;

        let promise: IPromise<Array<Object>> = client.first();

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(10);
            expect(client.$query.$total).to.be.eq(100);

            let ids: Array<number> = data.map((item: IMockData) => {
                return item.id;
            });

            expect(ids).to.have.members([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

            done();
        }, (response) => {
            done(response);
        });

        expect(promise).to.be.fulfilled;

        $httpBackend.flush();
    });

    it('should get change the limit', (done:Function) => {
        $httpBackend.expectGET(/\/query/);

        let promise:IPromise<Array<Object>> = client.limit(20);

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(20);
            expect(client.$query.$total).to.be.eq(100);

            let ids:Array<number> = data.map((item:IMockData) => {
                return item.id;
            });

            expect(ids).to.have.members([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

            done();
        }, (response) => {
            done(response);
        });

        expect(promise).to.be.fulfilled;

        $httpBackend.flush();
    });
});