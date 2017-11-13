'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../services/sequelize');

const <%= modelName %> = sequelize.define('<%= modelName %>', {
    <% for (i = 0; i < properties.length; i++) { %>
    <%= properties[i].name %>: {
        type: Sequelize.<%= properties[i].type.toUpperCase() %>
    }<% if(i < properties.length - 1) { %>, <% } %>
<% } %>
});

module.exports = <%= modelName %>;
