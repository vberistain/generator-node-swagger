'use strict';
var yeoman = require('yeoman-generator');
var moment = require('moment');
var fs = require('fs');
console.log('ffds');

module.exports = yeoman.Base.extend({
  prompting: function () {
    return this.prompt([]).then(function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function () {
  }

});
