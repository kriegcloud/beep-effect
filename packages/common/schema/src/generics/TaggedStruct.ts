import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import { DefaultAnnotations } from "../annotations";

namespace TaggedStruct {
  export type Schema<
    Tag extends AST.LiteralValue,
    Fields extends S.Struct.Fields,
  > = S.Struct<
    {
      _tag: S.PropertySignature<
        ":",
        Exclude<Tag, undefined>,
        never,
        "?:",
        Tag | undefined,
        true,
        never
      >;
    } & Fields
  >;

  export type Type<
    Tag extends AST.LiteralValue,
    Fields extends S.Struct.Fields,
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
  <Tag extends AST.LiteralValue, Fields extends S.Struct.Fields>(
    tag: Tag,
    fields: Fields,
  ) =>
  (
    annotations?: DefaultAnnotations<TaggedStruct.Type<Tag, Fields>>,
  ): TaggedStruct.Schema<Tag, Fields> =>
    S.Struct({
      _tag: S.Literal(tag).pipe(
        S.optional,
        S.withDefaults({
          constructor: () => tag,
          decoding: () => tag,
        }),
      ),
      ...fields,
    }).annotations(annotations ?? {});
