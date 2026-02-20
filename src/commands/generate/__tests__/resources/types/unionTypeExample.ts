export interface IUnionTypeExample_String {
    'string': string;
    'type': "string";
}

export interface IUnionTypeExample_Set {
    'set': Array<string>;
    'type': "set";
}

function isString(obj: IUnionTypeExample): obj is IUnionTypeExample_String {
    return (obj.type === "string");
}

function string(obj: string): IUnionTypeExample_String {
    return {
        string: obj,
        type: "string",
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

export type IUnionTypeExample = IUnionTypeExample_String | IUnionTypeExample_Set;

export interface IUnionTypeExampleVisitor<T> {
    'string': (obj: string) => T;
    'set': (obj: Array<string>) => T;
    'unknown': (obj: IUnionTypeExample) => T;
}

function visit<T>(obj: IUnionTypeExample, visitor: IUnionTypeExampleVisitor<T>): T {
    if (isString(obj)) {
        return visitor.string(obj.string);
    }
    if (isSet(obj)) {
        return visitor.set(obj.set);
    }
    return visitor.unknown(obj);
}

export const IUnionTypeExample = {
    isString: isString,
    string: string,
    isSet: isSet,
    set: set,
    visit: visit
};
