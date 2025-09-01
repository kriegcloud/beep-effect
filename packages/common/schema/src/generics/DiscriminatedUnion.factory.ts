import type { OptionalWithDefault } from "@beep/schema/types";
import { mergeFields } from "@beep/schema/utils";
import type { StringTypes, StructTypes, UnsafeTypes } from "@beep/types";
import * as Data from "effect/Data";
import type * as S from "effect/Schema";
import { DiscriminatedStruct } from "./DiscriminatedStruct";

type MakeMemberFn<
  Discriminator extends StringTypes.NonEmptyString<string>,
  LiteralValue extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = <const ExtraFields extends StructTypes.StructFieldsWithStringKeys>(
  extraFields: ExtraFields
) => LiteralValue extends UnsafeTypes.UnsafeAny
  ? S.Struct<{ readonly [K in Discriminator]: OptionalWithDefault<LiteralValue> } & Fields & ExtraFields>
  : never;

interface DiscriminatedUnionFactoryBuilderSpec<
  Discriminator extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> {
  readonly discriminatorKey: Discriminator;
  readonly fields: Fields;
}

export class DiscriminatedUnionFactoryBuilder<
  const Discriminator extends StringTypes.NonEmptyString<string>,
  const Fields extends StructTypes.StructFieldsWithStringKeys,
> extends Data.TaggedClass("DiscriminatedUnionFactory")<DiscriminatedUnionFactoryBuilderSpec<Discriminator, Fields>> {
  readonly make: <
    const LiteralValue extends StringTypes.NonEmptyString<string>,
    const ExtraFields extends StructTypes.StructFieldsWithStringKeys,
  >(
    literal: LiteralValue,
    extraFields: ExtraFields
  ) => DiscriminatedUnionFactory<Discriminator, LiteralValue, Fields & ExtraFields>;

  constructor(discriminatorKey: Discriminator, fields: Fields) {
    super({ discriminatorKey, fields });
    this.make = <
      const LiteralValue extends StringTypes.NonEmptyString<string>,
      const ExtraFields extends StructTypes.StructFieldsWithStringKeys,
    >(
      literal: LiteralValue,
      extraFields: ExtraFields
    ) => new DiscriminatedUnionFactory(discriminatorKey, literal, mergeFields(fields, extraFields));
  }
}

interface DiscriminatedUnionFactorySpec<
  Discriminator extends StringTypes.NonEmptyString<string>,
  LiteralValue extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> {
  readonly discriminatorKey: Discriminator;
  readonly discriminatorValue: LiteralValue;
  readonly fields: Fields;
}

export class DiscriminatedUnionFactory<
  const Discriminator extends StringTypes.NonEmptyString<string>,
  const LiteralValue extends StringTypes.NonEmptyString<string>,
  const Fields extends StructTypes.StructFieldsWithStringKeys,
> extends Data.TaggedClass("DiscriminatedUnionFactory")<
  DiscriminatedUnionFactorySpec<Discriminator, LiteralValue, Fields>
> {
  readonly make: MakeMemberFn<Discriminator, LiteralValue, Fields>;

  constructor(discriminatorKey: Discriminator, discriminatorValue: LiteralValue, fields: Fields) {
    super({ discriminatorKey, discriminatorValue, fields });
    this.make = <const ExtraFields extends StructTypes.StructFieldsWithStringKeys>(extraFields: ExtraFields) =>
      DiscriminatedStruct<Discriminator, LiteralValue, Fields & ExtraFields>(discriminatorKey)(
        discriminatorValue,
        mergeFields(fields, extraFields)
      );
  }
}
