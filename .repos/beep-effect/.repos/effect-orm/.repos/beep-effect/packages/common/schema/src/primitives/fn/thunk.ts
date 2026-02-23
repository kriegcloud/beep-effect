import * as F from "effect/Function";
import * as S from "effect/Schema";

export const ThunkSchema = <A, E, R>(schema: S.Schema<A, E, R>, guard?: (i: unknown) => boolean) =>
  S.declare((i: unknown): i is () => S.Schema.Type<typeof schema> => (guard ? guard(i) : F.isFunction(i)));

export declare namespace ThunkSchema {
  export type SchemaType<A, E, R> = ReturnType<typeof ThunkSchema<A, E, R>>;

  export type Type<A, E, R> = S.Schema.Type<SchemaType<A, E, R>>;

  export type Encoded<A, E, R> = S.Schema.Encoded<SchemaType<A, E, R>>;
}
