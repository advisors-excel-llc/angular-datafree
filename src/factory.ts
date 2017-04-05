/**
 * Created by alex.boyce on 4/4/17.
 */
import DFQuery, {DFDataResponseType, DFOrderDirection} from "./query";
import {IHttpService, extend, IHttpPromiseCallbackArg} from "angular";
import IInjectorService = angular.auto.IInjectorService;

export default class DFClientFactory {

    constructor(private $http: IHttpService) { }

    createClient(query: DFQuery): DFClient {
        return new DFClient(this.$http, query);
    }
}

DFClientFactory.$inject = ['$http'];

interface Map<T> {
    [key: string]: T;
}

export class DFClient {

    private listeners:Array<Function> = [];
    private headers: Map<string>;
    private withCredentials:boolean = false;

    constructor(private $http: IHttpService, private query:DFQuery) { }

    get $query():DFQuery {
        return this.query;
    }

    set $query(q:DFQuery) {
        this.query = q;
    }

    get $headers(): Map<string> {
        return this.headers;
    }

    set $headers(headers:Map<string>) {
        this.headers = headers;
    }

    private buildQueryParams(params: Object = {}): Object {
        let o:Object = {};
        let p:Object = extend({}, this.query.$settings, params);

        for (let k in p) {
            let v = p[k] instanceof Function ? p[k](p) : p[k];

            if (this.query.$paramsMap[k]) {
                o[this.query.$paramsMap[k]] = v;
            } else {
                o[k] = v;
            }
        }

        return o;
    }

    private handleResponse(response: IHttpPromiseCallbackArg<any>): any {
        if (this.query.$settings.dataResponseType === DFDataResponseType.BODY) {
            this.query.$total = response.headers[this.query.$settings.countProperty.toLowerCase()];

            return response.data;
        }

        this.query.$total = <number>response.data[this.query.$settings.countProperty];

        return (this.query.$settings.dataProperty !== null)
            ? response.data[this.query.$settings.dataProperty] : response.data;
    }

    private dispatch(data) {
        for(let l of this.listeners) {
            l.bind(this.query, data);
        }
    }

    subscribe(l:Function) {
        this.listeners.push(l);
    }

    unsubscribe(l:Function) {
        this.listeners = this.listeners.filter((f) => {
            return f !== l;
        });
    }

    send(params?:Object): Promise<any> {
        return new Promise((resolve, reject) => {
            this.$http({
                url: this.query.$url,
                params: this.buildQueryParams(params),
                method: this.query.$method,
                withCredentials: this.withCredentials,
                headers: this.headers,
            }).then((response) => {
                let data = this.handleResponse(response);
                resolve(data);
                this.dispatch(data);
            }, (reason) => {
                reject(reason);
            });
        });
    }

    page(p: number): Promise<any> {
        this.query.$page = p;

        return this.send();
    }

    prev() {
        return this.page(this.query.$page - 1);
    }

    next() {
        return this.page(this.query.$page + 1);
    }

    first() {
        return this.page(0);
    }

    last() {
        return this.page(Math.ceil(this.query.$total / this.query.$limit));
    }

    limit(l: number) {
        this.query.$limit = l;

        return this.page(0);
    }

    order(column:string, direction: DFOrderDirection) {
        this.query.$orderBy = column;
        this.query.$orderDirection = direction;

        this.send();
    }
}