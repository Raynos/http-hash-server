# http-hash-server

<!--
    [![build status][build-png]][build]
    [![Coverage Status][cover-png]][cover]
    [![Davis Dependency status][dep-png]][dep]
-->

<!-- [![NPM][npm-png]][npm] -->

HTTP server for http-hash router

## Example

```js
var createServe = require("http-hash-server");

// GET /example/buzzer returns `buzz`
var server = createServer({
    hostname: '127.0.0.1',
    port: 9000,
    services: {
        example: {
            route: '/example',
            methods: {
                buzzer: {
                    httpMethod: 'GET',
                    route: '/buzzer',
                    handler: function handleRequest(req, res, opts) {
                        opts.deps.logger.info(opts.requestContext.serviceName);
                        // -> "example"

                        opts.deps.logger.info(opts.requestContext.methodName);
                        // -> "bazzer"

                        res.end('buzz');
                    }
                }
            }
        }
    },
    globalRequestOptions: {
        deps: {
            logger: console
        }
    }
});

server.listen(function onServerListen(err) {
    assert.ifError(err);
});
```

```
curl -X GET http://127.0.0.1:9000/example/buzzer
-> buzz
```

```
curl -X POST http://127.0.0.1:9000/example/buzzer
-> {"message": "Method Not Allowed"}
```

```
curl -X GET http://127.0.0.1:9000/foo
-> {"message": "URL Not Found"}
```

## Concept and Motivation

A basic http server implementation involes routing requests to a handler and
dealing with bad requests (not found, or method not allowed). Http-hash is a
tree-structure based router than can be used for such purposes. This module
aims to provide a pairing of the http-hash router with a server implementation
for doing the very basics of http in node.

An http route handler is considered to have the interface

```js
function requestHandler(req, res, opts)
```

Where `req` and `res` are the unadulterated `IncomingRequest` and
`OutgoingReponse` streams supplied by the node http implementation, and opts
are a global object, shallow-cloned for each request, used for storing request
meta-information and doing dependency injection of global service dependencies.


The route table is based around two pieces of information, the *service* and
the *method*. Services are essentially collections of methods. A service has a
top level route and each method has a route. A method's route nests under the
service's route, for example the service `foo` that mounts on `/foo` can
implement method `bar` with route `/bar`, giving us a service method routed by
the URL `/foo/bar`.

Basic implementations will mount a single service on `/` and implement a
handful of methods. Complicated services could implement many services
under different prefixes.


## API Documentation

### `var createServer = require('http-hash-server')`

```ocaml
createServer: (HttpHashServerOpts) => HttpHashServer

```

The http-hash-server module exposes a safe constructor for the HttpHashSerer
constructor function, so it is created without using the `new` keyword.

### `var server = createServer(opts)`


```ocaml

HttpHashServerOpts := {
    hostname?: String,
    port: Number,
    globalRequestOptions?: Object as GlobalRequestOptions,
    handleNotFound?: RequestHandler,
    handleMethodNotAllowed?: RequestHandler,
    services: ServiceDefinition
}

HttpHashServer := {
    globalRequestOptions: Object,
    family: String,
    hostname: String,
    port: Number,
    init: (cb: (err) => void) => void
    destroy: (cb: (err) => void) => void
}
```

The HTTP hash server in created by passing a set of options, which comprises of
the following

#### `opts.hostname : String`

This is the address of the interface for the server to listen on,
**Default:** `"127.0.0.1"`

#### `opts.port : Number`

The port that the server should listen on. The port must be an integer value
greater than or equal to 0. Port 0 will be assigned to a random port by the
operating system and the HttpHashServer port property with reflect this new
port after the server is initialized.
**Required**

#### `opts.globalRequestOptions : Object`

The global request options are shallow cloned and passed into each request. The
server adds extra information to this object to provide context on the route
that has been matched.
**Default:** `{}`

#### `opts.handleNotFound: RequestHandler`

