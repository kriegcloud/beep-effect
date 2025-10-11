import type { DefaultAnnotations } from "@beep/schema/annotations";
import { Struct } from "@beep/schema/extended-schemas";
import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";
export declare namespace TaggedStruct {
  export type Schema<
    Tag extends StringTypes.NonEmptyString<string>,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Struct<
    {
      _tag: S.PropertySignature<":", Exclude<Tag, undefined>, never, "?:", Tag | undefined, true, never>;
    } & Fields
  >;

  export type Type<
    Tag extends StringTypes.NonEmptyString<string>,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Schema.Type<Schema<Tag, Fields>>;
}

/**
 * Creates a struct schema with a fixed `_tag` property and additional fields.
 * The `_tag` property is set to the provided tag value and is optional with a default.
 *
 * @category schema
 * @param tag The literal value for the `_tag` property
 * @param fields The fields to include in the struct
 * @returns A schema for the tagged struct
 */

export const TaggedStruct =
  <const Tag extends StringTypes.NonEmptyString<string>, const Fields extends StructTypes.StructFieldsWithStringKeys>(
    tag: Tag,
    fields: Fields
  ) =>
  (annotations?: DefaultAnnotations<TaggedStruct.Type<Tag, Fields>>): TaggedStruct.Schema<Tag, Fields> =>
    Struct({
      _tag: S.Literal(tag).pipe(
        S.optional,
        S.withDefaults({
          constructor: () => tag,
          decoding: () => tag,
        })
      ),
      ...fields,
    }).annotations(annotations ?? {});
