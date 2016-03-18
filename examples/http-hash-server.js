'use strict';

var test = require('tape');

var createServer = require('../index.js');

test('Create hello world service', function t(assert) {

    var server = createServer({
        hostname: '127.0.0.1',
        port: 0,
        services: {
            helloWorld: {
                route: '/',
                methods: {
                    helloWorld: {
                        httpMethod: 'GET',
                        route: '/hello',
                        handler: function handleRequest(req, res, opts) {
                            res.end('world');
                        }
                    }
                }
            }
        }
    });

    server.listen(function onServerListen(err) {
        assert.ifError(err);

        console.log(server);
    });
});

/*
// Provide a definition for a collection of service with http
// annotations.
services := {
    'serviceId': {
        'route': '/service/prefix',
        'methods': {
            'methodId': {
                'httpMethod': 'GET',
                'route': '/method/route',
                'handler': function handleRequest(req, res, opts) {
                    // Handle request
                    res.end('ok');
                }
            }
        }
    }
};
*/
