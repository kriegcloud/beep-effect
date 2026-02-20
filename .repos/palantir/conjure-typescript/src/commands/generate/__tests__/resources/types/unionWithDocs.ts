/** Some field documentation */
export interface IUnionWithDocs_Bar {
    'bar': number;
    'type': "bar";
}

export interface IUnionWithDocs_Foo {
    'foo': string;
    'type': "foo";
}

function isBar(obj: IUnionWithDocs): obj is IUnionWithDocs_Bar {
    return (obj.type === "bar");
}

function bar(obj: number): IUnionWithDocs_Bar {
    return {
        bar: obj,
        type: "bar",
    };
}

function isFoo(obj: IUnionWithDocs): obj is IUnionWithDocs_Foo {
    return (obj.type === "foo");
}

function foo(obj: string): IUnionWithDocs_Foo {
    return {
        foo: obj,
        type: "foo",
    };
}

/** Some documentation */
export type IUnionWithDocs = IUnionWithDocs_Bar | IUnionWithDocs_Foo;

export interface IUnionWithDocsVisitor<T> {
    'bar': (obj: number) => T;
    'foo': (obj: string) => T;
    'unknown': (obj: IUnionWithDocs) => T;
}

function visit<T>(obj: IUnionWithDocs, visitor: IUnionWithDocsVisitor<T>): T {
    if (isBar(obj)) {
        return visitor.bar(obj.bar);
    }
    if (isFoo(obj)) {
        return visitor.foo(obj.foo);
    }
    return visitor.unknown(obj);
}

export const IUnionWithDocs = {
    isBar: isBar,
    bar: bar,
    isFoo: isFoo,
    foo: foo,
    visit: visit
};
