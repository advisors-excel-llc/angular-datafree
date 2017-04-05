/**
 * Created by alex.boyce on 4/4/17.
 */
import DFQuery, {IDFQuerySettings, IDFQueryMap} from "./query";

export default class DFQueryFactory {

    constructor(private $resource: angular.resource.IResourceService) { }

    public createQuery(url: string, method:string = 'GET', defaultSettings?: IDFQuerySettings, defaultQueryMap?: IDFQueryMap): DFQuery {
        let actions: angular.resource.IActionHash = {
            query: {
                method: method,
                isArray: true
            }
        };

        let $r = this.$resource(url, null, actions);

        return new DFQuery($r, defaultSettings, defaultQueryMap);
    }
}