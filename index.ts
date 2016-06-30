'use strict';

import { IncomingMessage, ServerResponse } from 'http';
import HttpHashRouter from './lib/router';
import HttpHashServer from './lib/server';
import { ServiceInfo } from './lib/router';

type ServerOpts = {
    services: {
        [serviceName: string]: ServiceInfo
    };
    urlNotFound: ServerHandlerFn | null;
    methodNotAllowed: ServerHandlerFn | null;
    port: number;
    hostname: string | undefined;
    globalRequestOptions: null;
}

export = createServer;

function createServer(opts: ServerOpts) {
    var routerOpts = new RouterOptions(opts);
    var router = new HttpHashRouter(routerOpts);

    var serverOpts = new ServerOptions(opts, router);
    var server = new HttpHashServer(serverOpts);

    return server;
}

type ServerHandlerFn = (
    req: IncomingMessage, res: ServerResponse
) => void;

class RouterOptions {
    services: {
        [serviceName: string]: ServiceInfo
    };
    urlNotFound: ServerHandlerFn | null;
    methodNotAllowed: ServerHandlerFn | null;

    constructor(opts: ServerOpts) {
        this.services = opts.services;
        this.urlNotFound = opts.urlNotFound || null;
        this.methodNotAllowed = opts.methodNotAllowed || null;
    }
}

class ServerOptions {
    hostname: string | undefined;
    port: number;
    router: HttpHashRouter;
    globalRequestOptions: null;

    constructor(opts: ServerOpts, router: HttpHashRouter) {
        this.hostname = opts.hostname;
        this.port = opts.port;
        this.router = router;
        this.globalRequestOptions = opts.globalRequestOptions;
    }
}
