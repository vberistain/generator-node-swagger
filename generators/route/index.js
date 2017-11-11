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

function addSwaggerPath(routePath, routeName) {
    console.log(swaggerIndexFilePath);
    var swaggerIndex = JSON.parse(fs.readFileSync(swaggerIndexFilePath).toString());
    swaggerIndex.paths[routePath] = {
        $ref: `./swagger/paths/${routeName}.json`
    };
    fs.writeFile(swaggerIndexFilePath, JSON.stringify(swaggerIndex, null, 4));
}

function addSwaggerParams(routePath, routeName, routeFilePath) {
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
}


function stringToParams(paramString) {
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
}

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
    }

    prompting(routeName) {

        let properties = {};
        const originalMessage = this.operationPrompts[0].message;

        return this.prompt(this.initPrompts)
            .then(props => {
                return seq(props.operations.map((operation, i) => {
                    return (() => {
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
                        })
                }))
                .then(() => {
                    this.props = props;
                })

                // for (let operation of properties.operations) {
                //     operationPrompts[0].message = operationPrompts[0].message.replace('%operation%', operation.toUpperCase());

                //     let result = await execPromp(operationPrompts);
                //     const op = properties.operations[i]
                //     properties.operations[i] = {
                //         operation: op,
                //         description: operationProps.operationDescription
                //     };
                //     console.log(result);
                // }

                // console.log('DONE', properties);

            });
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
