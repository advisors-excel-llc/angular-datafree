/**
 * Created by alex.boyce on 4/5/17.
 */
import {IDirective} from "angular";
import {DatafreeDirectiveController} from "./controller";

export class DatafreeDirective implements IDirective {
    restrict:string = 'E';
    transclude:boolean = true;
    bindToController:boolean = true;
    template:string = '<ng-transclude></ng-transclude>';
    controllerAs:string = '$df';
    scope = {
        query: '=?',
        client: '=?',
        autoload: '=?'
    };
    controller = DatafreeDirectiveController;
}