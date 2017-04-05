import * as angular from "angular";
import DFQueryFactory from "./factory";

module AngularDatafree {
    "use strict";

    angular.module('angular-datafree', ['ngResource'])
        .factory('DFQuery', ['$resource', DFQueryFactory])
    ;
}