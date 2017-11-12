'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
    prompting: function () {
        return this.prompt([]).then(function (props) {
            this.props = props;
        }.bind(this));
    },

    writing: function () {
    }

});
