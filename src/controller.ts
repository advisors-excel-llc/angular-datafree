/**
 * Created by alex.boyce on 4/5/17.
 */

import {IController, IScope} from "@types/angular";
import DFQuery from "./query";
import DFClientFactory, {DFClient} from "./factory";

export class DatafreeDirectiveController implements IController {
    public query:DFQuery;
    public client:DFClient;
    public autoload:boolean = true;

    private data:any;

    constructor(private $scope:IScope, private clientFactory:DFClientFactory) { }

    private dataListener(data) {
        this.data = data;
        this.$scope.datafreeRows = data;
    }

    get $data(): any {
        return this.data;
    }

    prev() {

    }

    next() {

    }

    first() {

    }

    last() {

    }

    $onInit() {
        if (null !== this.query && null === this.client) {
            this.client = this.clientFactory.createClient(this.query);
        } else if (null === this.query && null === this.client) {
            throw new Error("Either a DBQuery or a DBClient object must be provided to Datafree.");
        }

        this.client.subscribe(this.dataListener);

        if (this.autoload == true) {
            this.client.send();
        }
    }

    $onDestroy() {
        this.client.unsubscribe(this.dataListener);
    }
}

DatafreeDirectiveController.$inject = ['$scope', 'DFClientFactory'];

