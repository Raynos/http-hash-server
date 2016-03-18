'use strict';

var Buffer = require('buffer').Buffer;
var http = require('http');

var BodyReader = require('./body-reader.js');

// A rudimentary typed request client for testing
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
    err,
    clientResponse,
    typedRequest,
    opts,
    callback
) {
    if (err) {
        return callback(err);
    }

    var bodyReader = new BodyReader(
        clientResponse,
        opts,
        bindReturnTypedResponse
    );
    bodyReader.read();

    var self = this;
    function bindReturnTypedResponse(bodyErr, body) {
        self.returnTypedRequest(bodyErr, body, clientResponse);
    }
}

TypedRequestClient.prototype.returnTypedResponse = returnTypedResponse;
function returnTypedResponse(err, body, clientResponse, callback) {
    if (err) {
        return callback(err);
    }

    var response = new TypedResponse(clientResponse, body);
    return callback(null, response);

}

function TypedResponse(clientResponse, body) {
    this.statusCode = clientResponse.statusCode;
    this.headers = clientResponse.headers;
    this.body = body;
}
