'use strict';

var Buffer = require('buffer').Buffer;
var http = require('http');

var BodyReader = require('./body-reader.js');

module.exports = TypedRequestClient;

// A rudimentary typed request client for testing
function TypedRequestClient(opts) {
    this.protocol = 'http:';
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
    }, function onClientResponse(clientResponse) {
        self.handleResponse(null, clientResponse, typedRequest, opts, callback);
    });

    clientRequest.on('error', function onRequestError(err) {
        self.handleResponse(err, null, typedRequest, opts, callback);
    });

    var body = typedRequest.body;
    if (body === null || body === undefined) {
        clientRequest.end();
    } else if (typeof body === 'string' || Buffer.isBuffer(body)) {
        clientRequest.end(body);
    } else {
        clientRequest.end(new Buffer(JSON.serialize(body)));
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

    var self = this;
    var bodyReader = new BodyReader(
        clientResponse,
        opts,
        bindReturnTypedResponse
    );
    bodyReader.read();

    function bindReturnTypedResponse(bodyErr, body) {
        self.returnTypedResponse(bodyErr, body, clientResponse, callback);
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
