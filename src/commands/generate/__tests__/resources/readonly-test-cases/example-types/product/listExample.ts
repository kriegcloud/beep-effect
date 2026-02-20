export interface IListExample {
    readonly 'items': ReadonlyArray<string>;
    readonly 'primitiveItems': ReadonlyArray<number>;
    readonly 'doubleItems': ReadonlyArray<number | "NaN">;
}
