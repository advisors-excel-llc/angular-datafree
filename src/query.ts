/**
 * Created by alex.boyce on 4/4/17.
 */

import {extend} from "angular";

export default class DFQuery {

    private settings: IDFQuerySettings = {
        page: 0,
        limit: 10,
        orderCallback: (order:string, direction:DFOrderDirection) => {
            return [
                order,
                direction
            ];
        },
        filterCallback: (filter) => {
            return filter;
        }
    };

    private dataResponseType: DFDataResponseType = DFDataResponseType.BODY;
    private countProperty: string = 'X-Count';
    private dataProperty: string;

    private total: number = 0;

    private paramsMap: IDFParamsMap;

    constructor(
        private url:string,
        private method:string = 'GET',
        defaultSettings?: IDFQuerySettings,
        paramsMap?: IDFParamsMap
    ) {
        if (defaultSettings != null) {
            this.settings = extend({}, this.settings, defaultSettings);
        }

        this.paramsMap = paramsMap;

        if (this.paramsMap == null) {
            this.paramsMap = new DFDefaultParamsMap();
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
        return this.settings.orderCallback.call(this, this.$orderBy, this.$orderDirection);
    }

    set $orderBy(column: string) {
        this.settings.orderBy = column;
    }

    get $orderBy(): string {
        return this.settings.orderBy;
    }

    set $orderDirection(direction: "ASC" | "DESC") {
        this.settings.orderDirection = direction;
    }

    get $orderDirection(): "ASC" | "DESC" {
        return this.settings.orderDirection;
    }

    get $filter(): string {
        return this.settings.filterCallback.call(this, this.settings.filter);
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

    get $dataResponseType():DFDataResponseType {
        return this.dataResponseType;
    }

    set $dataResponseType(type: DFDataResponseType) {
        this.dataResponseType = type;
    }

    get $countProperty():string {
        return this.countProperty;
    }

    set $countProperty(prop: string) {
        this.countProperty = prop;
    }

    get $dataProperty():string {
        return this.dataProperty;
    }

    set $dataProperty(prop: string) {
        this.dataProperty = prop;
    }

}

export interface IDFQuerySettings {
    page: number;
    limit: number;
    orderBy?: string;
    orderDirection?: "ASC" | "DESC";
    filter?: string;
    orderCallback?: Function;
    filterCallback?: Function;
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

export class DFOrderDirection {
    static ASC:"ASC" = 'ASC';
    static DESC:"DESC" = 'DESC';
}

export class DFDataResponseType {
    static PROPERTY = 'PROPERTY';
    static BODY = 'BODY';
}