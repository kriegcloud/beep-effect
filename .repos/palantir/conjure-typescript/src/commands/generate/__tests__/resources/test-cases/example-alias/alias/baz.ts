export interface IBaz_Str {
    'str': string;
    'type': "str";
}

export interface IBaz_Date {
    'date': string;
    'type': "date";
}

function isStr(obj: IBaz): obj is IBaz_Str {
    return (obj.type === "str");
}

function str(obj: string): IBaz_Str {
    return {
        str: obj,
        type: "str",
    };
}

function isDate(obj: IBaz): obj is IBaz_Date {
    return (obj.type === "date");
}

function date(obj: string): IBaz_Date {
    return {
        date: obj,
        type: "date",
    };
}

export type IBaz = IBaz_Str | IBaz_Date;

export interface IBazVisitor<T> {
    'str': (obj: string) => T;
    'date': (obj: string) => T;
    'unknown': (obj: IBaz) => T;
}

function visit<T>(obj: IBaz, visitor: IBazVisitor<T>): T {
    if (isStr(obj)) {
        return visitor.str(obj.str);
    }
    if (isDate(obj)) {
        return visitor.date(obj.date);
    }
    return visitor.unknown(obj);
}

export const IBaz = {
    isStr: isStr,
    str: str,
    isDate: isDate,
    date: date,
    visit: visit
};
