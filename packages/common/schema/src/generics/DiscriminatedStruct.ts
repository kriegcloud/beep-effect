import { Struct } from "@beep/schema/extended-schemas";
import type { OptionalWithDefault } from "@beep/schema/types";
import type { StructTypes, UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";

export declare namespace DiscriminatedStruct {
  export type Schema<
    Discriminator extends string,
    Literal extends string,
    Fields extends StructTypes.StructFieldsWithStringKeys,
  > = Literal extends UnsafeTypes.UnsafeAny
    ? S.Struct<
        {
          [K in Discriminator]: OptionalWithDefault<Literal>;
        } & Fields
      >
    : never;

  export type Type<
    Discriminator extends string,
    Literal extends string,
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
    }) as DiscriminatedStruct.Schema<Discriminator, Literal, Fields>;
