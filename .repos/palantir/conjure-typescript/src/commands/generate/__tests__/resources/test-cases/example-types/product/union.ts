export interface IUnion_Foo {
    'foo': string;
    'type': "foo";
}

export interface IUnion_Bar {
    'bar': number;
    'type': "bar";
}

export interface IUnion_Baz {
    'baz': number;
    'type': "baz";
}

function isFoo(obj: IUnion): obj is IUnion_Foo {
    return (obj.type === "foo");
}

function foo(obj: string): IUnion_Foo {
    return {
        foo: obj,
        type: "foo",
    };
}

function isBar(obj: IUnion): obj is IUnion_Bar {
    return (obj.type === "bar");
}

function bar(obj: number): IUnion_Bar {
    return {
        bar: obj,
        type: "bar",
    };
}

function isBaz(obj: IUnion): obj is IUnion_Baz {
    return (obj.type === "baz");
}

function baz(obj: number): IUnion_Baz {
    return {
        baz: obj,
        type: "baz",
    };
}

export type IUnion = IUnion_Foo | IUnion_Bar | IUnion_Baz;

export interface IUnionVisitor<T> {
    'foo': (obj: string) => T;
    'bar': (obj: number) => T;
    'baz': (obj: number) => T;
    'unknown': (obj: IUnion) => T;
}

function visit<T>(obj: IUnion, visitor: IUnionVisitor<T>): T {
    if (isFoo(obj)) {
        return visitor.foo(obj.foo);
    }
    if (isBar(obj)) {
        return visitor.bar(obj.bar);
    }
    if (isBaz(obj)) {
        return visitor.baz(obj.baz);
    }
    return visitor.unknown(obj);
}

export const IUnion = {
    isFoo: isFoo,
    foo: foo,
    isBar: isBar,
    bar: bar,
    isBaz: isBaz,
    baz: baz,
    visit: visit
};
