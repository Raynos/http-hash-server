

declare module 'http-hash' {
    class HttpHash<T> {
        constructor();

        get(key: string): {
            handler: T
        };
        set(key: string, v: T): void;
    }

    export = HttpHash;
}
