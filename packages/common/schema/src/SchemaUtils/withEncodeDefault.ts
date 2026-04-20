/**
 * A module containing a schema utility which provides a default value
 *
 * @module \@beep/schema/SchemaUtils/withEncodeDefault
 * @since 0.0.0
 */
import { Effect, pipe, SchemaGetter } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

/**
 * An effect/Schema utility to provide a default value
 *
 * @category Utility
 * @since 0.0.0
 * @template TSchema
 * @param self - The schema to apply the default to
 * @param defaultValue - A function that returns the
 * default value
 * @returns A schema with the default value applied
 */
export const withEncodeDefault: {
  <const TSchema extends S.Top>(
    self: TSchema,
    defaultValue: () => TSchema["Type"]
  ): S.decodeTo<S.toType<TSchema>, S.optionalKey<TSchema>>;
  <const TSchema extends S.Top>(
    defaultValue: () => TSchema["Type"]
  ): (self: TSchema) => S.decodeTo<S.toType<TSchema>, S.optionalKey<TSchema>>;
} = dual(
  2,
  <const TSchema extends S.Top>(
    self: TSchema,
    defaultValue: () => TSchema["Type"]
  ): S.decodeTo<S.toType<TSchema>, S.optionalKey<TSchema>> =>
    pipe(
      self,
      S.optionalKey,
      S.decodeTo(S.toType(self), {
        decode: SchemaGetter.withDefault(Effect.sync(defaultValue)),
        encode: SchemaGetter.required(),
      })
    )
);
