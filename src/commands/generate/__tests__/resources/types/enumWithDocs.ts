/** Some documentation */
export namespace EnumWithDocs {
    /** Some field documentation */
    export type FOO = "FOO";
    export type BAR = "BAR";

    export const FOO = "FOO" as "FOO";
    export const BAR = "BAR" as "BAR";
}

export type EnumWithDocs = keyof typeof EnumWithDocs;
