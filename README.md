# Angular Datafree 
[![Build Status](https://travis-ci.org/advisors-excel-llc/angular-datafree.svg?branch=master)](https://travis-ci.org/advisors-excel-llc/angular-datafree)

Freely visualize backend data within an Angular Frontend.

### Files

* <strike>`dist/angular-datafree.build.min.js`</strike> - No longer used
* `dist/angular-datafree.min.js` - the version for production use
* `dist/angular-datafree-templates.js` - include this file and module in your app to use the default template files
* `dist/angular-datafree.min.css` - the default CSS for the templates

## Wireup

After including the files, inject into your app and create a query:

```js
angular.module('app', ['ae.datafree', 'ae.datafree.tpls'])
    .controller('DefaultCtrl', ['DFQuery', function(DFQuery) {
        $scope.query = new DFQuery('/query');
    }])
    ;
```

The `<datafree>` element is a simple container that connects child 
directives to send requests via a client and react on data updates from the same client.

```html
<!-- Table Example but doesn't NEED to be a table -->
<div ng-controller="DefaultCtrl">
    <datafree query="query">
        <table>
            <thead>
                <th datafree-order="id">ID</th>
                <th datafree-order="first_name">First Name</th>
                <th datafree-order="last_name">Last Name</th>
                <th datafree-order="email">Email</th>
                <th datafree-order="gender">Gender</th>
                <th datafree-order="ip_address">IP Address</th>
            </thead>
            <tbody>
                <tr datafree-row>
                    <td>{{ data.id }}</td>
                    <td>{{ data.first_name }}</td>
                    <td>{{ data.last_name }}</td>
                    <td>{{ data.email }}</td>
                    <td>{{ data.gender }}</td>
                    <td>{{ data.ip_address }}</td>
                </tr>
            </tbody>
            <tbody datafree-empty>
                <tr>
                    <td colspan="6">No items found</td>
                </tr>
            </tbody>
        </table>
        <datafree-pager></datafree-pager>
    </datafree>
</div>
```

## Datafree Directive

The `<datafree>` element requires one of two attributes, `query="[ a DFQuery object ]"`
 or `client="[ a DFClient object ]"`.
 
 When only providing a `DFQuery` object, the Datafree directive will create an isolated `DFClient`.
 Only directives within the `<datafree>` element who require the `datafree` directive will be able to 
 interact with the `DFClient` using the `DatafreeDirectiveController`.
 
 The `DatafreeDirectiveController` is also accessible via the template by using `$df`.
 
 If you wish to have access to the `DFClient` used by the `<datafree>` element, simply inject
 the `DFClientFactory` into your controller and pass a `DFQuery` object to the `createClient()` method.
 
 Optionally, use the `autoload="truthy statement like true/false or $ctrl.isTruthyValue"` to tell the `<datafree>` element's
 controller to call the server automatically once all child directives are linked. If this value is false, you will have to
 make the initial `DFClient.send()` call via you controller (so in other words, you should use the `DFClientFactory`).
 
 ```js
// Example of creating your own client
angular.module('app', ['ae.datafree', 'ae.datafree.tpls'])
    .controller('DefaultCtrl', ['DFQuery', 'DFClientFactory', function(DFQuery, DFClientFactory) {
        var query = new DFQuery('/query');
        
        $scope.myClient = DFClientFactory.createClient(query);
    }])
    ;
```
 
 ```html
<!-- Assigning a generated client to the Datafree element -->
<div ng-controller="DefaultCtrl">
    <datafree client="myClient">
        <!-- Abridged -->
    </datafree>
</div> 
```

## DFQuery

A DFQuery manages the state of the Query. The Query is mapped to query parameters and passed to the backend URL via the DFClient where the data is processed and data is returned.

| Property/Method | Definition |
| :--- | :--- |
| `constructor(url, [method], [defaultSettings], [defaultParameterMap])` | The DFQuery Constructor. Accepts up to 4 parameters. `url`: the backend URL where the data will be processed, `method`: the HTTP method for the request, `defaultSettings` a [IDFQuerySettings](#idfquerysettings) object, `defaultParametersMap`: a [IDFParamsMap](#idfparamsmap) object. |
| `$url` | Sets and Gets the url used to call the backend. |
| `$method` | Sets ang Gets the method used in the HTTP Request |
| `$settings` | Gets the current state of the [IDFQuerySettings](#idfquerysettings) of the Query |
| `$page` | Sets and Gets the page of the query |
| `$limit` | Sets and Gets the limit, or the max number of records per page |
| `$orderBy` | Sets and Gets the column/field by which records are ordered/sorted. |
| `$orderDirection` | Sets and Gets the order/sort direction, accepts "ASC" or "DESC" |
| `$filter` | Sets and Gets the keywords that results should be filtered by. |
| `$paramsMap` | Gets the [IDFParamsMap](#idfparamsmap) the query is using to map settings to the query parameters. |
| `$dataResponseType` | Sets and Gets the expected response type. Must be either "PROPERTY" or "BODY" (default). If set to "PROPERTY", the DFClient will look for a property on the data object returned from the server. "BODY" is the default and accepts the entire body of the response as the data to be set. |
| `$dataProperty` | Sets and Gets the property name used to extact data from the server response. Required when `$dataResponseType` is "PROPERTY" |
| `$countProperty` | Set and Gets the property name used to get the total record count. This is required if records are paged. When `$dataResponseType` is "BODY", the value of `$countProperty` will be used to get its respective header from the response, otherwise it will look for a property on the response object within the body. *Defaults to "X-Count"* |

### IDFQuerySettings

These are the default values which are mapped to the request's query parameters if values are not provided.

| Property | Type | Default |
| --- | ---- | ---- |
| page | number | 0 |
| limit | number | 10 |
| orderBy | string | null |
| orderDirection | "ASC" or "DESC" | null |
| filter | string | null |
| orderCallback | function(orderBy, orderDirection) | a function that returns an array of [ `orderBy`, `orderDirection` ] |
| filterCallback | function(filter) | a default getter function for the filter value |
| pageCallback | function(page, limit) | returns the `page` value, by default. Use this to do something like `page * limit`. |

*When a value is a function, it is executed at the moment the client builds the parameters to send to the server. When a value is `null` it is not output to the query parameters.*

### IDFParamsMap

An `IDFParamsMap` object simply associates the properties on the `IFQuerySettings` object to a string value that is used as the parameter name.

| Settings Property | Default Parameter Name |
| --- | --- |
| page | page |
| limit | limit |
| orderBy | order_by |
| orderDirection | order_direction |
| filter | q |

*Example: Using `IDFQuerySettings` values, this `IDFParamsMap` would be converted to `&page=[$page]&limit=[$limit]&order_by=[$orderBy]&order_direction=[$orderDirection]&q=[$filter]`*

## DFClient

The `DFClient` makes the calls to the server and processes the data and total count and signals subscribers of changes.

| Property/Method | Description |
| --- | --- |
| `$query` | Sets and Gets an [DFQuery](#dfquery) object. |
| `$headers` | Sets and Gets a headers object that is passed along with the request. This is useful when requiring authentication headers. |
| `$withCredentials` | Sets and Gets a boolean which is passed along with the server request. This is used to set the `XHR.withCredentials` flag. |
| `send([params: Object])` | Sends a request to the server using the Query provided. The `params` argument will override any of the `IDFQuerySettings` for this request only and will append any extra query parameters. Triggers subcribers and returns a `Promise`. |
| `page(p: number)` | Sets the `$page` property on the `DFQuery` object, sends a request to the server, triggers subscribers and returns a `Promise`. |
| `next()` | Adds 1 the `$page` property on the `DFQuery` and calls `page()`. |
| `prev()` | Subtracts 1 from `$page` and calls `page()`. |
| `first()` | Calls `page(0)`. |
| `last()` | Calls `page($total)`. If `$total` hasn't been set, a dummy request is sent to populate it. Requires the `$countProperty` to be set and used in the server response. |
| `order(column: string, direction: string)` | Sets `$orderBy` with the `column` argument and `$orderDirection` with the `direction` argument and then calls `send()`. |
| `filter(q)` | Sets `$filter` on `DFQuery` and calls `send()`. |
| `limit(n)` | Sets the `$limit` on `DFQuery` and calls `page(0)`. |
| `subscribe(f: Function)` | Subscribes the function `f` to the client. When data is successfully processed from the server, `f` is triggered with the the `data` as the argument and `this` will point the client. |
| `unsubscribe(f: Function)` | Unsubscribe a function from the client. |

## DatafreeDirectiveController

Accessible in the template within the `<datafree>` element by using `$df` or within another directive by using `require: '^^datafree'`.

| Property/Method | Description |
| --- | --- |
| `$data` | Gets the data that was processed from the server response. If you want, you can use this with `ng-repeat="data in $df.$data"` |
| `send([params: Object])` | Shortcut to `client.send()` |
| `page(p: number)` | Shortcut to `client.page()` |
| `next()` | Shortcut to `client.next()` |
| `prev()` | Shortcut to `client.prev()` |
| `first()` | Shortcut to `client.first()` |
| `last()` | Shortcut to `client.last()` |
| `order(column: string, direction: string)` | Shortcut to `client.order()` |
| `filter(q)` | Shortcut to `client.filter()` |
| `limit(n)` | Shortcut to `client.limit()` |
| `subscribe(f: Function)` | Shortcut to `client.subscribe()` |
| `unsubscribe(f: Function)` | Shortcut to `client.unsubscribe()` |

## Additional Directives

### datafree-order

**Type:** Attribute

This is a helper that will set the order column and toggle the order direction for that column on the query.
*The value of the attribute becomes the `$orderBy` value on the `DFQuery`.

### datafree-row

**Type:** Element, Attribute, Class

This is similar to `ng-repeat`. `datafree-row` transcludes elements and repeats them for each row in the response data.
The `data` variable in the scope is an object that represents the current row. I.e., `{{ data.id }}` or `{{ data.first_name }}`.

*Note: When using `datafree-row` in a table, **do not** use it as an element. It's best used as an attribute or class on the `<tr>`.*

### datafree-empty

**Type:** Element, Attribute, Class

A transcluded directive which only appears when the response data is empty. This is useful when `DFQuery.$filter` is used.

*Note: Do not place the `datafree-empty` directive inside a `datafree-row` element, it will be removed once data is populated.*

*Note: When using `datafree-empty` within a table, it's best to place it on a second `<tbody>` element. Anything else will result in the element not rendering or being removed from the table.*

### datafree-pager

**Type:** Element

This is a very customizable pager element. Using attributes on the element, you can control how it will render.

| Attribute | Description |
| --- | --- |
| `number-limit` | This controls the maximum number of pages that are shown. *Default: 5*  |
| `show-first` | A truthy expression that will determine if the "First" button is rendered. |
| `show-last` | A truthy expression that will determine if the "Last" button is rendered. |
| `show-next` | A truthy expression that will determine if the "Next" button is rendered. |
| `show-prev` | A truthy expression that will deterine if the "Back" button is rendered. |
| `first-label` | The text used to label the "First" button. *Default: First* |
| `last-label` | The text used to label the "Last" button. *Default: Last* |
| `next-label` | The text used to label the "Next" button. *Default: Next* |
| `prev-label` | The text used to label the "Back" button. *Default: Back* |

**Include `angular-datafree-template.js` and `ae.datafree.tpls` in your application to use the default template.**

#### Overriding the default pager template

If you want to use your own template for the page, rather than the default one provided, simply do the following:

Please refer to the `views/datafree-pager.html` file for reference. The `DatafreePagerDirectiveController` is available via the `$pager` variable in the template.

```js
// If you want to load from a string value
angular.module('myApp', ['ae.datafree'])
    .run(['$templateCache', function($templateCache) {
        $templateCache.put('datafree-pager.html', 'YOUR TEMPLATE HTML HERE');
    }]);
```

```js
// If you want to load from a URL
angular.module('myApp', ['ae.datafree'])
    .run(['$templateCache', '$http', function($templateCache, $http) {
        $http.get('/path/to/your/template.html', function(response) {
           $templateCache.put('datafree-pager.html', response.data); 
        });
    }]);
```

*Note: It is also possible to use the `$provide.decorator()` within the `.config()` method to change the `templateUrl` value of the pager directive. However, this method is untested and could have complications if you don't know what you're doing. So tread lightly.*