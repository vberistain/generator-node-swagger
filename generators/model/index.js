'use strict';
var yeoman = require('yeoman-generator');
var moment = require('moment');
var fs = require('fs');

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

    prompting: function (modelName, modelProperties) {
        var prompts = [];

        return this.prompt(prompts).then(function (props) {
          this.props = props;
        }.bind(this));
    },

    writing: function (modelName, modelProperties) {
        var modelCapitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);

        var properties = stringToParams(modelProperties);
        this.fs.copyTpl(
            this.templatePath('model.js'),
            this.destinationPath(`src/models/${modelCapitalized}.js`), {
                modelName: modelCapitalized,
                properties: properties
            }
        );
        this.fs.copyTpl(
            this.templatePath('migration.js'),
            this.destinationPath(`migrations/${moment().format('YYYYMMDDHHmmss')}.js`), {
                modelName: modelCapitalized,
                properties: properties
            }
        );
    }
});
