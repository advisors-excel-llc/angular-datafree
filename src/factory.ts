/**
 * Created by alex.boyce on 4/4/17.
 */
import DFQuery, {DFDataResponseType} from "./query";
import {Subscribeable} from "./utilities";
import {IHttpService, IHttpPromiseCallbackArg, IQService, IPromise, IDeferred} from "angular";
import {extend} from "angular";

export class DFClientFactory {

    constructor(private $http: IHttpService, private $q:IQService) { }

    createClient(query: DFQuery): DFClient {
        return new DFClient(this.$http, this.$q, query);
    }
}

export class DFClient extends Subscribeable {
    private headers: Object;
    private withCredentials:boolean = false;

    constructor(private $http: IHttpService, private $q: IQService, private query: DFQuery) {
        super();
    }

    get $query(): DFQuery {
        return this.query;
    }

    set $query(q: DFQuery) {
        this.query = q;
    }

    get $headers(): Object {
        return this.headers;
    }

    set $headers(headers: Object) {
        this.headers = headers;
    }

    private buildQueryParams(params: Object = {}): Object {
        let o: Object = {};
        let p: Object = extend({}, this.query.$settings, params);

        for (let k in p) {
            let v = p[k] instanceof Function ? p[k](p) : p[k];

            if (this.query.$paramsMap.hasOwnProperty(k)) {
                o[this.query.$paramsMap[k]] = v;
            } else {
                o[k] = v;
            }
        }

        return o;
    }

    protected handleResponse(response: IHttpPromiseCallbackArg<any>): any {
        if (this.query.$dataResponseType === DFDataResponseType.BODY) {
            this.query.$total = parseInt(response.headers(this.query.$countProperty), 10);

            return response.data;
        }

        this.query.$total = parseInt(response.data[this.query.$countProperty], 10);

        return (this.query.$dataProperty !== null)
            ? response.data[this.query.$dataProperty] : response.data;
    }

    protected dispatch(data) {
        for(let l of this.listeners) {
            l.bind(this, data)();
        }
    }

    protected sendRequest(params?: Object): IPromise<any> {
        return this.$http({
            url: this.query.$url,
            params: this.buildQueryParams(params),
            method: this.query.$method,
            withCredentials: this.withCredentials,
            headers: this.headers,
        });
    }

    send(params?: Object): IPromise<any> {
        let defer: IDeferred<any> = this.$q.defer();

        this.sendRequest(params).then((response) => {
            let data = this.handleResponse(response);
            defer.resolve(data);
            this.dispatch(data);
        }, (reason) => {
            defer.reject(reason);
        });

        return defer.promise;
    }

    page(p: number): IPromise<any> {
        this.query.$page = p;

        return this.send();
    }

    prev(): IPromise<any> {
        return this.page(this.query.$page - 1);
    }

    next(): IPromise<any> {
        return this.page(this.query.$page + 1);
    }

    first(): IPromise<any> {
        return this.page(0);
    }

    last(): IPromise<any> {
        if (null == this.query.$total ||  this.query.$total == 0) {
            let defer:IDeferred<any> = this.$q.defer();

            // We don't have a total, so we need to get one. Do so without triggering the listeners
            this.sendRequest({page: 0, limit: 1}).then((response) => {
                this.handleResponse(response);
                // pages start a 0, so reduce the last page by 1
                let page:number = Math.ceil(this.query.$total / this.query.$limit) - 1;

                this.page(page).then((data) => {
                    defer.resolve(data);
                }, (err) => {
                    defer.reject(err);
                })
            }, (err) => {
                defer.reject(err);
            });

            return defer.promise;
        }

        // pages start a 0, so reduce the last page by 1
        let page:number = Math.ceil(this.query.$total / this.query.$limit) - 1;

        return this.page(page);
    }

    limit(l: number): IPromise<any> {
        this.query.$limit = l;

        return this.page(0);
    }

    order(column:string, direction: "ASC" | "DESC"): IPromise<any> {
        this.query.$orderBy = column;
        this.query.$orderDirection = direction;

        return this.send();
    }

    filter(q?: string): IPromise<any> {
        this.query.$filter = q;

        return this.first();
    }
}