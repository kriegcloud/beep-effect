export * from "string-ts";
export type NonEmptyString<T extends string = string> = T extends "" ? never : T;
