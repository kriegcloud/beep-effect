import type { TUnsafe } from "@beep/types";
import { type Cause, Function as Fn, type Struct } from "effect";
import * as P from "effect/Predicate";
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

/**
 * Input type for constructing a tagged error, omitting the discriminator `_tag`.
 *
 * @since 0.0.0
 * @category models
 */
export type TaggedErrorNewInput<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> = Omit<
  S.Schema.Type<TaggedErrorSchema<ErrorClass>>,
  "_tag"
>;

type TaggedErrorNewInputHasCause<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> =
  "cause" extends keyof TaggedErrorNewInput<ErrorClass> ? true : false;

type TaggedErrorNewInputCause<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> =
  TaggedErrorNewInput<ErrorClass> extends { readonly cause: infer Cause }
    ? Cause
    : TaggedErrorNewInput<ErrorClass> extends { readonly cause?: infer Cause }
      ? Cause
      : never;

type TaggedErrorNewInputRest<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> = Omit<
  TaggedErrorNewInput<ErrorClass>,
  "cause"
>;

type TaggedErrorHasRequiredCause<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> =
  "cause" extends keyof TaggedErrorNewInput<ErrorClass>
    ? {} extends Pick<TaggedErrorNewInput<ErrorClass>, "cause">
      ? false
      : true
    : false;

type TaggedErrorNewMethod<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> = ((
  input: TaggedErrorNewInput<ErrorClass>
) => S.Schema.Type<ErrorClass>) &
  (TaggedErrorNewInputHasCause<ErrorClass> extends true
    ? (
        cause: TaggedErrorNewInputCause<ErrorClass>,
        rest: TaggedErrorNewInputRest<ErrorClass>
      ) => S.Schema.Type<ErrorClass>
    : {}) &
  (TaggedErrorHasRequiredCause<ErrorClass> extends true
    ? (
        rest: TaggedErrorNewInputRest<ErrorClass>
      ) => (cause: TaggedErrorNewInputCause<ErrorClass>) => S.Schema.Type<ErrorClass>
    : {});

type TaggedErrorNewThunkMethod<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> = ((
  input: TaggedErrorNewInput<ErrorClass>
) => () => S.Schema.Type<ErrorClass>) &
  (TaggedErrorNewInputHasCause<ErrorClass> extends true
    ? (
        cause: TaggedErrorNewInputCause<ErrorClass>,
        rest: TaggedErrorNewInputRest<ErrorClass>
      ) => () => S.Schema.Type<ErrorClass>
    : {}) &
  (TaggedErrorHasRequiredCause<ErrorClass> extends true
    ? (
        rest: TaggedErrorNewInputRest<ErrorClass>
      ) => (cause: TaggedErrorNewInputCause<ErrorClass>) => () => S.Schema.Type<ErrorClass>
    : {});

/**
 * A tagged error class augmented with `new` and `newThunk` convenience constructors.
 *
 * @since 0.0.0
 * @category models
 */
export type TaggedErrorClassWithNew<ErrorClass extends S.ErrorClass<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> =
  ErrorClass & {
    new: TaggedErrorNewMethod<ErrorClass>;
    newThunk: TaggedErrorNewThunkMethod<ErrorClass>;
  };

type TaggedErrorFromFields<Self, Brand, Tag extends string, Fields extends TaggedErrorFields> = TaggedErrorClassWithNew<
  TaggedErrorBase<Self, TaggedStructFromFields<Tag, Fields>, Brand>
>;

type TaggedErrorFromSchema<Self, Brand, Tag extends string, Schema extends TaggedErrorStruct> = TaggedErrorClassWithNew<
  TaggedErrorBase<Self, TaggedStructFromSchema<Tag, Schema>, Brand>
>;

/**
 * Factory interface returned by {@link TaggedErrorClass} that accepts a tag, fields, and optional annotations.
 *
 * @since 0.0.0
 * @category models
 */
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

/**
 * Callable constructor type for building tagged error classes.
 *
 * @since 0.0.0
 * @category models
 */
export type TaggedErrorClassConstructor = <Self, Brand = {}>(
  identifier?: undefined | string
) => TaggedErrorClassFactory<Self, Brand>;

type UnsafeTaggedErrorClassFactory = TaggedErrorClassFactory<TUnsafe.Any, TUnsafe.Any>;

type RuntimeContextLike = {
  readonly isOptional?: undefined | boolean;
};

type RuntimePropertyTypeLike = {
  readonly context?: undefined | RuntimeContextLike;
};

type RuntimePropertySignatureLike = {
  readonly name: string;
  readonly type: RuntimePropertyTypeLike;
};

type RuntimeObjectsAstLike = {
  readonly propertySignatures?: ReadonlyArray<RuntimePropertySignatureLike>;
};

