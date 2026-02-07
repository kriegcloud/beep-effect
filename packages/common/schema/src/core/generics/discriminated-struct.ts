import type { StringTypes, StructTypes, UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import { Struct } from "../extended";

/**
 * Overloaded factory returned by {@link make}.
 *
 * Supports an optional rest parameter of index signature records,
 * mirroring the `S.Struct(fields, ...records)` overload from `effect/Schema`.
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export interface Factory<Discriminator extends StringTypes.NonEmptyString> {
  <
    const Tag extends StringTypes.NonEmptyString,
    const Fields extends StructTypes.StructFieldsWithStringKeys,
    const Records extends S.IndexSignature.NonEmptyRecords,
  >(
    tag: Tag,
    fields: Fields,
    ...records: Records
  ): SchemaWithRecords<Discriminator, Tag, Fields, Records>;

  <const Tag extends StringTypes.NonEmptyString, const Fields extends StructTypes.StructFieldsWithStringKeys>(
    tag: Tag,
    fields: Fields
  ): Schema<Discriminator, Tag, Fields>;
}

export const make = <const Discriminator extends StringTypes.NonEmptyString>(
  discriminator: Discriminator
): Factory<Discriminator> => {
  const factory = (
    tag: StringTypes.NonEmptyString,
    fields: StructTypes.StructFieldsWithStringKeys,
    ...records: S.IndexSignature.Records
  ) => {
    const thunkTag = () => tag;
    const allFields = {
      [discriminator]: S.optional(S.Literal(tag)).pipe(
        S.withDefaults({
          constructor: thunkTag,
          decoding: thunkTag,
        })
      ),
      ...fields,
    };
    return records.length > 0 ? Struct(allFields, ...(records as UnsafeTypes.UnsafeAny)) : Struct(allFields);
  };
  return factory as Factory<Discriminator>;
};

export type Schema<
  Discriminator extends StringTypes.NonEmptyString,
  Tag extends StringTypes.NonEmptyString,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = S.Struct<
  {
    readonly [K in Discriminator]: S.PropertySignature<
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

export type SchemaWithRecords<
  Discriminator extends StringTypes.NonEmptyString,
  Tag extends StringTypes.NonEmptyString,
  Fields extends StructTypes.StructFieldsWithStringKeys,
  Records extends S.IndexSignature.Records,
> = S.TypeLiteral<
  {
    readonly [K in Discriminator]: S.PropertySignature<
      ":",
      Exclude<Tag, undefined>,
      never,
      "?:",
      Tag | undefined,
      true,
      never
    >;
  } & Fields,
  Records
>;

export type Type<
  Discriminator extends StringTypes.NonEmptyString,
  Tag extends StringTypes.NonEmptyString,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = S.Schema.Type<Schema<Discriminator, Tag, Fields>>;

export type Encoded<
  Discriminator extends StringTypes.NonEmptyString,
  Tag extends StringTypes.NonEmptyString,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = S.Schema.Encoded<Schema<Discriminator, Tag, Fields>>;
