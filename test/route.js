'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fs = require('fs');
const chai = require('chai');
const should = chai.should();
const ncp = require('ncp');

const resolveFile = (relativePath, dir) => {
    return path.join(dir || __dirname, relativePath);
};

const generatorsRoutePath = resolveFile('../generators/route');
const routeIndexPath = './swagger/index.json';

const removePathFromIndex = (route, dir) => {
    const index = JSON.parse(fs.readFileSync(resolveFile(routeIndexPath, dir).toString()));
    delete index.paths[route];
    fs.writeFileSync(resolveFile(routeIndexPath, dir), JSON.stringify(index, null, 4));
}

describe('node-swagger:route', () => {
    it('should add the route to the index route file and create a new path users.json', () => {
        const routeName = '/users';
        const routePath = './swagger/paths/users.json';
        return helpers.run(path.join(__dirname, '../generators/route'))
            .withArguments([routeName])
            .withPrompts({ routeController: 'user', operations: ['get', 'post'] })
            .withPrompts({ 'get:description': 'Get all users', 'get:id': 'getAll' })
            .withPrompts({ 'get:1:newParam': true })
            .withPrompts({ 'get:1:name': 'type', 'get:1:in': 'query', 'get:1:type': 'string', 'get:1:description': 'Type of the user' })
            .withPrompts({ 'get:2:newParam': false })
            .withPrompts({ 'post:description': 'Create a users', 'post:id': 'create' })
            .withPrompts({ 'post:1:newParam': true })
            .withPrompts({ 'post:1:name': 'name', 'post:1:in': 'body', 'post:1:type': 'string', 'post:1:description': 'Id of the user' })
            .withPrompts({ 'post:2:newParam': true })
            .withPrompts({ 'post:2:name': 'surname', 'post:2:in': 'body', 'post:2:type': 'string', 'post:2:description': 'Type of the user' })
            .withPrompts({ 'post:3:newParam': true })
            .withPrompts({ 'post:3:name': 'admin', 'post:3:in': 'body', 'post:3:type': 'boolean', 'post:3:description': 'Is admin' })
            .withPrompts({ 'post:4:newParam': false })
            .inTmpDir(function (dir) {
                const done = this.async();
                ncp(path.join(__dirname, '../swagger'), dir + '/swagger', done);
            })
            .then((dir) => {
                const expectedRouteFile = {
                    get: {
                        description: 'Get all users',
                        sumary: 'getAll',
                        'x-swagger-router-controller': 'user',
                        operationId: 'getAll',
                        parameters: [{
                            name: 'type',
                            in: 'query',
                            description: 'Type of the user',
                            type: 'string'
                        }]
                    },
                    post: {
                        description: 'Create a users',
                        sumary: 'create',
                        'x-swagger-router-controller': 'user',
                        operationId: 'create',
                        parameters: [{
                                name: 'name',
                                in: 'body',
                                description: 'Id of the user',
                                type: 'string'
                            },
                            {
                                name: 'surname',
                                in: 'body',
                                description: 'Type of the user',
                                type: 'string'
                            },
                            {
                                name: 'admin',
                                in: 'body',
                                description: 'Is admin',
                                type: 'boolean'
                            }
                        ]
                    }
                };
                const route = JSON.parse(fs.readFileSync(resolveFile(routePath, dir).toString()));
                route.should.eql(expectedRouteFile);
                const index = JSON.parse(fs.readFileSync(resolveFile(routeIndexPath, dir).toString()));
                index.paths['/users'].should.eql({'$ref': routePath});
            });
    });

    it('should add the route to the index route file and create a new path users.json', () => {
        const routeName = '/v3/movies/{id}';
        const routePath = './swagger/paths/v3/movie.json';
        return helpers.run(path.join(__dirname, '../generators/route'))
            .withArguments([routeName])
            .withPrompts({ routeController: 'movie', operations: ['get'] })
            .withPrompts({ 'get:description': 'Get movie by ID', 'get:id': 'getById' })
            .withPrompts({ 'get:1:newParam': true })
            .withPrompts({ 'get:1:name': 'id', 'get:1:in': 'path', 'get:1:type': 'integer', 'get:1:description': 'ID of the movie' })
            .withPrompts({ 'get:2:newParam': false })
            .inTmpDir(function (dir) {
                const done = this.async();
                ncp(path.join(__dirname, '../swagger'), dir + '/swagger', done);
            })
            .then(dir => {
                const expectedRouteFile = {
                    get: {
                        description: 'Get movie by ID',
                        sumary: 'getById',
                        'x-swagger-router-controller': 'movie',
                        operationId: 'getById',
                        parameters: [{
                            name: 'id',
                            in: 'path',
                            description: 'ID of the movie',
                            type: 'integer'
                        }]
                    }
                };
                const route = JSON.parse(fs.readFileSync(resolveFile(routePath, dir).toString()));
                route.should.eql(expectedRouteFile);
                const index = JSON.parse(fs.readFileSync(resolveFile(routeIndexPath, dir).toString()));
                index.paths['/v3/movies/{id}'].should.eql({'$ref': routePath});
            });
    });

    it('should use a default operationID', () => {
        const routeName = '/v3/movies/{id}';
        const routePath = './swagger/paths/v3/movie.json';
        return helpers.run(path.join(__dirname, '../generators/route'))
            .withArguments([routeName])
            .withPrompts({ routeController: 'movie', operations: ['get'] })
            .withPrompts({ 'get:description': 'Get movie by ID' })
            .withPrompts({ 'get:1:newParam': true })
            .withPrompts({ 'get:1:name': 'id', 'get:1:in': 'path', 'get:1:type': 'integer', 'get:1:description': 'ID of the movie' })
            .withPrompts({ 'get:2:newParam': false })
            .inTmpDir(function (dir) {
                const done = this.async();
                ncp(path.join(__dirname, '../swagger'), dir + '/swagger', done);
            })
            .then(dir => {
                const expectedRouteFile = {
                    get: {
                        description: 'Get movie by ID',
                        sumary: 'getById',
                        'x-swagger-router-controller': 'movie',
                        operationId: 'getById',
                        parameters: [{
                            name: 'id',
                            in: 'path',
                            description: 'ID of the movie',
                            type: 'integer'
                        }]
                    }
                };
                const route = JSON.parse(fs.readFileSync(resolveFile(routePath, dir).toString()));
                route.should.eql(expectedRouteFile);
                const index = JSON.parse(fs.readFileSync(resolveFile(routeIndexPath, dir).toString()));
                index.paths['/v3/movies/{id}'].should.eql({'$ref': routePath});
            });
    });

    it('should use a default controller name', () => {
        const routeName = '/v3/movies/{id}';
        const routePath = './swagger/paths/v3/movie.json';
        return helpers.run(path.join(__dirname, '../generators/route'))
            .withArguments([routeName])
            .withPrompts({ operations: ['get'] })
            .withPrompts({ 'get:description': 'Get movie by ID', 'get:id': 'getById' })
            .withPrompts({ 'get:1:newParam': true })
            .withPrompts({ 'get:1:name': 'id', 'get:1:in': 'path', 'get:1:type': 'integer', 'get:1:description': 'ID of the movie' })
            .withPrompts({ 'get:2:newParam': false })
            .inTmpDir(function (dir) {
                const done = this.async();
                ncp(path.join(__dirname, '../swagger'), dir + '/swagger', done);
            })
            .then(dir => {
                const expectedRouteFile = {
                    get: {
                        description: 'Get movie by ID',
                        sumary: 'getById',
                        'x-swagger-router-controller': 'movie',
                        operationId: 'getById',
                        parameters: [{
                            name: 'id',
                            in: 'path',
                            description: 'ID of the movie',
                            type: 'integer'
                        }]
                    }
                };
                const route = JSON.parse(fs.readFileSync(resolveFile(routePath, dir).toString()));
                route.should.eql(expectedRouteFile);
                const index = JSON.parse(fs.readFileSync(resolveFile(routeIndexPath, dir).toString()));
                index.paths['/v3/movies/{id}'].should.eql({'$ref': routePath});
            });
    });


});
