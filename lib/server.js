'use strict';

var assert = require('assert');
var http = require('http');

var DEFAULT_HOSTNAME = '127.0.0.1';

var T_STATE_BEFORE_LISTENING = 0;
var T_STATE_BEGIN_LISTENING = 1;
var T_STATE_LISTENING = 2;
var T_STATE_DESTROYING = 3;
var T_STATE_DESTROYED = 4;

module.exports = HttpHashServer;

function HttpHashServer(opts) {

    assert(opts, 'Expected opts in HttpHashServer constructor');

    var hostname = opts.hostname === undefined ?
        DEFAULT_HOSTNAME :
        opts.hostname;

    assert(
        typeof hostname === 'string',
        'Expected hostname to be a string in HttpHashServer constructor'
    );

    var port = opts.port;
    assert(
        typeof port === 'number' && (port | 0) === port && port >= 0,
        'Expected opts.port to be an integer >= 0 in HttpHashServer constructor'
    );

    var router = opts.router;
    assert(router, 'Expected opts.router in HttpHashServer constructor');

    this._state = T_STATE_BEFORE_LISTENING;

    this._httpServer = http.createServer(bindHttpHashHandleRequest);
    this._router = router;

    this.family = '';
    this.globalRequestOptions = opts.globalRequestOptions || {};
    this.hostname = hostname;
    this.port = port;

    var self = this;
    function bindHttpHashHandleRequest(req, res) {
        self._handleRequest(req, res);
    }
}

HttpHashServer.prototype._handleRequest = serverHandleRequest;
function serverHandleRequest(req, res) {
    this._router.handleRequest(req, res, this.globalRequestOptions);
}

HttpHashServer.prototype.listen = serverListen;
function serverListen(callback) {
    var self = this;

    if (self._state !== T_STATE_BEFORE_LISTENING) {
        throw new Error('Server cannot start listening');
    }

    self._state = T_STATE_BEGIN_LISTENING;
    self._httpServer.listen(this.port, this.hostname, bindOnServerListening);

    function bindOnServerListening() {
        self._onServerListening(callback);
    }
}

HttpHashServer.prototype.destroy = serverDestroy;
function serverDestroy(callback) {
    var self = this;

    if (self._state !== T_STATE_LISTENING) {
        return;
    }

    self._state = T_STATE_DESTROYING;

    self._httpServer.close(function bindOnServerDestroyed() {
        self._onServerDestroyed(callback);
    });
}

HttpHashServer.prototype._onServerListening = onServerListening;
function onServerListening(callback) {
    var self = this;

    self._state = T_STATE_LISTENING;

    var address = self._httpServer.address();
    self.hostname = address.address;
    self.family = address.family;
    self.port = address.port;

    if (callback) {
        callback(null);
        return;
    }
}

HttpHashServer.prototype._onServerDestroyed = onServerDestroyed;
function onServerDestroyed(callback) {
    this._state = T_STATE_DESTROYED;

    if (callback) {
        callback(null);
        return;
    }
}
