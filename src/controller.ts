/**
 * Created by alex.boyce on 4/5/17.
 */

import {IController, IPromise} from "angular";
import DFQuery, {DFOrderDirection} from "./query";
import {DFClientFactory,DFClient} from "./factory";
import {Subscribeable} from "./utilities";

export class DatafreeDirectiveController extends Subscribeable implements IController {
    public query:DFQuery;
    public client:DFClient;
    public autoload:boolean = true;

    private data:any;

    constructor(private clientFactory:DFClientFactory) {
        super();
    }

    protected dispatch(data) {
        let $self = this;
        this.listeners.forEach(function(l) {
            l.bind($self, data)();
        });
    }

    private dataListener(data) {
        this.data = data;
        this.dispatch(data);
    }

    get $data(): any {
        return this.data;
    }

    prev(): IPromise<any> {
        return this.client.prev();
    }

    next(): IPromise<any> {
        return this.client.next();
    }

    first(): IPromise<any> {
        return this.client.first();
    }

    last(): IPromise<any> {
        return this.client.last();
    }

    order(column: string, direction: DFOrderDirection): IPromise<any> {
        return this.client.order(column, direction);
    }

    limit(l: number): IPromise<any> {
        return this.client.limit(l);
    }

    filter(q?: string) {
        return this.client.filter(q);
    }

    $onInit() {
        if (null !== this.query && null === this.client) {
            this.client = this.clientFactory.createClient(this.query);
        } else if (null === this.query && null === this.client) {
            throw new Error("Either a DBQuery or a DBClient object must be provided to Datafree.");
        }

        this.client.subscribe(this.dataListener);
    }

    $postLink() {
        if (this.autoload == true) {
            this.client.send();
        }
    }

    $onDestroy() {
        this.client.unsubscribe(this.dataListener);
    }
}

DatafreeDirectiveController.$inject = ['DFClientFactory'];

export class DatafreePagerDirectiveController implements IController {
    public datafree:DatafreeDirectiveController;
    public numberLimit: number = 5;
    public firstLabel: string = "First";
    public lastLabel: string = "Last";
    public prevLabel: string = "Back";
    public nextLabel: string = "Next";
    public showFirst = true;
    public showPrev = true;
    public showNext = true;
    public showLast = true;

    protected numbers: number[] = [];
    protected currentPage: number = 1;
    protected limit:number = 10;
    protected maxPages:number = 1;
    protected total:number = 0;

    dataChange() {
        this.currentPage = this.datafree.query.$page;
        this.limit = this.datafree.query.$limit;
        this.total = this.datafree.query.$total;
        this.maxPages = Math.ceil(this.total / this.limit);

        let median = Math.floor(this.numberLimit / 2);

        this.numbers = [];

        if (median > 0) {
            let start = Math.max(1, this.currentPage - median);
            let max = Math.min(start + this.numberLimit, this.maxPages);

            for (let i = start; i <= max; i++) {
                this.numbers.push(i);
            }
        }
    }

    $postLink() {
        this.datafree.subscribe(this.dataChange);
    }

    $onDestroy() {
        this.datafree.unsubscribe(this.dataChange);
    }
}