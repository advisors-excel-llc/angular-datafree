import * as angular from "angular";
import DFClientFactory from "./factory";
import {DatafreeDirective, DatafreeEmpty, DatafreeOrder, DatafreePager, DatafreeRow} from "./directive";

module AngularDatafree {
    "use strict";

    angular.module('ae.datafree', ['ngResource'])
        .factory('DFClientFactory', DFClientFactory)
        .directive('datafree', () => {
            return new DatafreeDirective();
        })
        .directive('datafreeRow', () => {
            return new DatafreeRow();
        })
        .directive('datafreeEmpty', () => {
            return new DatafreeEmpty();
        })
        .directive('datafreePager', () => {
            return new DatafreePager();
        })
        .directive('datafreeOrder', () => {
            return new DatafreeOrder();
        })
    ;
}

export default AngularDatafree;