import * as angular from "angular";
import DFClientFactory from "./factory";
import {DatafreeDirective} from "./directive";

module AngularDatafree {
    "use strict";

    angular.module('ae.datafree', ['ngResource'])
        .factory('DFClientFactory', DFClientFactory)
        .directive('datafree', () => {
            return DatafreeDirective;
        })
    ;
}