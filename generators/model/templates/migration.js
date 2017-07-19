'use strict';

function up(query, DataTypes) {
    return query.createTable('<%= modelName %>s', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
    <% for (i = 0; i < properties.length; i++) { %>
        <%= properties[i].name %>: {
            type: DataTypes.<%= properties[i].type.toUpperCase() %>
        },
    <% } %>
        createdAt: {
            type: DataTypes.DATE
        },

        updatedAt: {
            type: DataTypes.DATE
        }
    });
}

function down(query, sequelize) {
    return Promise.resolve();
}

module.exports = {
    up: up,
    down: down
};
