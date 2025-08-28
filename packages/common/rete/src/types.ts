// TODO: lol make this adhere to the schema?

import type { UnsafeTypes } from "@beep/types";

export type InternalFactRepresentation<TSchema> = [string, keyof TSchema, UnsafeTypes.UnsafeAny];

export type Binding<T> = {
  [Key in keyof T]: Required<T[Key]> & { id: string };
};

export type IdAttr<S> = [string, keyof S];
export type IdAttrs<S> = IdAttr<S>[];
