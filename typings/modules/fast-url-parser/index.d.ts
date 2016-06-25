

declare module 'fast-url-parser' {
    var url = {
        parse(url: string, strict: boolean): {
            pathname: string;
        };
    };

    export = url;
}
