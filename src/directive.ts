/**
 * Created by alex.boyce on 4/5/17.
 */
import {
    IAttributes, IDirective, IScope, ITranscludeFunction, isArray, isUndefined, isObject,
    IDirectiveLinkFn, IController, element
} from "angular";
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
    controller = DatafreeDirectiveController;
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

            $df.subscribe(watch);

            scope.$on('$destroy', () => {
                $df.unsubscribe(watch);
            })
        }
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

        let watch: Function = (data) => {
            if (isUndefined(data)
                || (isArray(data) && data.length === 0)
                || (isObject(data) && Object.keys(data).length > 0)
            ) {
                tE.show();
            } else {
                tE.hide();
            }
        };

        $df.subscribe(watch);

        scope.$on('$destroy', () => {
            $df.unsubscribe(watch);
        });

        transFn((transEl:JQuery, transScope: IScope) => {
            tE = transEl;
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
    templateUrl = '/views/datafree-pager.html';
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

        function checkSort() {
            let column = $df.query.$orderBy;
            let direction = $df.query.$orderDirection;

            e.addClass('sortable');

            if (scope.column === column) {
                e.addClass(direction === DFOrderDirection.DESC ? 'sort-down' : 'sort-up');
                scope.direction = direction;
            }
        }

        $df.subscribe(checkSort);

        scope.$on('$destroy', () => {
            $df.unsubscribe(checkSort);
        });

        e.on('click', function() {
            e.parent().children().forEach(function(e) {
                let $e = element(e);
                $e.removeClass('sort-up').removeClass('sort-down');
            });

            let direction = scope.direction;

            if (scope.column === $df.query.$orderBy || direction === null) {
                direction = direction === DFOrderDirection.ASC ? 'DESC' : 'ASC';
            }

            $df.order(scope.column, direction);
        });
    }

}