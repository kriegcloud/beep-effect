import { IStringExample } from "./stringExample";

/** Docs for when UnionTypeExample is of type StringExample. */
export interface IUnionTypeExample_StringExample {
    'stringExample': IStringExample;
    'type': "stringExample";
}

export interface IUnionTypeExample_Set {
    'set': Array<string>;
    'type': "set";
}

export interface IUnionTypeExample_ThisFieldIsAnInteger {
    'thisFieldIsAnInteger': number;
    'type': "thisFieldIsAnInteger";
}

export interface IUnionTypeExample_AlsoAnInteger {
    'alsoAnInteger': number;
    'type': "alsoAnInteger";
}

export interface IUnionTypeExample_If {
    'if': number;
    'type': "if";
}

export interface IUnionTypeExample_New {
    'new': number;
    'type': "new";
}

export interface IUnionTypeExample_Interface {
    'interface': number;
    'type': "interface";
}

function isStringExample(obj: IUnionTypeExample): obj is IUnionTypeExample_StringExample {
    return (obj.type === "stringExample");
}

function stringExample(obj: IStringExample): IUnionTypeExample_StringExample {
    return {
        stringExample: obj,
        type: "stringExample",
    };
}

function isSet(obj: IUnionTypeExample): obj is IUnionTypeExample_Set {
    return (obj.type === "set");
}

function set(obj: Array<string>): IUnionTypeExample_Set {
    return {
        set: obj,
        type: "set",
    };
}

function isThisFieldIsAnInteger(obj: IUnionTypeExample): obj is IUnionTypeExample_ThisFieldIsAnInteger {
    return (obj.type === "thisFieldIsAnInteger");
}

function thisFieldIsAnInteger(obj: number): IUnionTypeExample_ThisFieldIsAnInteger {
    return {
        thisFieldIsAnInteger: obj,
        type: "thisFieldIsAnInteger",
    };
}

function isAlsoAnInteger(obj: IUnionTypeExample): obj is IUnionTypeExample_AlsoAnInteger {
    return (obj.type === "alsoAnInteger");
}

function alsoAnInteger(obj: number): IUnionTypeExample_AlsoAnInteger {
    return {
        alsoAnInteger: obj,
        type: "alsoAnInteger",
    };
}

function isIf(obj: IUnionTypeExample): obj is IUnionTypeExample_If {
    return (obj.type === "if");
}

function if_(obj: number): IUnionTypeExample_If {
    return {
        if: obj,
        type: "if",
    };
}

function isNew(obj: IUnionTypeExample): obj is IUnionTypeExample_New {
    return (obj.type === "new");
}

function new_(obj: number): IUnionTypeExample_New {
    return {
        new: obj,
        type: "new",
    };
}

function isInterface(obj: IUnionTypeExample): obj is IUnionTypeExample_Interface {
    return (obj.type === "interface");
}

function interface_(obj: number): IUnionTypeExample_Interface {
    return {
        interface: obj,
        type: "interface",
    };
}

/** A type which can either be a StringExample, a set of strings, or an integer. */
export type IUnionTypeExample = IUnionTypeExample_StringExample | IUnionTypeExample_Set | IUnionTypeExample_ThisFieldIsAnInteger | IUnionTypeExample_AlsoAnInteger | IUnionTypeExample_If | IUnionTypeExample_New | IUnionTypeExample_Interface;

export interface IUnionTypeExampleVisitor<T> {
    'stringExample': (obj: IStringExample) => T;
    'set': (obj: Array<string>) => T;
    'thisFieldIsAnInteger': (obj: number) => T;
    'alsoAnInteger': (obj: number) => T;
    'if': (obj: number) => T;
    'new': (obj: number) => T;
    'interface': (obj: number) => T;
    'unknown': (obj: IUnionTypeExample) => T;
}

function visit<T>(obj: IUnionTypeExample, visitor: IUnionTypeExampleVisitor<T>): T {
    if (isStringExample(obj)) {
        return visitor.stringExample(obj.stringExample);
    }
    if (isSet(obj)) {
        return visitor.set(obj.set);
    }
    if (isThisFieldIsAnInteger(obj)) {
        return visitor.thisFieldIsAnInteger(obj.thisFieldIsAnInteger);
    }
    if (isAlsoAnInteger(obj)) {
        return visitor.alsoAnInteger(obj.alsoAnInteger);
    }
    if (isIf(obj)) {
        return visitor.if(obj.if);
    }
    if (isNew(obj)) {
        return visitor.new(obj.new);
    }
    if (isInterface(obj)) {
        return visitor.interface(obj.interface);
    }
    return visitor.unknown(obj);
}

export const IUnionTypeExample = {
    isStringExample: isStringExample,
    stringExample: stringExample,
    isSet: isSet,
    set: set,
    isThisFieldIsAnInteger: isThisFieldIsAnInteger,
    thisFieldIsAnInteger: thisFieldIsAnInteger,
    isAlsoAnInteger: isAlsoAnInteger,
    alsoAnInteger: alsoAnInteger,
    isIf: isIf,
    if_: if_,
    isNew: isNew,
    new_: new_,
    isInterface: isInterface,
    interface_: interface_,
    visit: visit
};
