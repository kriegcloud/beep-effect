export namespace EnumExample {
    export type ONE = "ONE";
    export type TWO = "TWO";

    export const ONE = "ONE" as "ONE";
    export const TWO = "TWO" as "TWO";
}

export type EnumExample = keyof typeof EnumExample;
