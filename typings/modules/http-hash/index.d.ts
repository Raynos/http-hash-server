

declare module 'http-hash' {
    class HttpHash<T> {
        constructor();

        get(key: string): {
            handler: T,
            splat: null,
            params: null,
            src: null
        };
        set(key: string, v: T): void;
    }

    export = HttpHash;
}
