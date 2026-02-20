export interface IDeprecatedUnion_Good {
    'good': string;
    'type': "good";
}

/** @deprecated use good */
export interface IDeprecatedUnion_NoGood {
    'noGood': string;
    'type': "noGood";
}

/**
 * this is no good
 * @deprecated use good
 */
export interface IDeprecatedUnion_NoGoodDoc {
    'noGoodDoc': string;
    'type': "noGoodDoc";
}

function isGood(obj: IDeprecatedUnion): obj is IDeprecatedUnion_Good {
    return (obj.type === "good");
}

function good(obj: string): IDeprecatedUnion_Good {
    return {
        good: obj,
        type: "good",
    };
}

function isNoGood(obj: IDeprecatedUnion): obj is IDeprecatedUnion_NoGood {
    return (obj.type === "noGood");
}

/** @deprecated use good */
function noGood(obj: string): IDeprecatedUnion_NoGood {
    return {
        noGood: obj,
        type: "noGood",
    };
}

function isNoGoodDoc(obj: IDeprecatedUnion): obj is IDeprecatedUnion_NoGoodDoc {
    return (obj.type === "noGoodDoc");
}

/** @deprecated use good */
function noGoodDoc(obj: string): IDeprecatedUnion_NoGoodDoc {
    return {
        noGoodDoc: obj,
        type: "noGoodDoc",
    };
}

export type IDeprecatedUnion = IDeprecatedUnion_Good | IDeprecatedUnion_NoGood | IDeprecatedUnion_NoGoodDoc;

export interface IDeprecatedUnionVisitor<T> {
    'good': (obj: string) => T;
    'noGood': (obj: string) => T;
    'noGoodDoc': (obj: string) => T;
    'unknown': (obj: IDeprecatedUnion) => T;
}

function visit<T>(obj: IDeprecatedUnion, visitor: IDeprecatedUnionVisitor<T>): T {
    if (isGood(obj)) {
        return visitor.good(obj.good);
    }
    if (isNoGood(obj)) {
        return visitor.noGood(obj.noGood);
    }
    if (isNoGoodDoc(obj)) {
        return visitor.noGoodDoc(obj.noGoodDoc);
    }
    return visitor.unknown(obj);
}

export const IDeprecatedUnion = {
    isGood: isGood,
    good: good,
    isNoGood: isNoGood,
    noGood: noGood,
    isNoGoodDoc: isNoGoodDoc,
    noGoodDoc: noGoodDoc,
    visit: visit
};
