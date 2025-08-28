export * from "string-ts";
export type NonEmptyString<T extends string> = T extends "" ? never : T;
