import type { DefaultAnnotations } from "@beep/schema/annotations";
import { DiscriminatedStruct } from "@beep/schema/generics/DiscriminatedStruct";
import type { OptionalWithDefault } from "@beep/schema/types";
import { mergeFields } from "@beep/schema/utils";
import type { StringTypes, StructTypes, UnsafeTypes } from "@beep/types";
import * as Arbitrary from "effect/Arbitrary";
import * as Data from "effect/Data";
import * as FC from "effect/FastCheck";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";

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

export type FilterUnion<
  Discriminator extends StringTypes.NonEmptyString<string>,
  LiteralValue extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
  ExtraFields extends StructTypes.StructFieldsWithStringKeys,
> = LiteralValue extends UnsafeTypes.UnsafeAny
  ? S.Struct<{ readonly [K in Discriminator]: OptionalWithDefault<LiteralValue> } & Fields & ExtraFields>
  : never;

export class DiscriminatedUnionFactory<
  const Discriminator extends StringTypes.NonEmptyString<string>,
  const LiteralValue extends StringTypes.NonEmptyString<string>,
  const Fields extends StructTypes.StructFieldsWithStringKeys,
> extends Data.TaggedClass("DiscriminatedUnionFactory")<
  DiscriminatedUnionFactorySpec<Discriminator, LiteralValue, Fields>
> {
  readonly make: <const ExtraFields extends StructTypes.StructFieldsWithStringKeys>(
    extraFields: ExtraFields
  ) => (
    annotations: Omit<DefaultAnnotations<FilterUnion<Discriminator, LiteralValue, Fields, ExtraFields>>, "examples"> & {
      readonly examples?: AST.ExamplesAnnotation<
        S.Schema.Type<DiscriminatedStruct.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>
      >;
    }
  ) => FilterUnion<Discriminator, LiteralValue, Fields, ExtraFields>;

  constructor(discriminatorKey: Discriminator, discriminatorValue: LiteralValue, fields: Fields) {
    super({ discriminatorKey, discriminatorValue, fields });
    this.make =
      <const ExtraFields extends StructTypes.StructFieldsWithStringKeys>(extraFields: ExtraFields) =>
      ({
        examples,
        ...annotations
      }: Omit<
        DefaultAnnotations<DiscriminatedStruct.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>,
        "examples"
      > & {
        readonly examples?: AST.ExamplesAnnotation<
          S.Schema.Type<DiscriminatedStruct.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>
        >;
      }) => {
        const schema = DiscriminatedStruct<Discriminator, LiteralValue, Fields & ExtraFields>(discriminatorKey)(
          discriminatorValue,
          mergeFields(fields, extraFields)
        ).pipe(S.annotations(annotations));

        const arb = Arbitrary.make<
          S.Schema.Type<DiscriminatedStruct.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>,
          S.Schema.Encoded<DiscriminatedStruct.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>,
          never
        >(schema);
        const samples = FC.sample(arb, 3);

        return DiscriminatedStruct<Discriminator, LiteralValue, Fields & ExtraFields>(discriminatorKey)(
          discriminatorValue,
          mergeFields(fields, extraFields)
        )
          .pipe(S.annotations(annotations))
          .annotations({
            examples: [...samples],
          });
      };
  }
}
