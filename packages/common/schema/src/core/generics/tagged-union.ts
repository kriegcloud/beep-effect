/**
 * schema generics for building tagged union structs.
 *
 * Provides constructors that share discriminator metadata across literal cases.
 *
 * @example
 * import { TaggedUnion } from "@beep/schema/core/generics/tagged-union";
 *
 * const Type = TaggedUnion("_tag");
 *
 * @category Core/Generics
 * @since 0.1.0
 */

import type { StructTypes, UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { $GenericsId } from "../../internal";
import { Struct } from "../extended/extended-schemas";
import type { OptionalWithDefault } from "../types";

const { $TaggedUnionId: Id } = $GenericsId.compose("tagged-union");
/**
 * Namespace bundling tagged union schema and runtime helper types.
 *
 * @example
 * import * as S from "effect/Schema";
 * import type { TaggedUnion } from "@beep/schema/core/generics/tagged-union";
 *
 * type AuthSchema = TaggedUnion.Schema<"type", "password", { id: typeof S.String }>;
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export declare namespace TaggedUnion {
  /**
   * Struct schema carrying a discriminator key whose literal defaults to a provided tag.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type Schema<
    Discriminator extends string,
    Literal extends string,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = Literal extends UnsafeTypes.UnsafeAny
    ? S.Struct<
        {
          readonly [K in Discriminator]: OptionalWithDefault<Literal>;
        } & Fields
      >
    : never;

  /**
   * Runtime type of a tagged union struct schema.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type Type<
    Discriminator extends string,
    Literal extends string,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Schema.Type<Schema<Discriminator, Literal, Fields>>;
}

/**
 * Creates a schema factory that pins a discriminator key while allowing multiple literal cases.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TaggedUnion } from "@beep/schema/core/generics/tagged-union";
 *
 * const Discriminator = TaggedUnion<"_tag", string, { id: S.Schema.Any }>("_tag");
 * const Person = Discriminator("Person", { id: S.String });
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export const TaggedUnion =
  <
    const Discriminator extends string,
    const Literal extends string,
    const Fields extends StructTypes.StructFieldsWithStringKeys,
  >(
    discriminator: Discriminator
  ) =>
  (tag: Literal, fields: Fields) =>
    Struct({
      [discriminator]: S.Literal(tag).pipe(
        S.optional,
        S.withDefaults({
          constructor: () => tag,
          decoding: () => tag,
        })
      ),
      ...fields,
    }).annotations(
      Id.annotations("TaggedUnion", {
        description: "Struct schema factory for discriminated unions.",
      })
    ) as TaggedUnion.Schema<Discriminator, Literal, Fields>;
