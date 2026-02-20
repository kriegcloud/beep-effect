export interface ILittle_Double {
    'double': number | "NaN";
    'type': "double";
}

function isDouble(obj: ILittle): obj is ILittle_Double {
    return (obj.type === "double");
}

function double(obj: number | "NaN"): ILittle_Double {
    return {
        double: obj,
        type: "double",
    };
}

export type ILittle = ILittle_Double;

export interface ILittleVisitor<T> {
    'double': (obj: number | "NaN") => T;
    'unknown': (obj: ILittle) => T;
}

function visit<T>(obj: ILittle, visitor: ILittleVisitor<T>): T {
    if (isDouble(obj)) {
        return visitor.double(obj.double);
    }
    return visitor.unknown(obj);
}

export const ILittle = {
    isDouble: isDouble,
    double: double,
    visit: visit
};
