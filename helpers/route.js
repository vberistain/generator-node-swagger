const pluralize = require('pluralize');

class Route {

    constructor(route) {
        this.route = route;
        this._splittedRoute = this.route.split('/').splice(1);
    }

    _isPathFragmentAParameter(pathFragment) {
       return pathFragment.indexOf('{') >= 0;
    }

    _capitalize(string) {
        if (!string) {
            throw new Error('Trying to capitalize an empty string');
        }
        return `${string.charAt(0).toUpperCase() + string.slice(1)}`
    }

    _getRouteEntity() {
        return this._isLastPathAParam() ?
            pluralize.singular(this._splittedRoute[this._splittedRoute.length - 2]):
            this._splittedRoute[this._splittedRoute.length - 1];
    }

    _isLastPathAParam() {
        return this._isPathFragmentAParameter(this._splittedRoute[this._splittedRoute.length - 1]);
    }

    getRoutePath() {
        let routeArray = this._splittedRoute;
        if (this._isLastPathAParam()) {
            routeArray.pop();
            routeArray[routeArray.length - 1] = pluralize.singular(routeArray[routeArray.length - 1])
        }
        return this._hasAVersionPrefix() ?
            `./swagger/paths/${routeArray[0]}/${routeArray[routeArray.length - 1]}.json` :
            `./swagger/paths/${routeArray[routeArray.length - 1]}.json`
    }

    getControllerName() {
        return this._getRouteEntity();
    }

    getOperationId(operation) {
        const operationName = operation !== 'post' ? operation : 'create';
        const parameter = this._isLastPathAParam() ? this._splittedRoute[this._splittedRoute.length - 1].replace('{', '').replace('}', '') : null;
        return parameter ?
            `${operationName}By${this._capitalize(parameter)}` :
            `${operationName}`

    }

    _hasAVersionPrefix() {
        const prefix = this._splittedRoute[0];
        const versionNumber = prefix.substring(1);
        return prefix.length && prefix.charAt(0) === 'v' && parseInt(versionNumber) > 0;
    }


    getDefaultRouteFileName() {
        const result = this._getRouteEntity();
        return this._hasAVersionPrefix() ?
            `${this._splittedRoute[0]}/${result}` : result
    }
}

module.exports = Route;