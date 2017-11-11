'use strict';
const Generator = require('yeoman-generator');
const fs = require('fs');
const swaggerIndexFilePath = 'swagger/index.json';
const pluralize = require('pluralize');
const enums = require('../../enums');
const seq = require('promise-sequential');

const OPERATIONS = Object.keys(enums.SWAGGER_OPERATIONS).map(key => {
    return {
        name: enums.SWAGGER_OPERATIONS[key],
        value: enums.SWAGGER_OPERATIONS[key],
        checked: false
    }
});

const SWAGGER_PARAMETERS_IN = Object.keys(enums.SWAGGER_PARAMETERS_IN).map(key => {
    return {
        name: enums.SWAGGER_PARAMETERS_IN[key],
        value: enums.SWAGGER_PARAMETERS_IN[key]
    }
});

const SWAGGER_PARAMETERS_TYPE = Object.keys(enums.SWAGGER_PARAMETERS_TYPE).map(key => {
    return {
        name: enums.SWAGGER_PARAMETERS_TYPE[key],
        value: enums.SWAGGER_PARAMETERS_TYPE[key]
    }
});


const addSwaggerPath = (routePath, routeName) => {
    console.log(swaggerIndexFilePath);
    var swaggerIndex = JSON.parse(fs.readFileSync(swaggerIndexFilePath).toString());
    swaggerIndex.paths[routePath] = {
        $ref: `./swagger/paths/${routeName}.json`
    };
    fs.writeFile(swaggerIndexFilePath, JSON.stringify(swaggerIndex, null, 4));
};

const addSwaggerParams = (routePath, routeName, routeFilePath) => {
    console.log(routeFilePath);
    try {
        var swaggerPathFile = JSON.parse(fs.readFileSync(routeFilePath).toString());
    }

    catch(e) {
        createSwaggerRoute(routePath, routeName, routeFilePath)
    }

    swaggerPathFile.paths[routePath] = {
        $ref: `./swagger/paths/${routeName}.json`
    };
    fs.writeFile(swaggerIndexFilePath, JSON.stringify(swaggerPathFile, null, 4));
};


const stringToParams = (paramString) => {
    var res = [];
    if (!paramString) {
        return res;
    }
    var params = paramString.replace(/\s+/g, '').split(',');
    params.forEach(function (param) {
        res.push({
            name: param.split(':')[0],
            type: param.split(':')[1]
        });
    });
    return res;
};

module.exports = class extends Generator {

    constructor(args, opts) {
        super(args, opts);

        this.routeName = args[0];
        this.initPrompts = [
            {
                type: 'input',
                name: 'routeController',
                message: `Select the name of the controller. Default: ${pluralize.singular(this.routeName)}`,
                default: pluralize.singular(this.routeName)
            },
            {
                type: 'checkbox',
                name: 'operations',
                message: `Select operations you want to include.`,
                choices: OPERATIONS
            }
        ];
        this.operationPrompts = [
            {
                type: 'input',
                name: 'operationDescription',
                message: `Write a description for the %operation% operation`
            }
        ];

        this.moreParametersPrompts = [
            {
                type: 'confirm',
                name: 'newParam',
                message: 'Would you like to add a/more parameters to the endpoint'
            }
        ]
        this.parametersPrompts = [
            {
                type: 'input',
                name: 'paramName',
                message: 'Name:'
            },
            {
                type: 'list',
                name: 'paramIn',
                message: 'In:',
                choices: SWAGGER_PARAMETERS_IN
            },
            {
                type: 'list',
                name: 'paramType',
                message: 'Type:',
                choices: SWAGGER_PARAMETERS_TYPE
            },
            {
                type: 'input',
                name: 'paramDescription',
                message: 'Description:'
            }

        ]
    }
    
    _promptParameters(parameters = [], params) {
        return this.prompt(this.moreParametersPrompts)
            .then(res => {
                if (res.newParam) {
                    return this.prompt(this.parametersPrompts)
                        .then(results => {
                            parameters.push(results)
                            return this._promptParameters(parameters)
                        })
                }
                else {
                    return parameters;
                }
            })
    }


    _promptOperations(operation, i, props, originalMessage) {
        this.operationPrompts[0].message = originalMessage.replace('%operation%', operation.toUpperCase());
        return this.prompt(this.operationPrompts)
            .then(operationResults => {
                const op = props.operations[i]
                props.operations[i] = {
                    operation: op,
                    description: operationResults.operationDescription
                };
                return props
            })
    }

    prompting(routeName) {

        let properties = {};
        const originalMessage = this.operationPrompts[0].message;

        return this.prompt(this.initPrompts)
            .then(props => seq(
                props.operations.map((operation, i) => (
                    () => this._promptOperations(operation, i, props, originalMessage)
                        .then(() => this._promptParameters())
                        .then(parameters => {
                            props.operations[i].parameters = parameters;
                            return props;
                        })
                ))
            )
            .then(() => {
                this.props = props;
            }));
    }

    writing(routeName) {
        console.dir(this.props, {depth: 10});
        // addSwaggerPath(routePath, routeName);
        // this.fs.copyTpl(
        //     this.templatePath('path.json'),
        //     this.destinationPath(`swagger/paths/${routeName}.json`), {
        //         routeName: routeName,
        //         routeDescription: this.props.routeDescription,
        //         routeController: this.props.routeController,
        //         routeOperationId: routeName
        //     }
        // );

        // var properties = stringToParams(propString);
        // addSwaggerParams(routePath, properties, `swagger/paths/${routeName}.json`);
    }

};
