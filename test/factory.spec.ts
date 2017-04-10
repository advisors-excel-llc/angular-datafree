/**
 * Created by alex.boyce on 4/7/17.
 */

import chai = require('chai');
import expect = chai.expect;
import * as angular from 'angular';
import {MockDataset, IMockData} from './mock-data';
import "angular-mocks";
import {DFClient, DFClientFactory} from "../src/factory";
import IHttpBackendService = angular.IHttpBackendService;
import IInjectorService = angular.auto.IInjectorService;
import DFQuery, {DFOrderDirection} from "../src/query";
import "../src/angular-datafree";
import {IHttpService, IPromise} from "angular";

describe('Datafree Client', () => {
    let client:DFClient;
    let dfFactory:DFClientFactory;
    let $httpBackend:IHttpBackendService;
    let backendHandler;
    let $http:IHttpService;
    let mockData = (new MockDataset()).data;

    beforeEach(angular.mock.module('ae.datafree'));

    beforeEach(inject(($injector) => {
        $http = $injector.get('$http');
        $httpBackend = $injector.get('$httpBackend');
        dfFactory = $injector.get('DFClientFactory');
        let query:DFQuery = new DFQuery('/query');

        client = dfFactory.createClient(query);

        backendHandler = $httpBackend.when('GET', /\/query/)
            .respond((method:string, url:string, d:string|Object, headers:Object, params?:any) => {
                let page = params.page;
                let limit = params.limit;
                let orderBy = params.order_by;
                let orderDir = params.order_dir;
                let filter = params.q;
                let md:Array<IMockData> = mockData;
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

                data = md.slice(start, start + limit);

                if (orderBy != null) {
                    data = data.sort(function(a:Object, b:Object) {
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

        let promise:IPromise<Array<Object>> = client.send();

        promise.then((data) => {
            expect(data).to.be.an('array');
            expect(data.length).to.be.eq(10);
            expect(client.$query.$total).to.be.eq(100);
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
});