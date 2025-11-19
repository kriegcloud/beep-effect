/**
 * Tagged struct helpers that emit `_tag` literals with optional annotations.
 *
 * This module mirrors the union helpers while focusing on single struct cases.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TaggedStruct } from "@beep/schema/core/generics/tagged-struct";
 *
 * const Person = TaggedStruct("Person", { id: S.String });
 *
 * @category Core/Generics
 * @since 0.1.0
 */

import type { DefaultAnnotations } from "@beep/schema/core/annotations/default";
import { Struct } from "@beep/schema/core/extended/extended-schemas";
import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Namespace bundling the tagged struct schema and runtime types.
 *
 * @example
 * import * as S from "effect/Schema";
 * import type { TaggedStruct } from "@beep/schema/core/generics/tagged-struct";
 *
 * type Person = TaggedStruct.Type<"Person", { id: typeof S.String }>;
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export declare namespace TaggedStruct {
  /**
   * Schema type for structs with a `_tag` discriminator.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type Schema<
    Tag extends StringTypes.NonEmptyString<string>,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Struct<
    {
      readonly _tag: S.PropertySignature<":", Exclude<Tag, undefined>, never, "?:", Tag | undefined, true, never>;
    } & Fields
  >;

  /**
   * Runtime type of a tagged struct schema.
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  export type Type<
    Tag extends StringTypes.NonEmptyString<string>,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Schema.Type<Schema<Tag, Fields>>;
}

/**
 * Builds a struct schema with a `_tag` discriminator and arbitrary additional fields.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TaggedStruct } from "@beep/schema/core/generics/tagged-struct";
 *
 * const Person = TaggedStruct("Person", { id: S.String })();
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export const TaggedStruct =
  <const Tag extends StringTypes.NonEmptyString<string>, const Fields extends StructTypes.StructFieldsWithStringKeys>(
    tag: Tag,
    fields: Fields
  ) =>
  (annotations?: DefaultAnnotations<TaggedStruct.Type<Tag, Fields>>): TaggedStruct.Schema<Tag, Fields> => {
    const schema = Struct({
      _tag: S.Literal(tag).pipe(
        S.optional,
        S.withDefaults({
          constructor: () => tag,
          decoding: () => tag,
        })
      ),
      ...fields,
    });

    return schema
      .annotations(
        Id.annotations("TaggedStruct", {
          description: "Struct schema with an optional discriminator literal.",
        })
      )
      .annotations(annotations ?? {});
  };
