'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var swaggerIndexFilePath = 'swagger/index.json';

function addSwaggerPath(routePath, routeName) {
    console.log(routePath, routeName);
    var swaggerIndex = JSON.parse(fs.readFileSync(swaggerIndexFilePath).toString());
    console.log(swaggerIndex);
    swaggerIndex.paths[routePath] = {
        "$ref": `./swagger/paths/${routeName}.json`
    };
    fs.writeFile(swaggerIndexFilePath, JSON.stringify(swaggerIndex, null, 4));
}

function addSwaggerParams(routePath, routeName, routeFilePath) {
    var swaggerPathFile = JSON.parse(fs.readFileSync(routeFilePath).toString());
    swaggerPathFile.paths[routePath] = {
        "$ref": `./swagger/paths/${routeName}.json`
    };
    fs.writeFile(swaggerIndexFilePath, JSON.stringify(swaggerPathFile, null, 4));
}

function stringToParams(paramString) {
    var res = [];
    if (!paramString) {
        return res;
    }
    var params = paramString.replace(/\s+/g,"").split(',')
    params.forEach(function(param){
        res.push({
            name: param.split(':')[0],
            type: param.split(':')[1]
        });
    });
    console.log(res);
    return res;
}

module.exports = yeoman.Base.extend({
  prompting: function (routeName, routePath, propString) {
    var prompts = [
        {
            type: 'input',
            name: 'routeController',
            message: 'Route controller?'
        },
        {
            type: 'input',
            name: 'routeDescription',
            message: 'Route description?'
        }
    ];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function (routeName, routePath, propString) {
    addSwaggerPath(routePath, routeName);
    this.fs.copyTpl(
        this.templatePath('path.json'),
        this.destinationPath(`swagger/paths/${routeName}.json`), {
            routeName: routeName,
            routeDescription: this.props.routeDescription,
            routeController: this.props.routeController,
            routeOperationId: routeName
        }
    );

    var properties = stringToParams(propString);
    addSwaggerParams(routePath, properties, `swagger/paths/${routeName}.json`)
    
  }

});
