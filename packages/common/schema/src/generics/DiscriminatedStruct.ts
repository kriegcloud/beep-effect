import type { StringTypes, StructTypes, UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";

export namespace DiscriminatedStruct {
  export type Schema<
    Discriminator extends StringTypes.NonEmptyString<string>,
    Literal extends StringTypes.NonEmptyString<string>,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = Literal extends UnsafeTypes.UnsafeAny
    ? S.Struct<
        {
          readonly [K in Discriminator]: S.PropertySignature<
            ":",
            Exclude<Literal, undefined>,
            never,
            "?:",
            Literal | undefined,
            true,
            never
          >;
        } & {
          readonly [J in keyof Fields]: Fields[J];
        }
      >
    : never;

  export type Type<
    Discriminator extends StringTypes.NonEmptyString<string>,
    Literal extends StringTypes.NonEmptyString<string>,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = S.Schema.Type<Schema<Discriminator, Literal, Fields>>;
}

/**
 * Creates a struct schema with a fixed `_tag` property and additional fields.
 * The `_tag` property is set to the provided tag value and is optional with a default.
 *
 * @category schema
 * @returns A schema for the tagged struct
 * @param discriminator
 */

export const DiscriminatedStruct =
  <
    const Discriminator extends StringTypes.NonEmptyString<string>,
    const Literal extends StringTypes.NonEmptyString<string>,
    const Fields extends StructTypes.StructFieldsWithStringKeys,
  >(
    discriminator: Discriminator
  ) =>
  (tag: Literal, fields: Fields) =>
    S.Struct({
      [discriminator]: S.Literal(tag).pipe(
        S.optional,
        S.withDefaults({
          constructor: () => tag,
          decoding: () => tag,
        })
      ),
      ...fields,
    }) as DiscriminatedStruct.Schema<Discriminator, Literal, Fields>;
