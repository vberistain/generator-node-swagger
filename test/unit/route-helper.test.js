const Route = require('../../helpers/route');
const path = require('path');
const chai = require('chai');
const should = chai.should();

describe('routeHelper', () => {
    describe('getDefaultRouteFileName', () => {
        it('should return a right route file name for a not parameterized route', () => {
           new Route('/users').getDefaultRouteFileName().should.equal('users');
        });

        it('should return a right route file name for a parameterized route', () => {
           new Route('/users/{id}').getDefaultRouteFileName().should.equal('user');
           new Route('/tvshows/{id}').getDefaultRouteFileName().should.equal('tvshow');
        });

        it('should return a right route file name for a parameterized route with a prefix', () => {
           new Route('/v3/tvshows/{tvshowId}').getDefaultRouteFileName().should.equal('v3/tvshow');
        });
    });

    describe('getOperationId', () => {
        it('should return a right operationId file name for a GET operation with a not parameterized route', () => {
           new Route('/users').getOperationId('get').should.equal('get');
        });

        it('should return a right operationId file name for a POST operation with a non parameterized route', () => {
           new Route('/users').getOperationId('post').should.equal('create');
           new Route('/v3/users').getOperationId('post').should.equal('create');
        });

        it('should return a right operationId file name for GET operation with several parameterized entities', () => {
           new Route('/tvshows/{id}/season/{seasonNumber}').getOperationId('get').should.equal('getBySeasonNumber');
           new Route('/v3/tvshows/{id}/season/{seasonNumber}').getOperationId('get').should.equal('getBySeasonNumber');
        });

        it('should return a right operationId file name for a GET operation with a parameterized route', () => {
           new Route('/users/{id}').getOperationId('get').should.equal('getById');
           new Route('/tvshows/{tvshowId}').getOperationId('get').should.equal('getByTvshowId');
        });

    });

    describe('_hasAVersionPrefix', () => {
        it('should return false when the route has a version prefix', () => {
           new Route('/users')._hasAVersionPrefix().should.equal(false);
           new Route('/notaversion/users')._hasAVersionPrefix().should.equal(false);
        });

        it('should return true when the route has a version prefix', () => {
           new Route('/v3/users')._hasAVersionPrefix().should.equal(true);
           new Route('/v232/users')._hasAVersionPrefix().should.equal(true);
        });

    });

    describe('_getRouteEntity', () => {
        it('should return a valid entity', () => {
           new Route('/users')._getRouteEntity().should.equal('users');
           new Route('/v3/users')._getRouteEntity().should.equal('users');
           new Route('/v3/users/{id}')._getRouteEntity().should.equal('user');
           new Route('/v3/tvshows/{id}/seasons/{seasonNumber}')._getRouteEntity().should.equal('season');
           new Route('/v3/tvshows/{id}/seasons')._getRouteEntity().should.equal('seasons');
        });
    });

    describe('getRoutePath', () => {
        it('should return a valid path', () => {
           new Route('/users').getRoutePath().should.equal('./swagger/paths/users.json');
           new Route('/v3/users').getRoutePath().should.equal('./swagger/paths/v3/users.json');
           new Route('/v3/users/{id}').getRoutePath().should.equal('./swagger/paths/v3/user.json');
           new Route('/v3/tvshows/{id}/seasons/{seasonNumber}').getRoutePath().should.equal('./swagger/paths/v3/season.json');
           new Route('/v3/tvshows/{id}/seasons').getRoutePath().should.equal('./swagger/paths/v3/seasons.json');
        });
    });
});
