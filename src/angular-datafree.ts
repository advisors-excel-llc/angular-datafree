import * as angular from "angular";
import DFClientFactory from "./factory";
import {DatafreeDirective, DatafreeEmpty, DatafreeOrder, DatafreePager, DatafreeRow} from "./directive";
import {IHttpService, IQService} from "angular";
import DFQuery, {DFDataResponseType, DFOrderDirection} from "./query";

export module AngularDatafree {
    angular.module('ae.datafree', ['ng'])
        .factory('DFClientFactory', ['$http', '$q', ($http: IHttpService, $q: IQService) => {
            return new DFClientFactory($http, $q);
        }])
        .factory('DFQuery', () => {
            return DFQuery;
        })
        .constant('DFOrderDirection', DFOrderDirection)
        .constant('DFDataResponseType', DFDataResponseType)
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