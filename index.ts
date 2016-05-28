'use strict';

import HttpHashRouter from './lib/router';
import HttpHashServer from './lib/server';

type ServerOpts = {
    services: null;
    urlNotFound?: null;
    methodNotAllowed?: null;
    port: null;
    hostname: null;
    globalRequestOptions: null;
}

export default createServer;

function createServer(opts: ServerOpts) {
    var routerOpts = new RouterOptions(opts);
    var router = new HttpHashRouter(routerOpts);

    var serverOpts = new ServerOptions(opts, router);
    var server = new HttpHashServer(serverOpts);

    return server;
}

class RouterOptions {
    services: null;
    urlNotFound: null;
    methodNotAllowed: null;

    constructor(opts: ServerOpts) {
        this.services = opts.services;
        this.urlNotFound = opts.urlNotFound || null;
        this.methodNotAllowed = opts.methodNotAllowed || null;
    }
}

class ServerOptions {
    hostname: null;
    port: null;
    router: HttpHashRouter;
    globalRequestOptions: null;

    constructor(opts: ServerOpts, router: HttpHashRouter) {
        this.hostname = opts.hostname;
        this.port = opts.port;
        this.router = router;
        this.globalRequestOptions = opts.globalRequestOptions;
    }
}
