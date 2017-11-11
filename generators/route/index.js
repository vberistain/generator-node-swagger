'use strict';
const Generator = require('yeoman-generator');
const fs = require('fs');
const SWAGGER_INDEX_FILE_PATH = 'swagger/index.json';
const pluralize = require('pluralize');
const enums = require('../../enums');
const seq = require('promise-sequential');
const writeFile = require('node-fs-writefile-promise');

const OPERATIONS = Object.keys(enums.SWAGGER_OPERATIONS).map((key, i) => {
    return {
        name: enums.SWAGGER_OPERATIONS[key],
        value: enums.SWAGGER_OPERATIONS[key],
        checked: i === 0
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
                name: 'description',
                message: `Write a description for the %operation% operation`
            },
            {
                type: 'input',
                name: 'id',
                message: 'Write a function Name',
                default: `%operation%${this.routeName.charAt(0).toUpperCase() + this.routeName.slice(1)}`
            }
        ];

        this.moreParametersPrompts = [
            {
                type: 'confirm',
                name: 'newParam',
                message: 'Add parameter?'
            }
        ]
        this.parametersPrompts = [
            {
                type: 'input',
                name: 'name',
                message: 'Parameter name:'
            },
            {
                type: 'list',
                name: 'in',
                message: 'Parameter In:',
                choices: SWAGGER_PARAMETERS_IN
            },
            {
                type: 'list',
                name: 'type',
                message: 'Parameter Type:',
                choices: SWAGGER_PARAMETERS_TYPE
            },
            {
                type: 'input',
                name: 'description',
                message: 'Parameter Description:'
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
                        });
                }
                else {
                    return parameters;
                }
            });
    }


    _promptOperations(props) {
        const originalMessage = this.operationPrompts[0].message;
        const defaultValue = this.operationPrompts[1].default;

        return props.operations.map((operation, i) => (() => {
            this.operationPrompts[0].message = originalMessage.replace('%operation%', operation.toUpperCase());
            this.operationPrompts[1].default = defaultValue.replace('%operation%', operation);

            return this.prompt(this.operationPrompts)
                .then(operationResults => {
                    const op = props.operations[i]
                    props.operations[i] = {
                        operation: op,
                        description: operationResults.description,
                        id: operationResults.id
                    };
                    return props
                })
                .then(() => this._promptParameters())
                .then(parameters => {
                    props.operations[i].parameters = parameters;
                    return props;
                });
        }));
    }

    prompting(routeName) {
        return this.prompt(this.initPrompts)
            .then(props => seq(this._promptOperations(props)))
            .then(data => {
                this.props = data[data.length - 1];
            });
    }

    _createSwaggerPathFile(route, content) {
        return writeFile(route, JSON.stringify(content, null, 4))
            .catch(() => {
                throw new Error(`There was a problem creating "${routeName}.json"`)
            })
    }

    _addRouteToSwagger(routePath, routeName) {
        let swaggerIndex = JSON.parse(fs.readFileSync(SWAGGER_INDEX_FILE_PATH).toString());
        swaggerIndex.paths[routePath] = {
            $ref: `./swagger/paths/${routeName}.json`
        };
        return writeFile(SWAGGER_INDEX_FILE_PATH, JSON.stringify(swaggerIndex, null, 4))
            .catch(() => {
                throw new Error(`There was a problem adding ${routeName}`)
            })
    }

    _buildPathFile(props) {
        let file = {};
        console.log(props);
        props.operations.forEach(operation => {
            file[operation.operation] = {
                description: operation.description,
                sumary: operation.id,
                'x-swagger-router-controller': props.routeController,
                operationId: operation.id,
                parameters: operation.parameters.map(parameter => {
                    return {
                        name: parameter.name,
                        in: parameter.in,
                        description: parameter.description,
                        type: parameter.type
                    }
                })
                
            }
        });
        return file;
    }

    writing(routeName) {
        const swaggerPathFileContent = this._buildPathFile(this.props);

        return Promise.all([
            this._addRouteToSwagger(routeName, this.props.routeController)
                .then(() => console.log(`Route ${routeName} added correctly`)),
            this._createSwaggerPathFile(`swagger/paths/${routeName}.json`, swaggerPathFileContent)
                .then(() => console.log(`Path file "${routeName}.json" created successfuly`))
        ]);
    }

};
