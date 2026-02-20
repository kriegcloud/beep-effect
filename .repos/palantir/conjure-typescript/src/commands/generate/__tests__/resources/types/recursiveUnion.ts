import { IStringAlias } from "./stringAlias";

export interface IRecursiveUnion_RecursiveField {
    'recursiveField': IRecursiveUnion;
    'type': "recursiveField";
}

export interface IRecursiveUnion_StringAlias {
    'stringAlias': IStringAlias;
    'type': "stringAlias";
}

function isRecursiveField(obj: IRecursiveUnion): obj is IRecursiveUnion_RecursiveField {
    return (obj.type === "recursiveField");
}

function recursiveField(obj: IRecursiveUnion): IRecursiveUnion_RecursiveField {
    return {
        recursiveField: obj,
        type: "recursiveField",
    };
}

function isStringAlias(obj: IRecursiveUnion): obj is IRecursiveUnion_StringAlias {
    return (obj.type === "stringAlias");
}

function stringAlias(obj: IStringAlias): IRecursiveUnion_StringAlias {
    return {
        stringAlias: obj,
        type: "stringAlias",
    };
}

export type IRecursiveUnion = IRecursiveUnion_RecursiveField | IRecursiveUnion_StringAlias;

export interface IRecursiveUnionVisitor<T> {
    'recursiveField': (obj: IRecursiveUnion) => T;
    'stringAlias': (obj: IStringAlias) => T;
    'unknown': (obj: IRecursiveUnion) => T;
}

function visit<T>(obj: IRecursiveUnion, visitor: IRecursiveUnionVisitor<T>): T {
    if (isRecursiveField(obj)) {
        return visitor.recursiveField(obj.recursiveField);
    }
    if (isStringAlias(obj)) {
        return visitor.stringAlias(obj.stringAlias);
    }
    return visitor.unknown(obj);
}

export const IRecursiveUnion = {
    isRecursiveField: isRecursiveField,
    recursiveField: recursiveField,
    isStringAlias: isStringAlias,
    stringAlias: stringAlias,
    visit: visit
};
