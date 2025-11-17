/**
 * Tagged union schema factories with shared field registries and FastCheck sampling.
 *
 * Enables composition-friendly builders that carry discriminator keys and reusable fields.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TaggedUnionFactoryBuilder } from "@beep/schema-v2/core/generics/tagged-union-factory";
 *
 * const builder = new TaggedUnionFactoryBuilder("_tag", { id: S.String });
 *
 * @category Core/Generics
 * @since 0.1.0
 */
import type { StringTypes, StructTypes, UnsafeTypes } from "@beep/types";
import * as Arbitrary from "effect/Arbitrary";
import * as Data from "effect/Data";
import * as FC from "effect/FastCheck";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import type { DefaultAnnotations } from "../annotations/default";
import type { OptionalWithDefault } from "../types";
import { mergeFields } from "../utils/merge-fields";
import { TaggedUnion } from "./tagged-union";

interface TaggedUnionFactoryBuilderSpec<
  Discriminator extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> {
  readonly discriminatorKey: Discriminator;
  readonly fields: Fields;
}

/**
 * Builder that captures the discriminator key and shared fields used across tagged union members.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TaggedUnionFactoryBuilder } from "@beep/schema-v2/core/generics/tagged-union-factory";
 *
 * const builder = new TaggedUnionFactoryBuilder("_tag", { id: S.String });
 * const personFactory = builder.make("Person", { name: S.String });
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export class TaggedUnionFactoryBuilder<
  const Discriminator extends StringTypes.NonEmptyString<string>,
  const Fields extends StructTypes.StructFieldsWithStringKeys,
> extends Data.TaggedClass("TaggedUnionFactory")<TaggedUnionFactoryBuilderSpec<Discriminator, Fields>> {
  /**
   * Creates a tagged union factory for a specific literal case.
   *
   * @example
   * import * as S from "effect/Schema";
   * import { TaggedUnionFactoryBuilder } from "@beep/schema-v2/core/generics/tagged-union-factory";
   *
   * const builder = new TaggedUnionFactoryBuilder("_tag", { id: S.String });
   * const factory = builder.make("Person", { name: S.String });
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  readonly make: <
    const LiteralValue extends StringTypes.NonEmptyString<string>,
    const ExtraFields extends StructTypes.StructFieldsWithStringKeys,
  >(
    literal: LiteralValue,
    extraFields: ExtraFields
  ) => TaggedUnionFactory<Discriminator, LiteralValue, Fields & ExtraFields>;

  constructor(discriminatorKey: Discriminator, fields: Fields) {
    super({ discriminatorKey, fields });
    this.make = <
      const LiteralValue extends StringTypes.NonEmptyString<string>,
      const ExtraFields extends StructTypes.StructFieldsWithStringKeys,
    >(
      literal: LiteralValue,
      extraFields: ExtraFields
    ) => new TaggedUnionFactory(discriminatorKey, literal, mergeFields(fields, extraFields));
  }
}

interface TaggedUnionFactorySpec<
  Discriminator extends StringTypes.NonEmptyString<string>,
  LiteralValue extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> {
  readonly discriminatorKey: Discriminator;
  readonly discriminatorValue: LiteralValue;
  readonly fields: Fields;
}

/**
 * Utility schema that captures a discriminator literal together with shared and extra struct fields.
 *
 * This type is returned from {@link TaggedUnionFactory.make} and ensures consumers always receive a fully annotated
 * struct containing the discriminator plus all merged fields.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FilterUnion } from "@beep/schema-v2/core/generics/tagged-union-factory";
 *
 * type PersonSchema = FilterUnion<
 *   "_tag",
 *   "Person",
 *   { readonly id: typeof S.String },
 *   { readonly name: typeof S.String }
 * >;
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export type FilterUnion<
  Discriminator extends StringTypes.NonEmptyString<string>,
  LiteralValue extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
  ExtraFields extends StructTypes.StructFieldsWithStringKeys,
> = LiteralValue extends UnsafeTypes.UnsafeAny
  ? S.Struct<{ readonly [K in Discriminator]: OptionalWithDefault<LiteralValue> } & Fields & ExtraFields>
  : never;

/**
 * Factory that produces tagged union schemas with automatic FastCheck samples.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { TaggedUnionFactory } from "@beep/schema-v2/core/generics/tagged-union-factory";
 *
 * const factory = new TaggedUnionFactory("_tag", "Person", { id: S.String });
 * const schema = factory.make({ name: S.String })({});
 *
 * @category Core/Generics
 * @since 0.1.0
 */
export class TaggedUnionFactory<
  const Discriminator extends StringTypes.NonEmptyString<string>,
  const LiteralValue extends StringTypes.NonEmptyString<string>,
  const Fields extends StructTypes.StructFieldsWithStringKeys,
> extends Data.TaggedClass("TaggedUnionFactory")<TaggedUnionFactorySpec<Discriminator, LiteralValue, Fields>> {
  /**
   * Applies extra fields and annotations to the tagged union schema.
   *
   * @example
   * import * as S from "effect/Schema";
   * import { TaggedUnionFactory } from "@beep/schema-v2/core/generics/tagged-union-factory";
   *
   * const factory = new TaggedUnionFactory("_tag", "Person", { id: S.String });
   * const schema = factory.make({ name: S.String })({});
   *
   * @category Core/Generics
   * @since 0.1.0
   */
  readonly make: <const ExtraFields extends StructTypes.StructFieldsWithStringKeys>(
    extraFields: ExtraFields
  ) => (
    annotations: Omit<DefaultAnnotations<FilterUnion<Discriminator, LiteralValue, Fields, ExtraFields>>, "examples"> & {
      readonly examples?: AST.ExamplesAnnotation<
        S.Schema.Type<TaggedUnion.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>
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
      }: Omit<DefaultAnnotations<TaggedUnion.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>, "examples"> & {
        readonly examples?: AST.ExamplesAnnotation<
          S.Schema.Type<TaggedUnion.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>
        >;
      }) => {
        const schema = TaggedUnion<Discriminator, LiteralValue, Fields & ExtraFields>(discriminatorKey)(
          discriminatorValue,
          mergeFields(fields, extraFields)
        ).pipe(S.annotations(annotations));

        const arb = Arbitrary.make<
          S.Schema.Type<TaggedUnion.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>,
          S.Schema.Encoded<TaggedUnion.Schema<Discriminator, LiteralValue, Fields & ExtraFields>>,
          never
        >(schema);
        const samples = FC.sample(arb, 3);

        return TaggedUnion<Discriminator, LiteralValue, Fields & ExtraFields>(discriminatorKey)(
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
