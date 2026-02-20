export interface IPrimitiveUnion_Bar {
    'bar': number;
    'type': "bar";
}

export interface IPrimitiveUnion_Foo {
    'foo': string;
    'type': "foo";
}

export interface IPrimitiveUnion_Uuid {
    'uuid': string;
    'type': "uuid";
}

function isBar(obj: IPrimitiveUnion): obj is IPrimitiveUnion_Bar {
    return (obj.type === "bar");
}

function bar(obj: number): IPrimitiveUnion_Bar {
    return {
        bar: obj,
        type: "bar",
    };
}

function isFoo(obj: IPrimitiveUnion): obj is IPrimitiveUnion_Foo {
    return (obj.type === "foo");
}

function foo(obj: string): IPrimitiveUnion_Foo {
    return {
        foo: obj,
        type: "foo",
    };
}

function isUuid(obj: IPrimitiveUnion): obj is IPrimitiveUnion_Uuid {
    return (obj.type === "uuid");
}

function uuid(obj: string): IPrimitiveUnion_Uuid {
    return {
        uuid: obj,
        type: "uuid",
    };
}

export type IPrimitiveUnion = IPrimitiveUnion_Bar | IPrimitiveUnion_Foo | IPrimitiveUnion_Uuid;

export interface IPrimitiveUnionVisitor<T> {
    'bar': (obj: number) => T;
    'foo': (obj: string) => T;
    'uuid': (obj: string) => T;
    'unknown': (obj: IPrimitiveUnion) => T;
}

function visit<T>(obj: IPrimitiveUnion, visitor: IPrimitiveUnionVisitor<T>): T {
    if (isBar(obj)) {
        return visitor.bar(obj.bar);
    }
    if (isFoo(obj)) {
        return visitor.foo(obj.foo);
    }
    if (isUuid(obj)) {
        return visitor.uuid(obj.uuid);
    }
    return visitor.unknown(obj);
}

export const IPrimitiveUnion = {
    isBar: isBar,
    bar: bar,
    isFoo: isFoo,
    foo: foo,
    isUuid: isUuid,
    uuid: uuid,
    visit: visit
};
