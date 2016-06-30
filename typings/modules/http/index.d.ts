declare module "http" {
    import { Buffer } from "buffer";

    export interface ServerResponse {
        // Extended base methods
        write(buffer: Buffer): boolean;
        write(buffer: Buffer, cb?: Function): boolean;
        write(str: string, cb?: Function): boolean;
        write(str: string, encoding?: string, cb?: Function): boolean;
        write(str: string, encoding?: string, fd?: string): boolean;

        writeContinue(): void;
        writeHead(statusCode: number, reasonPhrase?: string, headers?: any): void;
        writeHead(statusCode: number, headers?: any): void;
        statusCode: number;
        statusMessage: string;
        headersSent: boolean;
        setHeader(name: string, value: string | string[]): void;
        sendDate: boolean;
        getHeader(name: string): string;
        removeHeader(name: string): void;
        write(chunk: any, encoding?: string): any;
        addTrailers(headers: any): void;

        // Extended base methods
        end(): void;
        end(buffer: Buffer, cb?: Function): void;
        end(str: string, cb?: Function): void;
        end(str: string, encoding?: string, cb?: Function): void;
        end(data?: any, encoding?: string): void;
    }

    export interface IncomingMessage {
        httpVersion: string;
        headers: any;
        rawHeaders: string[];
        trailers: any;
        rawTrailers: any;
        setTimeout(msecs: number, callback: Function): void;
        /**
         * Only valid for request obtained from http.Server.
         */
        method?: string;
        /**
         * Only valid for request obtained from http.Server.
         */
        url?: string;
        /**
         * Only valid for response obtained from http.ClientRequest.
         */
        statusCode?: number;
        /**
         * Only valid for response obtained from http.ClientRequest.
         */
        statusMessage?: string;
    }

    export interface ServerRequest {
        httpVersion: string;
        headers: any;
        rawHeaders: string[];
        trailers: any;
        rawTrailers: any;
        setTimeout(msecs: number, callback: Function): void;
        method: string;
        url: string;

        statusMessage?: string;
    }

    export interface Socket {

    }

    export function createServer(
        requestListener?: (
            request: ServerRequest, response: ServerResponse
        ) => void
    ): Server;

    export interface ListenOptions {
        port?: number;
        host?: string;
        backlog?: number;
        path?: string;
        exclusive?: boolean;
    }

    export interface Server {
        setTimeout(msecs: number, callback: Function): void;
        maxHeadersCount: number;
        timeout: number;

        listen(port: number, hostname?: string, backlog?: number, listeningListener?: Function): Server;
        listen(port: number, hostname?: string, listeningListener?: Function): Server;
        listen(port: number, backlog?: number, listeningListener?: Function): Server;
        listen(port: number, listeningListener?: Function): Server;
        listen(path: string, backlog?: number, listeningListener?: Function): Server;
        listen(path: string, listeningListener?: Function): Server;
        listen(handle: any, backlog?: number, listeningListener?: Function): Server;
        listen(handle: any, listeningListener?: Function): Server;
        listen(options: ListenOptions, listeningListener?: Function): Server;

        address(): { port: number; family: string; address: string; };

        close(callback?: Function): Server;

        on(event: 'request', handler: (
            req: ServerRequest, res: ServerResponse
        ) => void): void;


        on(event: 'connection', handler: (
            socket: Socket
        ) => void): void;

        on(event: 'error', handler: (err: Error) => void): void;
    }

}