If a route is not matched, the server will handle this by returning a
`404 Not Found` response, with a JSON body `{message: "Not Found"}`. Setting
this option will override the default not-found handler and use the specified
route handler for all unresolved requests. Note that because the route is
unmatched, the `serviceName` and `methodName` on the request context are null.

#### `opts.handleMethodNotAllowed: RequestHandler`

If a route is matched but there is no route handler specified for the http
method of the current request, the `methodNotFound` route handler is invoked.
By default, the server will return a `405 Method Not Allowed` response with a
JSON body `{message: 'Method Not Allowed'}`. Setting this option will override
the default method-not-allowed handler.

#### `opts.services: ServiceDefinition`

``` ocaml
ServiceDefinition := {
    $serviceName: {
        route: String,
        methods: {
            $methodName: {
                httpMethod: String,
                route: String,
                handler: (
                    req: HttpRequest,
                    res: HttpResponse,
                    opts: RequestOptions
                ) => void
            }
        }
    }
}
```

The service defintion is essentially a hash map of ServiceName => Methods. The
service route is a route prefix for the routes defined for each of the service
methods.


### `function handleRequest(req, res, opts)`

```ocaml
RequestHandler := (HttpRequest, HttpResponse, RequestOptions) => Void

RequestOptions := GlobalRequestOptions & {
    requestContext: {
            requestTime: Number,
            parsedUrl: NodeParsedUrl,
            params: Object<String, String>,
            splat: String | null,
            serviceName: String | null,
            methodName: String | null
        }
    }
}
```

The options derive from the the gloabl request options passed into the
`HttpHashServer` constructor. The options are shallow cloned for each request
and the key `requestContext` added.

#### `opts.requestContext.requestTime`

The request time is added to the request context as early as possible to ensure
correct statistics for endpoint latencies. The value is the result of
`Date.now()`.

#### `opts.requestContext.parsedUrl`

In order to do the route matching, http-hash-server calls
`url.parse(req.url, true)`. This provides the pathname to do the route matching
and provides the parsed query for consumers.

#### `opts.requestContext.params`

The params matched in the route. For example, a route with params defined as
`/user/:id/messages` would yield params with an `id` key.

#### `opts.requetContext.splat`

If a route has a splat i.e. `/service/collection/*`, the suffix of the request
(i.e. the * portion) is retained in the `splat` field. If the route does not
have a splat, the value is null.

#### `opts.requestContext.serviceName`

The service name that owns the matched route. It can be null in the not found
and method not allowed handlers.

#### `opts.requestContext.methodName`

The method name associated with the matched route. It can be null in the not
found and method not allowed handlers.


### ```server.init(cb)```

Calls `this.server.listen` and calls the callback when the socket is open. Calls
back with an error if there was an error listening on the socket.


### ```server.destroy(cb)```

Calls `this.server.close()` and invokes the callback immediately.



## Installation

`npm install http-hash-server`

## Tests

`npm test`

## NPM scripts

 - `npm run cover` This runs the tests with code coverage
 - `npm run lint` This will run the linter on your code
 - `npm test` This will run the tests.
 - `npm run view-cover` This will show code coverage in a browser
 - `npm run check-licence` This will verify all files are licenced
 - `npm run add-licence` This will add licence files

## Contributors

 - Matt Esch

## MIT Licenced

  [build-png]: https://secure.travis-ci.org/Matt-Esch/http-hash-server.png
  [build]: https://travis-ci.org/Matt-Esch/http-hash-server
  [cover-png]: https://coveralls.io/repos/Matt-Esch/http-hash-server/badge.png
  [cover]: https://coveralls.io/r/Matt-Esch/http-hash-server
  [dep-png]: https://david-dm.org/Matt-Esch/http-hash-server.png
  [dep]: https://david-dm.org/Matt-Esch/http-hash-server
  [test-png]: https://ci.testling.com/Matt-Esch/http-hash-server.png
  [tes]: https://ci.testling.com/Matt-Esch/http-hash-server
  [npm-png]: https://nodei.co/npm/http-hash-server.png?stars&downloads
  [npm]: https://nodei.co/npm/http-hash-server
