/**
 * Attach the same default value for constructor creation and missing-key
 * decoding.
 *
 * @module @beep/schema/SchemaUtils/withKeyDefaults
 * @since 0.0.0
 */
import { pipe } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

/**
 * Applies a shared default value to a schema field for both constructor-time
 * defaults and decoding-time missing keys.
 *
 * This helper combines `Schema.withConstructorDefault` and
 * `Schema.withDecodingDefaultKey` using the same value, so the provided default
 * must be valid for both the schema's runtime `Type` and encoded `Encoded`
 * representation.
 *
 * Supports both call styles:
 * - Data-last: `pipe(S.String, withKeyDefaults("draft"))`
 * - Data-first: `withKeyDefaults(S.String, "draft")`
 *
 * @category Utility
 * @since 0.0.0
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { withKeyDefaults } from "@beep/schema/SchemaUtils/withKeyDefaults"
 *
 * const Status = withKeyDefaults(S.String, "draft")
 * void Status
 * ```
 */
export const withKeyDefaults: {
  <const TSchema extends S.Top & S.WithoutConstructorDefault>(
    defaultValue: TSchema["Type"] & TSchema["Encoded"]
  ): (self: TSchema) => S.withDecodingDefaultKey<S.withConstructorDefault<TSchema>>;
  <const TSchema extends S.Top & S.WithoutConstructorDefault>(
    self: TSchema,
    defaultValue: TSchema["Type"] & TSchema["Encoded"]
  ): S.withDecodingDefaultKey<S.withConstructorDefault<TSchema>>;
} = dual(
  2,
  <const TSchema extends S.Top & S.WithoutConstructorDefault>(
    self: TSchema,
    defaultValue: TSchema["Type"] & TSchema["Encoded"]
  ): S.withDecodingDefaultKey<S.withConstructorDefault<TSchema>> =>
    pipe(
      self,
      S.withConstructorDefault(() => O.some(defaultValue)),
      S.withDecodingDefaultKey(() => defaultValue)
    )
);
