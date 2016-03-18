'use strict';

var test = require('tape');
var http = require('http');

var BodyReader = require('./lib/body-reader.js');
var TypedRequestClient = require('./lib/typed-request-client.js');

var createServer = require('../index.js');

test('Basic service', function t(assert) {
    var routes = [{
        request: {
            method: 'GET',
            url: '/hello'
        },
        response: {
            statusCode: 200,
            body: 'world'
        }
    }, {
        request: {
            method: 'POST',
            url: '/hello'
        },
        response: {
            statusCode: 405,
            body: {
                message: http.STATUS_CODES[405]
            }
        }
    }, {
        request: {
            method: 'GET',
            url: '/foo'
        },
        response: {
            statusCode: 404,
            body: {
                message: http.STATUS_CODES[404]
            }
        }
    }];

    var server = createServer({
        hostname: '127.0.0.1',
        port: 0,
        services: {
            helloWorld: {
                route: '/',
                methods: {
                    worldMethod: {
                        httpMethod: 'GET',
                        route: '/hello',
                        handler: handleRequest
                    }
                }
            }
        }
    });

    function handleRequest(req, res, opts) {
        var requestContext = opts.requestContext;
        assert.ok(requestContext, 'Expected requestContext on request opts');
        assert.ok(
            requestContext.requestTime <= Date.now(),
            'Expected valid requestTime on request context'
        );
        assert.ok(
            requestContext.parsedUrl && requestContext.parsedUrl.pathname,
            'Expected parsedUrl on request context'
        );
        assert.ok(requestContext.params, 'Expected params on request context');
        assert.strictEqual(
            Object.keys(requestContext.params).length,
            0,
            'Expected request to have 0 params'
        );
        assert.strictEqual(
            requestContext.splat,
            null,
            'Expected splat to be null on request context'
        );
        assert.strictEqual(
            requestContext.serviceName,
            'helloWorld',
            'Expected correct service name on request context'
        );
        assert.strictEqual(
            requestContext.methodName,
            'worldMethod',
            'Expected correct method name on request context'
        );
        res.end('world');
    }

    server.listen(function onServerListen(err) {
        assert.ifError(err, 'Expected server list to not error');
        testRoutes(assert, server, routes, onTestFinish);
    });

    function onTestFinish() {
        server.destroy();
        assert.end();
    }
});

test('Service with id param', function t(assert) {
    var routes = [{
        request: {
            method: 'GET',
            url: '/users/123/profile/basic'
        },
        response: {
            statusCode: 200,
            body: 'world'
        }
    }, {
        request: {
            method: 'POST',
            url: '/users/123/profile/basic'
        },
        response: {
            statusCode: 405,
            body: {
                message: http.STATUS_CODES[405]
            }
        }
    }, {
        request: {
            method: 'GET',
            url: '/users/123/history/basic'
        },
        response: {
            statusCode: 404,
            body: {
                message: http.STATUS_CODES[404]
            }
        }
    }];

    var server = createServer({
        hostname: '127.0.0.1',
        port: 0,
        services: {
            userService: {
                route: '/users/:id',
                methods: {
                    profiles: {
                        httpMethod: 'GET',
                        route: '/profile/:type',
                        handler: handleRequest
                    }
                }
            }
        }
    });

    function handleRequest(req, res, opts) {
        var requestContext = opts.requestContext;
        assert.ok(requestContext, 'Expected requestContext on request opts');
        assert.ok(
            requestContext.requestTime <= Date.now(),
            'Expected valid requestTime on request context'
        );
        assert.ok(
            requestContext.parsedUrl && requestContext.parsedUrl.pathname,
            'Expected parsedUrl on request context'
        );
        assert.ok(requestContext.params, 'Expected params on request context');
        assert.strictEqual(
            Object.keys(requestContext.params).length,
            2,
            'Expected request to have 2 params'
        );
        assert.strictEqual(
            requestContext.params.id,
            '123',
            'Expected id param on request context'
        );
        assert.strictEqual(
            requestContext.params.type,
            'basic',
            'Expected type param on request context'
        );
        assert.strictEqual(
            requestContext.splat,
            null,
            'Expected splat to be null on request context'
        );
        assert.strictEqual(
            requestContext.serviceName,
            'userService',
            'Expected correct service name on request context'
        );
        assert.strictEqual(
            requestContext.methodName,
            'profiles',
            'Expected correct method name on request context'
        );
        res.end('world');
    }

    server.listen(function onServerListen(err) {
        assert.ifError(err, 'Expected server list to not error');
        testRoutes(assert, server, routes, onTestFinish);
    });

    function onTestFinish() {
        server.destroy();
        assert.end();
    }
});

