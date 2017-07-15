import {expect} from "chai";
import * as angular from 'angular';
import {MockDataset, IMockData} from './mock-data';
import "angular-mocks";
import DFQuery, {DFOrderDirection} from "../src/query";
import "../src/angular-datafree";
import {IRootScopeService, IScope, ITemplateCacheService, IHttpBackendService} from "angular";
import DFClientFactory from "../src/factory";
import DFClient from "../src/client";

describe('Datafree Directive', function() {
    let scope:IScope;
    let dfElement:JQuery;
    let dfPager:JQuery;
    let $httpBackend:IHttpBackendService;

    beforeEach(angular.mock.module('ae.datafree'));

    beforeEach(angular.mock.inject(function ($injector) {
        let $rootScope:IRootScopeService = $injector.get('$rootScope');
        let $templateCache:ITemplateCacheService = $injector.get('$templateCache');

        $templateCache.put('datafree-pager.html', '<ul class="datafree-pager">' +
            '<li ng-if="$pager.showFirst"' +
            ' ng-click="$pager.first()" ng-class="{\'disabled\': $pager.currentPage == 1}">' +
            '{{ $pager.firstLabel }}' +
            '</li>' +
            '<li ng-if="$pager.showPrev" ng-click="$pager.prev()" ng-class="{\'disabled\': $pager.currentPage == 1}">' +
            '{{ $pager.prevLabel }}' +
            '</li>' +
            '<li ng-if="$pager.currentPage > $pager.numberLimit"' +
            ' ng-click="$pager.page(Math.max(1, $pager.currentPage - $pager.numberLimit))">' +
            '&hellip;' +
            '</li>' +
            '<li ng-repeat="number in $pager.numbers" ng-click="$pager.page(number)"' +
            ' ng-class="{\'active\': $pager.currentPage == number}">' +
            '{{ number }}' +
            '</li>' +
            '<li ng-if="$pager.currentPage <= $pager.maxPages - $pager.numberLimit"' +
            ' ng-click="$pager.page(Math.min($pager.maxPages, $pager.currentPage + $pager.numberLimit))">' +
            '&hellip;' +
            '</li>' +
            '<li ng-if="$pager.showNext" ng-click="$pager.next()"' +
            ' ng-class="{\'disabled\': $pager.currentPage == $pager.maxPages}">' +
            '{{ $pager.nextLabel }}' +
            '</li>' +
            '<li ng-if="$pager.showLast" ng-click="$pager.last()"' +
            ' ng-class="{\'disabled\': $pager.currentPage == $pager.maxPages}">' +
            '{{ $pager.lastLabel }}' +
            '</li>' +
            '</ul>');

        scope = $rootScope.$new();
        $httpBackend = $injector.get('$httpBackend');

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
            });
    }));

    let compileDirecive:Function = (template:string) => {
        angular.mock.inject(function($compile) {
            dfElement = $compile(template)(scope);
            dfPager = dfElement.find('datafree-pager');
        });

        scope.$digest();
    };

    it('should render the first page', function() {
        let template:string = '<datafree query="query">' +
            '<table>' +
            '<thead>' +
            '<th datafree-order="id">ID</th>' +
            '<th datafree-order="first_name">First Name</th>' +
            '<th datafree-order="last_name">Last Name</th>' +
            '<th datafree-order="email">Email</th>' +
            '<th datafree-order="gender">Gender</th>' +
            '<th datafree-order="ip_address">IP Address</th>' +
            '</thead>' +
            '<tbody>' +
            '<tr datafree-row>' +
            '<td>{{ data.id }}</td>' +
            '<td>{{ data.first_name }}</td>' +
            '<td>{{ data.last_name }}</td>' +
            '<td>{{ data.email }}</td>' +
            '<td>{{ data.gender }}</td>' +
            '<td>{{ data.ip_address }}</td>' +
            '</tr>' +
            '</tbody>' +
            '<tbody datafree-empty>' +
            '<tr>' +
            '<td colspan="6">No items found</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '<datafree-pager></datafree-pager>' +
            '</datafree>'
        ;

        $httpBackend.expectGET(/query/);

        scope.query = new DFQuery('/query');

        compileDirecive(template);

        $httpBackend.flush();

        expect(dfElement.length).to.be.eq(1);
        expect(dfPager.length).to.be.eq(1);
    });

    it('should render the first page with client', function(done:Function) {
        let template:string = '<datafree client="client">' +
            '<table>' +
            '<thead>' +
            '<th datafree-order="id">ID</th>' +
            '<th datafree-order="first_name">First Name</th>' +
            '<th datafree-order="last_name">Last Name</th>' +
            '<th datafree-order="email">Email</th>' +
            '<th datafree-order="gender">Gender</th>' +
            '<th datafree-order="ip_address">IP Address</th>' +
            '</thead>' +
            '<tbody>' +
            '<tr datafree-row>' +
            '<td>{{ data.id }}</td>' +
            '<td>{{ data.first_name }}</td>' +
            '<td>{{ data.last_name }}</td>' +
            '<td>{{ data.email }}</td>' +
            '<td>{{ data.gender }}</td>' +
            '<td>{{ data.ip_address }}</td>' +
            '</tr>' +
            '</tbody>' +
            '<tbody datafree-empty>' +
            '<tr>' +
            '<td colspan="6">No items found</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '<datafree-pager></datafree-pager>' +
            '</datafree>'
        ;

        $httpBackend.expectGET(/query/);

        angular.mock.inject(function(DFClientFactory) {
            let query = new DFQuery('/query');
            let cb:Function = () => {
                // After listener is triggered, give it a half a second for the results to digest into the scope
                setTimeout(() => {
                    let tr = dfElement.find('tr');

                    expect(tr.length).to.be.eq(11);
                    expect(tr.eq(1).find('td').eq(0).text()).to.be.eq('1');

                    done();
                }, 500);
            };


            scope.client = DFClientFactory.createClient(query);
            scope.client.subscribe(cb);

            compileDirecive(template);

            $httpBackend.flush();
        });
    });

    it('should page and render', function(done:Function) {
        let template:string = '<datafree client="client">' +
            '<table>' +
            '<thead>' +
            '<th datafree-order="id">ID</th>' +
            '<th datafree-order="first_name">First Name</th>' +
            '<th datafree-order="last_name">Last Name</th>' +
            '<th datafree-order="email">Email</th>' +
            '<th datafree-order="gender">Gender</th>' +
            '<th datafree-order="ip_address">IP Address</th>' +
            '</thead>' +
            '<tbody>' +
            '<tr datafree-row>' +
            '<td>{{ data.id }}</td>' +
            '<td>{{ data.first_name }}</td>' +
            '<td>{{ data.last_name }}</td>' +
            '<td>{{ data.email }}</td>' +
            '<td>{{ data.gender }}</td>' +
            '<td>{{ data.ip_address }}</td>' +
            '</tr>' +
            '</tbody>' +
            '<tbody datafree-empty>' +
            '<tr>' +
            '<td colspan="6">No items found</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '<datafree-pager></datafree-pager>' +
            '</datafree>'
        ;

        $httpBackend.expectGET(/query/);

        angular.mock.inject(function(DFClientFactory) {
            let query = new DFQuery('/query');
            let doneFlag:boolean = false;
            let cb:Function = () => {
                let client:DFClient = scope.client;
                let tr:JQuery;
                let li:JQuery;

                // After listener is triggered, give it a half a second for the results to digest into the scope
                setTimeout(() => {
                    let $pager:JQuery = dfElement.find('ul');
                    tr = dfElement.find('tr');
                    li = $pager.find('li');

                    if (query.$page == 0) {
                        expect($pager.find('li').length).to.be.eq(10);
                        expect(li.eq(2).hasClass('active')).to.be.true;

                        if (doneFlag == false) {
                            doneFlag = true;
                            $httpBackend.expectGET(/query/);
                            client.next(); // Go to Next Page
                            $httpBackend.flush();
                        } else {
                            client.unsubscribe(cb);
                            done();
                        }
                    } else if (query.$page == 1) {
                        expect(tr.length).to.be.eq(11);
                        expect(tr.eq(1).find('td').eq(0).text()).to.be.eq('11');
                        expect(li.length).to.be.eq(10);
                        expect(li.eq(3).hasClass('active')).to.be.true;
                        expect(li.eq(3).text()).to.be.eq('2');

                        $httpBackend.expectGET(/query/);
                        client.page(query.$page + 5); // Skip 5 Pages
                        $httpBackend.flush();
                    } else if (query.$page == 3) {
                        expect(tr.length).to.be.eq(11);
                        expect(tr.eq(1).find('td').eq(0).text()).to.be.eq('31');
                        expect(li.length).to.be.eq(10);
                        expect(li.eq(2).text()).to.be.eq('2');
                        expect(li.eq(4).hasClass('active')).to.be.true;
                        expect(li.eq(4).text()).to.be.eq('4');

                        $httpBackend.expectGET(/query/);
                        client.first(); // Go back to first page
                        $httpBackend.flush();
                    } else if (query.$page == 4) {
                        expect(tr.length).to.be.eq(11);
                        expect(tr.eq(1).find('td').eq(0).text()).to.be.eq('41');
                        expect(li.length).to.be.eq(10);
                        expect(li.eq(2).text()).to.be.eq('3');
                        expect(li.eq(4).hasClass('active')).to.be.true;
                        expect(li.eq(4).text()).to.be.eq('5');

                        $httpBackend.expectGET(/query/);
                        client.prev(); // Go back one page
                        $httpBackend.flush();
                    } else if (query.$page == 6) {
                        expect(tr.length).to.be.eq(11);
                        expect(tr.eq(1).find('td').eq(0).text()).to.be.eq('61');
                        expect(li.length).to.be.eq(10);
                        expect(li.eq(3).text()).to.be.eq('5');
                        expect(li.eq(5).hasClass('active')).to.be.true;
                        expect(li.eq(5).text()).to.be.eq('7');

                        $httpBackend.expectGET(/query/);
                        client.last(); // Go to the Last Page
                        $httpBackend.flush();
                    } else if (query.$page == 9) {
                        expect(tr.length).to.be.eq(11);
                        expect(tr.eq(1).find('td').eq(0).text()).to.be.eq('91');
                        expect(li.length).to.be.eq(10);
                        expect(li.eq(3).text()).to.be.eq('6');
                        expect(li.eq(7).hasClass('active')).to.be.true;
                        expect(li.eq(7).text()).to.be.eq('10');

                        $httpBackend.expectGET(/query/);
                        client.page(query.$page - 5); // Go back 5 pages
                        $httpBackend.flush();
                    }
                }, 500);
            };

            scope.client = DFClientFactory.createClient(query);
            scope.client.subscribe(cb);

            compileDirecive(template);

            $httpBackend.flush();
        });
    });

    it('should render empty results', function(done:Function) {
        let template:string = '<datafree client="client">' +
            '<table>' +
            '<thead>' +
            '<th datafree-order="id">ID</th>' +
            '<th datafree-order="first_name">First Name</th>' +
            '<th datafree-order="last_name">Last Name</th>' +
            '<th datafree-order="email">Email</th>' +
            '<th datafree-order="gender">Gender</th>' +
            '<th datafree-order="ip_address">IP Address</th>' +
            '</thead>' +
            '<tbody>' +
            '<tr datafree-row>' +
            '<td>{{ data.id }}</td>' +
            '<td>{{ data.first_name }}</td>' +
            '<td>{{ data.last_name }}</td>' +
            '<td>{{ data.email }}</td>' +
            '<td>{{ data.gender }}</td>' +
            '<td>{{ data.ip_address }}</td>' +
            '</tr>' +
            '</tbody>' +
            '<tbody datafree-empty>' +
            '<tr>' +
            '<td colspan="6">No items found</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '<datafree-pager></datafree-pager>' +
            '</datafree>'
        ;

        $httpBackend.expectGET(/query/);

        angular.mock.inject(function(DFClientFactory) {
            let query = new DFQuery('/query');
            let filtered:boolean = false;
            let cb:Function = () => {
                let client:DFClient = scope.client;

                // After listener is triggered, give it a half a second for the results to digest into the scope
                setTimeout(() => {
                    if (filtered == true) {
                        let tr = dfElement.find('tr');
                        expect(tr.length).to.be.eq(2);
                        expect(tr.eq(1).find('td').eq(0).text()).to.be.eq('No items found');
                        client.unsubscribe(cb);
                        done();
                    }
                    filtered = true;

                    $httpBackend.expectGET(/query/);
                    client.filter('bdsdb'); // This really should not be found
                    $httpBackend.flush();
                }, 500);
            };


            scope.client = DFClientFactory.createClient(query);
            scope.client.subscribe(cb);

            compileDirecive(template);

            $httpBackend.flush();
        });
    });

    it('should render ordered columns', function(done:Function) {
        let template:string = '<datafree client="client">' +
            '<table>' +
            '<thead>' +
            '<th datafree-order="id">ID</th>' +
            '<th datafree-order="first_name">First Name</th>' +
            '<th datafree-order="last_name">Last Name</th>' +
            '<th datafree-order="email">Email</th>' +
            '<th datafree-order="gender">Gender</th>' +
            '<th datafree-order="ip_address">IP Address</th>' +
            '</thead>' +
            '<tbody>' +
            '<tr datafree-row>' +
            '<td>{{ data.id }}</td>' +
            '<td>{{ data.first_name }}</td>' +
            '<td>{{ data.last_name }}</td>' +
            '<td>{{ data.email }}</td>' +
            '<td>{{ data.gender }}</td>' +
            '<td>{{ data.ip_address }}</td>' +
            '</tr>' +
            '</tbody>' +
            '<tbody datafree-empty>' +
            '<tr>' +
            '<td colspan="6">No items found</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>' +
            '<datafree-pager></datafree-pager>' +
            '</datafree>'
        ;

        $httpBackend.expectGET(/query/);

        angular.mock.inject(function(DFClientFactory) {
            let query = new DFQuery('/query');
            let ordered:boolean = false;
            let tr:JQuery;
            let cb:Function = () => {
                let client:DFClient = scope.client;

                // After listener is triggered, give it a half a second for the results to digest into the scope
                setTimeout(() => {
                    tr = dfElement.find('tr');
                    expect(tr.length).to.be.eq(11);

                    if (ordered == true) {
                        expect(tr.eq(1).find('td').eq(0).text()).to.be.eq('100');
                        client.unsubscribe(cb);
                        done();
                    } else {
                        ordered = true;

                        $httpBackend.expectGET(/query/);
                        client.order('id', DFOrderDirection.DESC);
                        $httpBackend.flush();
                    }
                }, 1000);
            };


            scope.client = DFClientFactory.createClient(query);
            scope.client.subscribe(cb);

            compileDirecive(template);

            $httpBackend.flush();
        });
    });
});