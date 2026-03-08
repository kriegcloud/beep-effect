export = shexjs__writer;

declare class shexjs__writer {
    constructor(outputStream: any, options: any);

    addPrefix(prefix: any, iri: any, done: any): void;

    addPrefixes(prefixes: any, done: any): void;

    addShape(shape: any, name: any, done: any): void;

    addShapes(shapes: any): void;

    end(done: any): any;

    writeSchema(shape: any, done: any): void;

}