test('Service with splat', function t(assert) {
    var routes = [{
        request: {
            method: 'GET',
            url: '/users/123/profile/basic'
        },
        response: {
            statusCode: 200,
            body: 'world'
        }
    }, {
        request: {
            method: 'POST',
            url: '/users/123/profile/basic'
        },
        response: {
            statusCode: 405,
            body: {
                message: http.STATUS_CODES[405]
            }
        }
    }, {
        request: {
            method: 'GET',
            url: '/users/123/history/basic'
        },
        response: {
            statusCode: 404,
            body: {
                message: http.STATUS_CODES[404]
            }
        }
    }];

    var server = createServer({
        hostname: '127.0.0.1',
        port: 0,
        services: {
            userService: {
                route: '/users/:id',
                methods: {
                    profiles: {
                        httpMethod: 'GET',
                        route: '/profile/:type',
                        handler: handleRequest
                    }
                }
            }
        }
    });

    function handleRequest(req, res, opts) {
        var requestContext = opts.requestContext;
        assert.ok(requestContext, 'Expected requestContext on request opts');
        assert.ok(
            requestContext.requestTime <= Date.now(),
            'Expected valid requestTime on request context'
        );
        assert.ok(
            requestContext.parsedUrl && requestContext.parsedUrl.pathname,
            'Expected parsedUrl on request context'
        );
        assert.ok(requestContext.params, 'Expected params on request context');
        assert.strictEqual(
            Object.keys(requestContext.params).length,
            2,
            'Expected request to have 2 params'
        );
        assert.strictEqual(
            requestContext.params.id,
            '123',
            'Expected id param on request context'
        );
        assert.strictEqual(
            requestContext.params.type,
            'basic',
            'Expected type param on request context'
        );
        assert.strictEqual(
            requestContext.splat,
            null,
            'Expected splat to be null on request context'
        );
        assert.strictEqual(
            requestContext.serviceName,
            'userService',
            'Expected correct service name on request context'
        );
        assert.strictEqual(
            requestContext.methodName,
            'profiles',
            'Expected correct method name on request context'
        );
        res.end('world');
    }

    server.listen(function onServerListen(err) {
        assert.ifError(err, 'Expected server list to not error');
        testRoutes(assert, server, routes, onTestFinish);
    });

    function onTestFinish() {
        server.destroy();
        assert.end();
    }
});

test('Multiple methods', function t(assert) {
    var routes = [{
        request: {
            method: 'POST',
            url: '/todos',
            body: 'acquire 2 cats'
        },
        response: {
            statusCode: 201,
            headers: {
                location: '/todos/0'
            }
        }
    }, {
        request: {
            method: 'GET',
            url: '/todos/0'
        },
        response: {
            statusCode: 200,
            body: 'acquire 2 cats'
        }
    }, {
        request: {
            method: 'PUT',
            url: '/todos/0',
            body: 'acquire 3 cats'
        },
        response: {
            statusCode: 204
        }
    }];

    var server = createServer({
        hostname: '127.0.0.1',
        port: 0,
        services: {
            todos: {
                route: '/todos',
                methods: {
                    getTodo: {
                        httpMethod: 'GET',
                        route: '/:id',
                        handler: getTodo
                    },
                    addTodo: {
                        httpMethod: 'POST',
                        route: '/',
                        handler: addTodo
                    },
                    updateTodo: {
                        httpMethod: 'PUT',
                        route: '/:id',
                        handler: updateTodo
                    }
                }
            }
        }
    });

    var todos = [];

    function getTodo(req, res, opts) {
        assertOpts(opts, 'getTodo', { id: '0' });
        res.writeHead(200);
        res.end(todos[0]);
    }

    function addTodo(req, res, opts) {
        assertOpts(opts, 'addTodo', {});
        var reader = new BodyReader(req, null, function onGetBody(err, body) {
            assert.ifError(err, 'Expected body reader not to error');
            todos.push(body.toString());
            res.writeHead(201, { location: '/todos/0' });
            res.end();
        });
        reader.read();
    }

    function updateTodo(req, res, opts) {
        assertOpts(opts, 'updateTodo', { id: '0' });
        var reader = new BodyReader(req, null, function onGetBody(err, body) {
            assert.ifError(err, 'Expected body reader not to error');
            todos[0] = body.toString();
            res.writeHead(204);
            res.end();
        });
        reader.read();
    }

    server.listen(function onServerListen(err) {
        assert.ifError(err, 'Expected server list to not error');
        testRoutes(assert, server, routes, onTestFinish);
    });

    function assertOpts(opts, expectedMethod, expectedParams) {
        var requestContext = opts.requestContext;
        assert.ok(requestContext, 'Expected requestContext on request opts');
        assert.ok(
            requestContext.requestTime <= Date.now(),
            'Expected valid requestTime on request context'
        );
        assert.deepEqual(
            requestContext.params,
            expectedParams,
            'Expected params on request context'
        );
        assert.strictEqual(
            requestContext.splat,
            null,
            'Expected splat to be null on request context'
        );
        assert.strictEqual(
            requestContext.serviceName,
            'todos',
            'Expected correct service name on request context'
        );
        assert.strictEqual(
            requestContext.methodName,
            expectedMethod,
            'Expected correct method name on request context'
        );
    }

    function onTestFinish() {
        server.destroy();
        assert.end();
    }
});

