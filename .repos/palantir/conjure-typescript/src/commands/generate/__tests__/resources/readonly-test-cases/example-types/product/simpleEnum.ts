export namespace SimpleEnum {
    export type VALUE = "VALUE";

    export const VALUE = "VALUE" as "VALUE";
}

export type SimpleEnum = keyof typeof SimpleEnum;
