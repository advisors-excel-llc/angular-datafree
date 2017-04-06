/**
 * Created by alex.boyce on 4/4/17.
 */

import ngr = angular.resource;
import {extend, IHttpPromiseCallbackArg} from "angular";

export default class DFQuery {

    private settings: IDFQuerySettings = {
        page: 0,
        limit: 10,
        dataResponseType: DFDataResponseType.BODY,
        countProperty: 'x-count'
    };

    private total: number = 0;

    private paramsMap: IDFParamsMap;

    constructor(
        private url:string,
        private method:string = 'GET',
        defaultSettings?: IDFQuerySettings,
        paramsMap?: IDFParamsMap
    ) {
        if (null !== defaultSettings) {
            this.settings = extend({}, this.settings, defaultSettings);
        }

        if (null === paramsMap) {
            this.paramsMap = new DFDefaultParamsMap();
        } else {
            this.paramsMap = paramsMap;
        }
    }

    get $settings(): IDFQuerySettings {
        return this.settings;
    }

    get $url(): string {
        return this.url;
    }

    get $method(): string {
        return this.method;
    }

    get $page(): number {
        return this.settings.page;
    }

    set $page(p: number) {
        this.settings.page = Math.max(p, 0);
    }

    get $limit(): number {
        return this.settings.limit;
    }

    set $limit(l: number) {
        this.settings.limit = Math.max(l, 0);
    }

    get $order(): Array<string|DFOrderDirection> {
        return [
            this.settings.orderBy instanceof Function ? this.settings.orderBy() : this.settings.orderBy,
            this.settings.orderDirection
        ];
    }

    set $orderBy(column: string) {
        this.settings.orderBy = column;
    }

    set $orderDirection(direction: DFOrderDirection) {
        this.settings.orderDirection = direction;
    }

    get $filter(): string {
        return this.settings.filter instanceof Function ? this.settings.filter() : this.settings.filter;
    }

    set $filter(q: string) {
        this.settings.filter = q;
    }

    get $total(): number {
        return this.total;
    }

    set $total(t: number) {
        this.total = t;
    }

    get $paramsMap(): IDFParamsMap {
        return this.paramsMap;
    }
}

export interface IDFQuerySettings {
    page: number;
    limit: number;
    dataResponseType: DFDataResponseType;
    countProperty: string;
    dataProperty?: string;
    orderBy?: string|Function;
    orderDirection?: DFOrderDirection;
    filter?: string|Function;
}

export interface IDFParamsMap {
    page: string;
    limit: string;
    orderBy: string;
    orderDirection: string;
    filter: string;
}

export class DFDefaultParamsMap implements IDFParamsMap{
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

export enum DFDataResponseType {
    PROPERTY,
    BODY
}