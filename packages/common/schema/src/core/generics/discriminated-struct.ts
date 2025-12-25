import type {StringTypes, StructTypes} from "@beep/types";
import * as S from "effect/Schema";
import {Struct} from "../extended";


// export type SchemaBuilder = <
//     const Discriminator extends StringTypes.NonEmptyString,
//     const Tag extends StringTypes.NonEmptyString,
//     const Fields extends StructTypes.StructFieldsWithStringKeys,
//   >(discriminator: Discriminator) => (tag: Tag, fields: Fields) => S.Struct<{
//   [K in keyof Fields & {readonly [tag: Discriminator]: S.PropertySignature<":", Exclude<Tag, undefined>, never, "?:", Tag | undefined, true, never>}]
// }>

export const make = <
  const Discriminator extends StringTypes.NonEmptyString,
>(discriminator: Discriminator) => <const Tag extends StringTypes.NonEmptyString,
  const Fields extends StructTypes.StructFieldsWithStringKeys, >(tag: Tag, fields: Fields): Schema<Discriminator, Tag, Fields> =>
  Struct({
    [discriminator]: S.optional(S.Literal(tag)).pipe(S.withDefaults({
      constructor: () => tag,
      decoding: () => tag,
    })),
    ...fields,
  });

export type Schema<
  Discriminator extends StringTypes.NonEmptyString,
  Tag extends StringTypes.NonEmptyString,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = S.Struct<{
  readonly [K in Discriminator]: S.PropertySignature<":", Exclude<Tag, undefined>, never, "?:", Tag | undefined, true, never>
} & Fields>

export type Type<
  Discriminator extends StringTypes.NonEmptyString,
  Tag extends StringTypes.NonEmptyString,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = S.Schema.Type<Schema<Discriminator, Tag, Fields>>

export type Encoded<
  Discriminator extends StringTypes.NonEmptyString,
  Tag extends StringTypes.NonEmptyString,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = S.Schema.Encoded<Schema<Discriminator, Tag, Fields>>
