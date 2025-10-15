export type NonEmptyString<T extends string = string> = T extends "" ? never : T;
export type LowercaseNonEmptyString<T extends string = string> = T extends NonEmptyString<T>
  ? T extends Lowercase<T>
    ? T
    : never
  : never;
