/* @flow */
'use strict';

var HttpHashRouter = require('./lib/router');
var HttpHashServer = require('./lib/server.js');

import type { Router } from './lib/server.js';

type ServicesConfig = { [k: string]: {
    route: string,
    methods: { [k: string]: {
        route: string,
        handler: string,
        httpMethod: string
    } }
} }

type TServerOptions = {
    services: ServicesConfig,
    hostname: string,
    port: number,
    globalRequestOptions: null
};

module.exports = createServer;

class RouterOptions {
    services: ServicesConfig;
    urlNotFound: null;
    methodNotAllowed: null;

    constructor(opts) {
        this.services = opts.services;
        this.urlNotFound = opts.urlNotFound || null;
        this.methodNotAllowed = opts.methodNotAllowed || null;
    }
}

class ServerOptions {
    hostname: string;
    port: number;
    router: Router;
    globalRequestOptions: null;

    constructor(opts, router) {
        this.hostname = opts.hostname;
        this.port = opts.port;
        this.router = router;
        this.globalRequestOptions = opts.globalRequestOptions;
    }
}

function createServer(opts: TServerOptions) {
    var routerOpts = new RouterOptions(opts);
    var router = new HttpHashRouter(routerOpts);

    var serverOpts = new ServerOptions(opts, router);
    var server = new HttpHashServer(serverOpts);

    return server;
}
