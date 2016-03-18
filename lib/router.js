'use strict';

var Buffer = require('buffer').Buffer;

var extend = require('xtend');
var HttpHash = require('http-hash');
var url = require('fast-url-parser');

var NOT_FOUND_BODY = new Buffer('{"message":"Not Found"}');
var NOT_FOUND_STATUS_CODE = 404;
var NOT_FOUND_HEADERS = {
    'content-type': 'application/json; charset=utf-8',
    'content-length': NOT_FOUND_BODY.length
};

var METHOD_NOT_ALLOWED_BODY = new Buffer('{"message":"Method Not Allowed"}');
var METHOD_NOT_ALLOWED_STATUS_CODE = 405;
var METHOD_NOT_ALLOWED_HEADERS = {
    'content-type': 'application/json; charset=utf-8',
    'content-length': METHOD_NOT_ALLOWED_BODY.length
};

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

// Provide a function to handle incoming requests when a handler
// cannot be found.
urlNotFound := function defaultNotFound(req, res) {
    res.statusCode = 404;
    res.setHeader('content-type', 'application/json');
    res.end('{ message: "Not Found"}');
};
*/

module.exports = HttpServiceRouter;

function HttpServiceRouter(routerOptions) {
    var hash = this.hash = new HttpHash();
    var services = routerOptions.services;

    this.urlNotFound = routerOptions.urlNotFound || defaultNotFound;
    this.methodNotAllowed = routerOptions.methodNotAllowed ||
        defaultMethodNotAllowed;

    var serviceNames = Object.keys(services);

    for (var i = 0; i < serviceNames.length; i++) {
        var serviceName = serviceNames[i];
        var service = services[serviceName];

        mountService(hash, serviceName, service);
    }
}

HttpServiceRouter.prototype.handleRequest = handleEndpointRequest;

function mountService(hash, serviceName, serviceDefinition) {
    var routePrefix = serviceDefinition.route;
    var methods = serviceDefinition.methods;
    var methodNames = Object.keys(methods);

    for (var i = 0; i < methodNames.length; i++) {
        var methodName = methodNames[i];
        var method = methods[methodName];
        var routeSuffix = method.route;
        var routeHandler = method.handler;
        var httpMethod = method.httpMethod;

        var endpoint = new Endpoint(serviceName, methodName, routeHandler);
        var route = routePrefix + routeSuffix;
        var currentMethods = hash.get(route).handler;

        checkHttpMethod(
            currentMethods,
            httpMethod,
            serviceName,
            methodName
        );

        if (!currentMethods) {
            currentMethods = {};
            hash.set(route, currentMethods);
        }

        currentMethods[httpMethod] = endpoint;
    }
}

function Endpoint(serviceName, methodName, routeHandler) {
    this.serviceName = serviceName;
    this.methodName = methodName;
    this.routeHandler = routeHandler;
}

Endpoint.prototype.handleRequest = endpointHandleRequest;

function endpointHandleRequest(req, res, opts) {
    var requestContext = opts.requestContext;
    requestContext.serviceName = this.serviceName;
    requestContext.methodName = this.methodName;
    this.routeHandler(req, res, opts);
}

function handleEndpointRequest(req, res, opts) {
    var perRequestOpts = extend(opts);
    var requestContext = perRequestOpts.requestContext = {};
    var parsedUrl = requestContext.parsedUrl = url.parse(req.url, true);

    var route = this.hash.get(parsedUrl.pathname);
    var methodHandlers = route.handler;
    requestContext.params = route.params;
    requestContext.splats = route.splats;

    if (methodHandlers) {
        var handler = methodHandlers[req.method];

        if (handler) {
            handler.handleRequest(req, res, perRequestOpts);
        } else {
            this.methodNotAllowed(req, res, perRequestOpts);
        }
    } else {
        this.urlNotFound(req, res, perRequestOpts);
    }
}

function checkHttpMethod(currentMethods, httpMethod, serviceName, methodName) {
    if (!httpMethod || typeof httpMethod !== 'string') {
        var missingMethodError = new Error('HTTP method must be defined');
        missingMethodError.httpMethod = httpMethod;
        missingMethodError.serviceName = serviceName;
        missingMethodError.methodName = methodName;
        throw missingMethodError;
    }

    if (httpMethod.toUpperCase() !== httpMethod) {
        var caseError = new Error('HTTP methods must be uppercase');
        caseError.httpMethod = httpMethod;
        caseError.serviceName = serviceName;
        caseError.methodName = methodName;
        throw caseError;
    }

    if (currentMethods && currentMethods.hasOwnProperty(httpMethod)) {
        var definedError = new Error('HTTP method is already defined');
        definedError.httpMethod = httpMethod;
        definedError.serviceName = serviceName;
        definedError.methodName = methodName;
        throw definedError;
    }
}

function defaultNotFound(req, res) {
    res.writeHead(NOT_FOUND_STATUS_CODE, NOT_FOUND_HEADERS);
    res.end(NOT_FOUND_BODY);
}

function defaultMethodNotAllowed(req, res) {
    res.writeHead(METHOD_NOT_ALLOWED_STATUS_CODE, METHOD_NOT_ALLOWED_HEADERS);
    res.end(METHOD_NOT_ALLOWED_BODY);
}
