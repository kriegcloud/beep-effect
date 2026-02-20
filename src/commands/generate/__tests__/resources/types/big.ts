import * as ILittle from "./little";

export interface IBig_Little {
    'little': ILittle.ILittle;
    'type': "little";
}

function isLittle(obj: IBig): obj is IBig_Little {
    return (obj.type === "little");
}

function little(obj: ILittle.ILittle): IBig_Little {
    return {
        little: obj,
        type: "little",
    };
}

export type IBig = IBig_Little;

export interface IBigVisitor<T> {
    'little': (obj: ILittle.ILittle) => T;
    'unknown': (obj: IBig) => T;
}

function visit<T>(obj: IBig, visitor: IBigVisitor<T>): T {
    if (isLittle(obj)) {
        return visitor.little(obj.little);
    }
    return visitor.unknown(obj);
}

export const IBig = {
    isLittle: isLittle,
    little: little,
    visit: visit
};
