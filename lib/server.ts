'use strict';

import assert = require('assert');
import http = require('http');

import { Server } from 'http';
import { Socket } from 'net';
import { ServerRequest, ServerResponse } from 'http';
import HttpHashRouter from './router';
import { HandlerOpts } from './router';

interface Callback<T> {
    (err: null | Error, value?: T): void;
}

var DEFAULT_HOSTNAME = '127.0.0.1';

var T_STATE_BEFORE_LISTENING = 0;
var T_STATE_BEGIN_LISTENING = 1;
var T_STATE_LISTENING = 2;
var T_STATE_DESTROYING = 3;
var T_STATE_DESTROYED = 4;

export default HttpHashServer;

class HttpHashServer {
    _state: number;
    _httpServer: Server;
    _router: HttpHashRouter;
    _initcb: null | Callback<void>;
    family: string;
    globalRequestOptions: HandlerOpts;
    hostname: string;
    port: number;

    constructor(opts: {
        hostname: string | undefined;
        port: number;
        router: HttpHashRouter;
        globalRequestOptions: null;
    }) {
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

        this._httpServer = http.createServer();
        this._router = router;
        this._initcb = null;

        this.family = '';
        this.globalRequestOptions = opts.globalRequestOptions || {};
        this.hostname = hostname;
        this.port = port;

        this._httpServer.on('request', bindHttpHashHandleRequest);
        this._httpServer.on('connection', bindHttpHashHandleConnection);
        this._httpServer.on('error', bindHttpHashHandleError);

        var self = this;

        function bindHttpHashHandleRequest(
            req: ServerRequest, res: ServerResponse
        ) {
            self._handleRequest(req, res);
        }

        function bindHttpHashHandleConnection(socket: Socket) {
            self._handleConnection(socket);
        }

        function bindHttpHashHandleError(err: Error) {
            self._handleError(err);
        }
    }

    _handleRequest(req: ServerRequest, res: ServerResponse) {
        this._router.handleRequest(req, res, this.globalRequestOptions);
    }

    _handleConnection(socket: Socket) {
        socket.setNoDelay(true);
        // TODO add custom timeout mechanism
    }

    _handleError(err: Error) {
        if (this._initcb) {
            var initcb = this._initcb;
            this._initcb = null;
            initcb(err);
        } else {
            throw err;
        }
    }

    listen(callback: (err: Error) => void) {
        var self = this;

        assert(
            self._state === T_STATE_BEFORE_LISTENING,
            'Expected one call to server.listen'
        );

        self._initcb = callback;
        self._state = T_STATE_BEGIN_LISTENING;
        self._httpServer.listen(this.port, this.hostname, bindOnServerListening);

        function bindOnServerListening() {
            self._onServerListening();
        }
    }

    _onServerListening() {
        var self = this;
        var callback = self._initcb;
        self._initcb = null;

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

    destroy(callback?: Callback<void>) {
        var self = this;

        if (self._state !== T_STATE_LISTENING) {
            return;
        }

        self._state = T_STATE_DESTROYING;

        self._httpServer.close(function bindOnServerDestroyed() {
            self._onServerDestroyed(callback);
        });
    }

    _onServerDestroyed(callback?: Callback<void>) {
        this._state = T_STATE_DESTROYED;

        if (callback) {
            callback(null);
            return;
        }
    }
}
