/**
 * Created by alex.boyce on 4/4/17.
 */
import DFQuery from "./query";
import DFClient from "./client";
import {IHttpService, IQService} from "angular";

export default class DFClientFactory {

    constructor(private $http: IHttpService, private $q:IQService) { }

    createClient(query: DFQuery): DFClient {
        return new DFClient(this.$http, this.$q, query);
    }
}