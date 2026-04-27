/**
 * Contains a helper schema to create an `S.Struct.Field` property that is
 * optional and has defaults.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, SchemaGetter } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

/**
 * Helper to create an optional key with a default value.
 *
 * Replaces `S.optionalWith(schema, { exact: true, default: () => val })` in v4.
 *
 * @since 0.0.0
 * @category utilities
 */
export const optionalKeyWithDefault: {
  <S extends S.Top>(schema: S, defaultValue: S["Type"]): S.decodeTo<S.toType<S>, S.optionalKey<S>>;
  <S extends S.Top>(defaultValue: S["Type"]): (schema: S) => S.decodeTo<S.toType<S>, S.optionalKey<S>>;
} = dual(
  2,
  <S extends S.Top>(schema: S, defaultValue: S["Type"]): S.decodeTo<S.toType<S>, S.optionalKey<S>> =>
    S.optionalKey(schema).pipe(
      S.decodeTo(S.toType(schema), {
        decode: SchemaGetter.withDefault(Effect.succeed(defaultValue)),
        encode: SchemaGetter.required(),
      })
    )
);
