/**
 * Created by alex.boyce on 4/4/17.
 */

import ngr = angular.resource;
import {IQService, extend, IPromise} from "angular";

export default class DFQuery {

    private settings: IDFQuerySettings = {
        page: 0,
        limit: 10
    };

    private total: number = 0;

    private queryMap: IDFQueryMap;

    constructor(private $resource: ngr.IResourceClass<ngr.IResource<any>>, private $q: IQService, defaultSettings?: IDFQuerySettings, queryMap?: IDFQueryMap) {
        if (null !== defaultSettings) {
            this.settings = extend({}, this.settings, defaultSettings);
        }

        if (null === queryMap) {
            this.queryMap = new DFDefaultQueryMap();
        } else {
            this.queryMap = queryMap;
        }
    }

    private buildQueryParams(params: Object = {}): Object {
        let o:Object = {};
        let p:Object = extend({}, this.settings, params);

        for (let k in p) {
            let v = p[k] instanceof Function ? p[k](p) : p[k];

            if (this.queryMap[k]) {
                o[this.queryMap[k]] = v;
            } else {
                o[k] = v;
            }
        }

        return o;
    }

    send(params: Object = {}): IPromise<any> {
        let defer = this.$q.defer();

        this.$resource.query(this.buildQueryParams(params)).$promise.then(
            function ($data) {
                defer.resolve($data);
            },
            function($err) {
                defer.reject($err);
            }
        );

        return defer.promise;
    }

    page(p: number = 0) {
        return this.send({
            page: Math.max(p, 0)
        });
    }

    next() {
        return this.page(this.$page + 1);
    }

    prev() {
        return this.page(this.$page - 1);
    }

    first() {
        return this.page(0);
    }

    last() {
        return this.page(Math.ceil(this.total / this.$limit));
    }

    order(column:string, direction:DFOrderDirection) {
        this.settings.orderBy = column;
        this.settings.orderDirection = direction;

        return this.send();
    }

    limit(limit: number) {
        this.settings.page = 0;
        this.settings.limit = limit;

        return this.send();
    }

    filter(q?:string) {
        this.settings.filter = q;
        this.settings.page = 0;

        return this.send();
    }

    get $settings(): IDFQuerySettings {
        return this.settings;
    }

    get $page(): number {
        return this.settings.page;
    }

    get $limit(): number {
        return this.settings.limit;
    }

    get $order(): Array<string|DFOrderDirection> {
        return [
            this.settings.orderBy instanceof Function ? this.settings.orderBy() : this.settings.orderBy,
            this.settings.orderDirection
        ];
    }

    get $filter(): string {
        return this.settings.filter instanceof Function ? this.settings.filter() : this.settings.filter;
    }

    get $total(): number {
        return this.total;
    }
}

export interface IDFQuerySettings {
    page: number;
    limit: number;
    orderBy?: string|Function;
    orderDirection?: DFOrderDirection;
    filter?: string|Function;
}

export interface IDFQueryMap {
    page: string;
    limit: string;
    orderBy: string;
    orderDirection: string;
    filter: string;
}

export class DFDefaultQueryMap implements IDFQueryMap{
    page = 'page';
    limit = 'limit';
    orderBy = 'order_by';
    orderDirection = 'order_direction';
    filter = 'q';
}

export enum DFOrderDirection {
    ASC,
    DESC
}