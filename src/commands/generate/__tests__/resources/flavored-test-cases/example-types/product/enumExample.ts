/**
 * This enumerates the numbers 1:2 also 100.
 *
 */
export namespace EnumExample {
    export type ONE = "ONE";
    export type TWO = "TWO";
    /** Value of 100. */
    export type ONE_HUNDRED = "ONE_HUNDRED";

    export const ONE = "ONE" as "ONE";
    export const TWO = "TWO" as "TWO";
    export const ONE_HUNDRED = "ONE_HUNDRED" as "ONE_HUNDRED";
}

export type EnumExample = keyof typeof EnumExample;