type CauseMetadata = {
  readonly hasCause: boolean;
  readonly isRequiredCause: boolean;
};

const NoCauseMetadata: CauseMetadata = {
  hasCause: false,
  isRequiredCause: false,
};

function isStruct(schema: TaggedErrorFields | TaggedErrorStruct): schema is TaggedErrorStruct {
  return S.isSchema(schema);
}

function isOptionalPropertyType(type: RuntimePropertyTypeLike): boolean {
  return type.context?.isOptional === true;
}

function getCauseMetadata(schema: TaggedErrorStruct): CauseMetadata {
  const causeProperty = (schema.ast as RuntimeObjectsAstLike).propertySignatures?.find(
    (property) => property.name === "cause"
  );

  if (causeProperty === undefined) {
    return NoCauseMetadata;
  }

  return {
    hasCause: true,
    isRequiredCause: !isOptionalPropertyType(causeProperty.type),
  };
}

function hasExplicitCause(value: unknown): boolean {
  return P.isObject(value) && Reflect.has(value, "cause");
}

function isRestPayload(value: unknown, metadata: CauseMetadata): boolean {
  return metadata.isRequiredCause && P.isObject(value) && !hasExplicitCause(value);
}

function toCausePayload(cause: unknown, rest: unknown): Record<string, unknown> {
  if (!P.isObject(rest)) {
    throw new TypeError("TaggedErrorClass cause-aware constructors expect an object payload.");
  }

  return { ...rest, cause };
}

/**
 * Create a tagged error class with `_tag` discrimination, `.new()`, and `.newThunk()` constructors.
 *
 * Wraps `S.ErrorClass` and automatically prepends a `_tag` field. When the
 * schema includes a `cause` field, the `.new()` method supports dual-arity
 * `(cause, rest)` invocation for ergonomic error construction.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Effect } from "effect"
 * import { TaggedErrorClass } from "@beep/schema"
 *
 * class NotFound extends TaggedErrorClass<NotFound>()("NotFound", {
 *   message: S.String,
 * }) {}
 *
 * const err = NotFound.new({ message: "User not found" })
 *
 * const program = Effect.fail(err).pipe(
 *   Effect.catchTag("NotFound", (e) => Effect.succeed(e.message))
 * )
 * ```
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Effect } from "effect"
 * import { TaggedErrorClass } from "@beep/schema"
 *
 * class DbError extends TaggedErrorClass<DbError>()("DbError", {
 *   message: S.String,
 *   cause: S.DefectWithStack,
 * }) {}
 *
 * const program = Effect.try({
 *   try: () => JSON.parse("bad"),
 *   catch: (cause) => DbError.new(cause, { message: "parse failed" })
 * })
 *
 * void program
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const TaggedErrorClass: TaggedErrorClassConstructor = (identifier?: undefined | string) => {
  return ((
    tagValue: string,
    schema: TaggedErrorFields | TaggedErrorStruct,
    annotations?: S.Annotations.Declaration<TUnsafe.Any, readonly [TaggedErrorStruct]>
  ) => {
    const taggedSchema = isStruct(schema)
      ? schema.mapFields((fields) => ({ _tag: S.tag(tagValue), ...fields }), {
          unsafePreserveChecks: true,
        })
      : S.TaggedStruct(tagValue, schema);
    const causeMetadata = getCauseMetadata(taggedSchema);
    const errorClass = S.ErrorClass(identifier ?? tagValue)(taggedSchema, annotations);
    const taggedErrorClassWithNew = errorClass as TaggedErrorClassWithNew<typeof errorClass>;
    const shouldConstructImmediately = (args: IArguments) => args.length > 1 || !isRestPayload(args[0], causeMetadata);

    taggedErrorClassWithNew.new = function (this: new (value: unknown) => unknown) {
      const makeError = (value: unknown) => new this(value as never);
      const construct = Fn.dual(shouldConstructImmediately, (causeOrInput: unknown, rest?: unknown) =>
        rest === undefined ? makeError(causeOrInput) : makeError(toCausePayload(causeOrInput, rest))
      );

      return Reflect.apply(construct, undefined, arguments);
    } as TaggedErrorNewMethod<typeof errorClass>;
    taggedErrorClassWithNew.newThunk = function (this: new (value: unknown) => unknown) {
      const makeError = (value: unknown) => new this(value as never);
      const construct = Fn.dual(shouldConstructImmediately, (causeOrInput: unknown, rest?: unknown) =>
        rest === undefined ? () => makeError(causeOrInput) : () => makeError(toCausePayload(causeOrInput, rest))
      );

      return Reflect.apply(construct, undefined, arguments);
    } as TaggedErrorNewThunkMethod<typeof errorClass>;
    return taggedErrorClassWithNew;
  }) as UnsafeTaggedErrorClassFactory;
};
