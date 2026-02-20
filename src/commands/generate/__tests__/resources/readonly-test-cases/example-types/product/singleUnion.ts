export interface ISingleUnion_Foo {
    readonly 'foo': string;
    readonly 'type': "foo";
}

function isFoo(obj: ISingleUnion): obj is ISingleUnion_Foo {
    return (obj.type === "foo");
}

function foo(obj: string): ISingleUnion_Foo {
    return {
        foo: obj,
        type: "foo",
    };
}

export type ISingleUnion = ISingleUnion_Foo;

export interface ISingleUnionVisitor<T> {
    readonly 'foo': (obj: string) => T;
    readonly 'unknown': (obj: ISingleUnion) => T;
}

function visit<T>(obj: ISingleUnion, visitor: ISingleUnionVisitor<T>): T {
    if (isFoo(obj)) {
        return visitor.foo(obj.foo);
    }
    return visitor.unknown(obj);
}

export const ISingleUnion = {
    isFoo: isFoo,
    foo: foo,
    visit: visit
};
