'use strict';

var test = require('tape');

var Buffer = require('buffer').Buffer;
var http = require('http');
var url = require('fast-url-parser');

var createServer = require('../index.js');

test('Create hello world service', function t(assert) {
    var routes = [{
        request: {
            url: '/hello'
        },
        response: {
            statusCode: 200,
            body: 'world'
        }
    }];

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
        assert.ifError(err, 'Expected server list to not error');
        testRoutes(assert, server, routes, onTestFinish);
    });

    function onTestFinish() {
        console.log('end tests');
        server.destroy(function onDestroyed() {
            console.log('fishcake');
        });
        assert.end();
    }
});

function testRoutes(assert, server, routes, cb) {
    var routeIndex = 0;
    runTestRoute();

    function runTestRoute() {
        if (routeIndex >= routes.length) {
            return cb(null);
        }

        var route = routes[routeIndex++];
        testRoute(assert, server, route, runTestRoute);
    }
}

function testRoute(assert, server, route, cb) {
    var testurl = url.format({
        protocol: 'http',
        hostname: server.hostname,
        port: server.port,
        pathname: route.url,
        query: route.query
    });

    console.log(testurl);

    cb(null);
}

/* rudimentary implementation of the typed request client */
function TypedRequestClient(opts) {
    this.protocol = 'http';
    this.hostname = opts.hostname;
    this.port = opts.port;
    this.family = opts.family;
    this.agent = opts.agent || null;
}

TypedRequestClient.prototype.request = sendTypedRequest;
function sendTypedRequest(typedRequest, opts, callback) {
    var self = this;

    var clientRequest = http.request({
        protocol: this.protocol,
        hostname: this.hostname,
        family: this.family,
        port: this.port,
        method: typedRequest.method,
        path: typedRequest.url,
        headers: typedRequest.headers,
        agent: this.agent
    }, function onClientResponse(err, clientResponse) {
        self.handleResponse(err, clientResponse, typedRequest, opts, callback);
    });

    var body = typedRequest.body;
    if (body === null || body === undefined) {
        clientRequest.end();
    } else if (typeof body === 'string' || Buffer.isBuffer(body)) {
        clientRequest.end(body);
    } else {
        clientRequest.end(JSON.serialize(body));
    }

}

TypedRequestClient.prototype.handleResponse = handleClientResponse;
function handleClientResponse(
    err, clientResponse, typedRequest, opts, callback
) {
    if (err) {
        return callback(err);
    }

    var
}


'use strict';

var test = require('tape');

var Buffer = require('buffer').Buffer;
var http = require('http');
var url = require('fast-url-parser');

var createServer = require('../index.js');

test('Create hello world service', function t(assert) {
    var routes = [{
        request: {
            url: '/hello'
        },
        response: {
            statusCode: 200,
            body: 'world'
        }
    }];

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
        assert.ifError(err, 'Expected server list to not error');
        testRoutes(assert, server, routes, onTestFinish);
    });

    function onTestFinish() {
        console.log('end tests');
        server.destroy(function onDestroyed() {
            console.log('fishcake');
        });
        assert.end();
    }
});

function testRoutes(assert, server, routes, cb) {
    var routeIndex = 0;
    runTestRoute();

    function runTestRoute() {
        if (routeIndex >= routes.length) {
            return cb(null);
        }

        var route = routes[routeIndex++];
        testRoute(assert, server, route, runTestRoute);
    }
}

function testRoute(assert, server, route, cb) {
    var testurl = url.format({
        protocol: 'http',
        hostname: server.hostname,
        port: server.port,
        pathname: route.url,
        query: route.query
    });

    console.log(testurl);

    cb(null);
}



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
