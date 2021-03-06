/**
 * Created by alex.boyce on 4/5/17.
 */
import {IAttributes, IDirective, IScope, ITranscludeFunction, isArray, isObject, element as $element, forEach,
    IDirectiveLinkFn, IController} from "angular";
import {DatafreeDirectiveController, DatafreePagerDirectiveController} from "./controller";
import {DFOrderDirection} from "./query";

export class DatafreeDirective implements IDirective {
    restrict = 'E';
    transclude = true;
    bindToController = true;
    template = '<ng-transclude></ng-transclude>';
    controllerAs = '$df';
    scope = {
        query: '=?',
        client: '=?',
        autoload: '=?'
    };
    controller = ['DFClientFactory', DatafreeDirectiveController];
}

export class DatafreeRow implements IDirective {
    restrict = 'ACE';
    transclude:"element" = "element";
    require = '^^datafree';
    link:IDirectiveLinkFn = (
        scope: IScope,
        e: JQuery,
        attrs: IAttributes,
        $df:DatafreeDirectiveController,
        transFn: ITranscludeFunction
    ) => {
        let parent:JQuery = e.parent();

        let watch:Function = (data) => {
            parent.html('');

            let rows = isArray(data) ? data : [data];

            rows.forEach(function(row) {
                transFn((transEl: JQuery, transScope: IScope) => {
                    transScope.data = row;
                    parent.append(transEl);
                });
            });
        };

        $df.subscribe(watch);

        scope.$on('$destroy', () => {
            $df.unsubscribe(watch);
        })
    }
}

export class DatafreeEmpty implements IDirective {
    restrict = 'ACE';
    transclude:'element' = 'element';
    require = '^^datafree';
    link:IDirectiveLinkFn = (
        scope: IScope,
        e: JQuery,
        attr: IAttributes,
        $df: DatafreeDirectiveController,
        transFn: ITranscludeFunction
    ) => {
        let tE:JQuery;
        let tP:JQuery;

        let show:Function = (e:JQuery) => {
            if (e != null) {
                if (e.show != null) {
                    e.show();
                } else {
                    tP.append(e);
                }
            }
        };

        let hide:Function = (e:JQuery) => {
            if (e != null) {
                if (e.hide != null) {
                    e.hide();
                } else {
                    e.remove();
                }
            }
        };

        let watch: Function = (data) => {
            if (tE != null) {
                if (data != null
                    && ((isArray(data) && data.length === 0)
                        || (!isArray(data) && isObject(data) && Object.keys(data).length > 0))
                ) {
                    show(tE);
                } else {
                    hide(tE);
                }
            }
        };

        $df.subscribe(watch);

        scope.$on('$destroy', () => {
            $df.unsubscribe(watch);
        });

        transFn((transEl:JQuery, transScope: IScope) => {
            tE = transEl;
            tP = e.parent();
            transEl.append(e.children());
            e.parent().append(transEl);
        })
    }
}

export class DatafreePager implements IDirective {
    restrict = 'E';
    require = ['datafreePager', '^^datafree'];
    scope = {
        numberLimit: '@?',
        showFirst: '@?',
        showPrev: '@?',
        showNext: '@?',
        showLast: '@?',
        firstLabel: '@?',
        prevLabel: '@?',
        nextLabel: '@?',
        lastLabel: '@?'
    };
    templateUrl = 'datafree-pager.html';
    bindToController = true;
    controllerAs = '$pager';
    controller = DatafreePagerDirectiveController;
    link:IDirectiveLinkFn = (scope: IScope, element: JQuery, attrs: IAttributes, ctrls: IController[]) => {
        let $pager = <DatafreePagerDirectiveController> ctrls[0];
        $pager.datafree = <DatafreeDirectiveController> ctrls[1];
    }
}

export class DatafreeOrder implements IDirective {
    restrict = 'A';
    require = '^^datafree';
    scope = {
        column: '@datafreeOrder'
    };
    link:IDirectiveLinkFn = (scope:IScope, e: JQuery, attrs: IAttributes, $df: DatafreeDirectiveController) => {
        scope.direction = null;
        e.addClass('orderable');

        let checkSort:Function = function() {
            let column = this.client.$query.$orderBy;
            let direction = this.client.$query.$orderDirection;

            if (scope.column == column) {
                e.addClass(direction == DFOrderDirection.DESC ? 'order-desc' : 'order-asc');
                scope.direction = direction;
            }
        };

        $df.subscribe(checkSort);

        scope.$on('$destroy', () => {
            $df.unsubscribe(checkSort);
        });

        e.on('click', function() {
            forEach(e.parent().children(), function(e) {
                let $e = $element(e);
                $e.removeClass('order-asc').removeClass('order-desc');
            });

            let direction = scope.direction;

            if (scope.column == $df.client.$query.$orderBy || direction == null) {
                direction = direction == DFOrderDirection.ASC ? 'DESC' : 'ASC';
            }

            $df.order(scope.column, direction);
        });
    }

}