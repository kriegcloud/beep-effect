import type { TUnsafe } from "@beep/types";
import type { Cause, Struct } from "effect";
import * as S from "effect/Schema";

type TaggedErrorFields = S.Struct.Fields;
type TaggedErrorStruct = S.Struct<TaggedErrorFields>;
type TaggedErrorCause<Brand> = Cause.YieldableError & Brand;

type TaggedStructFromFields<Tag extends string, Fields extends TaggedErrorFields> = S.TaggedStruct<Tag, Fields>;
type TaggedStructFromSchema<Tag extends string, Schema extends TaggedErrorStruct> = S.Struct<
  Struct.Simplify<
    {
      readonly _tag: S.tag<Tag>;
    } & Schema["fields"]
  >
>;

type TaggedErrorBase<Self, Schema extends TaggedErrorStruct, Brand> = S.ErrorClass<
  Self,
  Schema,
  TaggedErrorCause<Brand>
>;

type TaggedErrorSchema<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> =
  ErrorClass extends S.ErrorClass<TUnsafe.Any, infer Schema, TUnsafe.Any> ? Schema : never;

export type TaggedErrorNewInput<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> = Omit<
  S.Schema.Type<TaggedErrorSchema<ErrorClass>>,
  "_tag"
>;

export type TaggedErrorClassWithNew<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> =
  ErrorClass & {
    new: (input: TaggedErrorNewInput<ErrorClass>) => S.Schema.Type<ErrorClass>;
    newThunk: (value: unknown) => () => S.Schema.Type<ErrorClass>;
  };

type TaggedErrorFromFields<Self, Brand, Tag extends string, Fields extends TaggedErrorFields> = TaggedErrorClassWithNew<
  TaggedErrorBase<Self, TaggedStructFromFields<Tag, Fields>, Brand>
>;

type TaggedErrorFromSchema<Self, Brand, Tag extends string, Schema extends TaggedErrorStruct> = TaggedErrorClassWithNew<
  TaggedErrorBase<Self, TaggedStructFromSchema<Tag, Schema>, Brand>
>;

export interface TaggedErrorClassFactory<Self, Brand = {}> {
  <Tag extends string, const Fields extends TaggedErrorFields>(
    tag: Tag,
    fields: Fields,
    annotations?: S.Annotations.Declaration<Self, readonly [TaggedStructFromFields<Tag, Fields>]>
  ): TaggedErrorFromFields<Self, Brand, Tag, Fields>;

  <Tag extends string, Schema extends TaggedErrorStruct>(
    tag: Tag,
    schema: Schema,
    annotations?: S.Annotations.Declaration<Self, readonly [TaggedStructFromSchema<Tag, Schema>]>
  ): TaggedErrorFromSchema<Self, Brand, Tag, Schema>;
}

export type TaggedErrorClassConstructor = <Self, Brand = {}>(
  identifier?: string
) => TaggedErrorClassFactory<Self, Brand>;

type UnsafeTaggedErrorClassFactory = TaggedErrorClassFactory<TUnsafe.Any, TUnsafe.Any>;

function isStruct(schema: TaggedErrorFields | TaggedErrorStruct): schema is TaggedErrorStruct {
  return S.isSchema(schema);
}

/**
 * @category Validation
 * @since 4.0.0
 */
export const TaggedErrorClass: TaggedErrorClassConstructor = (identifier?: string) => {
  return ((
    tagValue: string,
    schema: TaggedErrorFields | TaggedErrorStruct,
    annotations?: S.Annotations.Declaration<TUnsafe.Any, readonly [TaggedErrorStruct]>
  ) => {
    const errorClass = S.ErrorClass(identifier ?? tagValue)(
      isStruct(schema)
        ? schema.mapFields((fields) => ({ _tag: S.tag(tagValue), ...fields }), {
            unsafePreserveChecks: true,
          })
        : S.TaggedStruct(tagValue, schema),
      annotations
    );

    return Object.assign(errorClass, {
      new(this: new (value: unknown) => unknown, value: unknown) {
        return new this(value);
      },
      newThunk(this: new (value: unknown) => unknown, value: unknown) {
        return () => new this(value);
      },
    });
  }) as UnsafeTaggedErrorClassFactory;
};
