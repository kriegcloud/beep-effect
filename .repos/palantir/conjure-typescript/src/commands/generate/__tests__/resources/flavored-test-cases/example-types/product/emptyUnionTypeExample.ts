export type IEmptyUnionTypeExample = unknown;

export interface IEmptyUnionTypeExampleVisitor<T> {
    'unknown': (obj: IEmptyUnionTypeExample) => T;
}

function visit<T>(obj: IEmptyUnionTypeExample, visitor: IEmptyUnionTypeExampleVisitor<T>): T {
    return visitor.unknown(obj);
}

export const IEmptyUnionTypeExample = {
    visit: visit
};