test('Custom URL not found/method not allowed', function t(assert) {
    var routes = [{
        request: {
            method: 'POST',
            url: '/hello'
        },
        response: {
            statusCode: 405,
            body: 'Oops, Method Not Allowed'
        }
    }, {
        request: {
            method: 'GET',
            url: '/foo'
        },
        response: {
            statusCode: 404,
            body: 'Oops, Not Found'
        }
    }];

    var server = createServer({
        hostname: '127.0.0.1',
        port: 0,
        services: {
            helloWorld: {
                route: '/',
                methods: {
                    worldMethod: {
                        httpMethod: 'GET',
                        route: '/hello',
                        handler: handleRequest
                    }
                }
            }
        },
        urlNotFound: customUrlNotFound,
        methodNotAllowed: customMethodNotAllowed
    });

    function handleRequest(req, res, opts) {
        var requestContext = opts.requestContext;
        assert.ok(requestContext, 'Expected requestContext on request opts');
        assert.ok(
            requestContext.requestTime <= Date.now(),
            'Expected valid requestTime on request context'
        );
        assert.ok(
            requestContext.parsedUrl && requestContext.parsedUrl.pathname,
            'Expected parsedUrl on request context'
        );
        assert.ok(requestContext.params, 'Expected params on request context');
        assert.strictEqual(
            Object.keys(requestContext.params).length,
            0,
            'Expected request to have 0 params'
        );
        assert.strictEqual(
            requestContext.splat,
            null,
            'Expected splat to be null on request context'
        );
        assert.strictEqual(
            requestContext.serviceName,
            'helloWorld',
            'Expected correct service name on request context'
        );
        assert.strictEqual(
            requestContext.methodName,
            'worldMethod',
            'Expected correct method name on request context'
        );
        res.end('world');
    }

    function customUrlNotFound(req, res, opts) {
        res.writeHead(404);
        res.end('Oops, Not Found');
    }

    function customMethodNotAllowed(req, res, opts) {
        res.writeHead(405);
        res.end('Oops, Method Not Allowed');
    }

    server.listen(function onServerListen(err) {
        assert.ifError(err, 'Expected server list to not error');
        testRoutes(assert, server, routes, onTestFinish);
    });

    function onTestFinish() {
        server.destroy();
        assert.end();
    }
});

/*
test(least options HOSTNAME)
test(double init throws)
test(double close calls callback)
test full GET PUT POST DELETE
test 
*/

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
    var testClient = new TypedRequestClient(server);

    testClient.request(route.request, null, function onClientRes(err, val) {
        assert.ifError(err, 'Expected request to return a response');

        assert.strictEqual(
            val.statusCode,
            route.response.statusCode,
            'Expected route to return correct status code'
        );

        var contentType = val.headers['content-type'] || '';

        if (contentType.indexOf('application/json') === 0) {
            assert.deepEqual(
                JSON.parse(val.body),
                route.response.body,
                'Expected route to return correct JSON body'
            );
        } else if (val.body.length === 0) {
            assert.strictEqual(
                undefined,
                route.response.body,
                'Expected route to return no body'
            );
        } else {
            assert.strictEqual(
                val.body.toString('utf8'),
                route.response.body,
                'Expected route to return correct body'
            );
        }

        cb(null);
    });
}

// test leading slash in route
// test missing port
// test error on init (does the callback still get called)
// test bad service configuration
// --> no services
// --> service with no route
// --> service with no methods
// --> method with no route
// --> method with no handler
// --> test basic route and assert request context
// --> test route with param and assert request context
// --> test route with splat and assert request context
// --> test service prefix with id
// --> test service prefix with splat (should not be allowed)
// Do something about errors on the server 
