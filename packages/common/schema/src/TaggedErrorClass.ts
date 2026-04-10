import type { TUnsafe } from "@beep/types";
import { type Cause, Function as Fn, Match, type Struct } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

type TaggedErrorFields = S.Struct.Fields;
type TaggedErrorStruct = S.Struct<TaggedErrorFields>;
type TaggedErrorCause<Brand> = Cause.YieldableError & Brand;
type TaggedErrorClassLike = (new (
  ...args: ReadonlyArray<any>
) => TUnsafe.Any) & {
  readonly Type: TUnsafe.Any;
  readonly fields: TaggedErrorFields;
  readonly "~type.parameters": readonly [TaggedErrorStruct];
};

type TaggedStructFromFields<Tag extends string, Fields extends TaggedErrorFields> = S.TaggedStruct<Tag, Fields>;
type TaggedStructFromSchema<Tag extends string, Schema extends TaggedErrorStruct> = S.Struct<
  Struct.Simplify<
    {
      readonly _tag: S.tag<Tag>;
    } & Schema["fields"]
  >
>;

type TaggedErrorBase<Self, Schema extends TaggedErrorStruct, Brand> = S.Class<Self, Schema, TaggedErrorCause<Brand>>;

type TaggedErrorSchema<ErrorClass extends TaggedErrorClassLike> = ErrorClass["~type.parameters"] extends readonly [
  infer Schema extends TaggedErrorStruct,
]
  ? Schema
  : never;
type TaggedErrorSelf<ErrorClass extends TaggedErrorClassLike> = ErrorClass["Type"];

type TaggedErrorExtendedSchema<ErrorClass extends TaggedErrorClassLike, NewFields extends TaggedErrorFields> = S.Struct<
  Struct.Simplify<Struct.Assign<TaggedErrorSchema<ErrorClass>["fields"], NewFields>>
>;

type TaggedErrorMissingSelfGeneric<Usage extends string> =
  `Missing \`Self\` generic - use \`class Self extends ${Usage}<Self>(...)\``;

type TaggedErrorInheritStaticMembers<ClassType, Static> = ClassType &
  Pick<Static, Exclude<keyof Static, keyof ClassType>>;
type TaggedErrorConstructorArgs<ErrorClass extends TaggedErrorClassLike> = ErrorClass extends new (
  ...args: infer Args
) => TUnsafe.Any
  ? Args
  : never;
type TaggedErrorInstance<ErrorClass extends TaggedErrorClassLike> = ErrorClass extends new (
  ...args: ReadonlyArray<any>
) => infer Instance
  ? Instance
  : never;

/**
 * Input type for constructing a tagged error, omitting the discriminator `_tag`.
 *
 * @since 0.0.0
 * @category models
 */
export type TaggedErrorNewInput<ErrorClass extends TaggedErrorClassLike> = Omit<
  S.Schema.Type<TaggedErrorSchema<ErrorClass>>,
  "_tag"
>;

type TaggedErrorNewInputHasCause<ErrorClass extends TaggedErrorClassLike> =
  "cause" extends keyof TaggedErrorNewInput<ErrorClass> ? true : false;

type TaggedErrorNewInputCause<ErrorClass extends TaggedErrorClassLike> =
  TaggedErrorNewInput<ErrorClass> extends { readonly cause: infer Cause }
    ? Cause
    : TaggedErrorNewInput<ErrorClass> extends { readonly cause?: infer Cause }
      ? Cause
      : never;

type TaggedErrorNewInputRest<ErrorClass extends TaggedErrorClassLike> = Omit<TaggedErrorNewInput<ErrorClass>, "cause">;

type TaggedErrorHasRequiredCause<ErrorClass extends TaggedErrorClassLike> =
  "cause" extends keyof TaggedErrorNewInput<ErrorClass>
    ? {} extends Pick<TaggedErrorNewInput<ErrorClass>, "cause">
      ? false
      : true
    : false;

type TaggedErrorNewMethod<ErrorClass extends TaggedErrorClassLike> = ((
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

type TaggedErrorNewThunkMethod<ErrorClass extends TaggedErrorClassLike> = ((
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

type TaggedErrorExtendMethod<ErrorClass extends TaggedErrorClassLike> = <Extended = never, Static = {}, Brand = {}>(
  identifier: string
) => <NewFields extends TaggedErrorFields>(
  fields: NewFields,
  annotations?: S.Annotations.Declaration<Extended, readonly [TaggedErrorExtendedSchema<ErrorClass, NewFields>]>
) => [Extended] extends [never]
  ? TaggedErrorMissingSelfGeneric<"Base.extend">
  : TaggedErrorInheritStaticMembers<
      TaggedErrorClassWithNew<
        S.Class<Extended, TaggedErrorExtendedSchema<ErrorClass, NewFields>, TaggedErrorSelf<ErrorClass> & Brand>
      >,
      Static
    >;

/**
 * A tagged error class augmented with `new` and `newThunk` convenience constructors.
 *
 * @since 0.0.0
 * @category models
 */
export type TaggedErrorClassWithNew<ErrorClass extends TaggedErrorClassLike> = (new (
  ...args: TaggedErrorConstructorArgs<ErrorClass>
) => TaggedErrorInstance<ErrorClass>) &
  Omit<ErrorClass, "extend" | "new" | "newThunk"> & {
    new: TaggedErrorNewMethod<ErrorClass>;
    newThunk: TaggedErrorNewThunkMethod<ErrorClass>;
    extend: TaggedErrorExtendMethod<ErrorClass>;
  };

/**
 * Tagged error class type derived from a fields object.
 *
 * @since 0.0.0
 * @category models
 */
export type TaggedErrorClassFromFields<
  Self,
  Tag extends string,
  Fields extends TaggedErrorFields,
  Brand = {},
> = TaggedErrorClassWithNew<TaggedErrorBase<Self, TaggedStructFromFields<Tag, Fields>, Brand>>;

/**
 * Tagged error class type derived from a struct schema.
 *
 * @since 0.0.0
 * @category models
 */
export type TaggedErrorClassFromSchema<
  Self,
  Tag extends string,
  Schema extends TaggedErrorStruct,
  Brand = {},
> = TaggedErrorClassWithNew<TaggedErrorBase<Self, TaggedStructFromSchema<Tag, Schema>, Brand>>;

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
  ): TaggedErrorClassFromFields<Self, Tag, Fields, Brand>;

  <Tag extends string, Schema extends TaggedErrorStruct>(
    tag: Tag,
    schema: Schema,
    annotations?: S.Annotations.Declaration<Self, readonly [TaggedStructFromSchema<Tag, Schema>]>
  ): TaggedErrorClassFromSchema<Self, Tag, Schema, Brand>;
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
  readonly name: PropertyKey;
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

const TaggedErrorOriginalExtend = Symbol.for("@beep/schema/TaggedErrorClass/originalExtend");

type TaggedErrorOriginalExtendMethod = (
  this: S.Class<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>,
  identifier: string
) => (
  fields: TaggedErrorFields,
  annotations?: S.Annotations.Declaration<TUnsafe.Any, readonly [TaggedErrorStruct]>
) => S.Class<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>;

type RuntimeTaggedErrorClass<ErrorClass extends TaggedErrorClassLike & S.Class<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>> =
  TaggedErrorClassWithNew<ErrorClass> & {
    [TaggedErrorOriginalExtend]?: TaggedErrorOriginalExtendMethod;
  };

function isStruct(schema: TaggedErrorFields | TaggedErrorStruct): schema is TaggedErrorStruct {
  return S.isSchema(schema);
}

function isOptionalPropertyType(type: RuntimePropertyTypeLike): boolean {
  return type.context?.isOptional === true;
}

function getCauseMetadata(carrier: { readonly ast: RuntimeObjectsAstLike }): CauseMetadata {
  return Match.value(carrier.ast.propertySignatures?.find((property) => property.name === "cause")).pipe(
    Match.when(undefined, () => NoCauseMetadata),
    Match.orElse((causeProperty) => ({
      hasCause: true,
      isRequiredCause: !isOptionalPropertyType(causeProperty.type),
    }))
  );
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

function augmentTaggedErrorClass<
  ErrorClass extends TaggedErrorClassLike & S.Class<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>,
>(errorClass: ErrorClass): TaggedErrorClassWithNew<ErrorClass> {
  const taggedErrorClassWithNew = errorClass as unknown as RuntimeTaggedErrorClass<ErrorClass>;
  const originalExtend = taggedErrorClassWithNew[TaggedErrorOriginalExtend] ?? errorClass.extend;
  const causeMetadata = getCauseMetadata(errorClass.mapFields(Fn.identity));
  const shouldConstructImmediately = (args: IArguments) => args.length > 1 || !isRestPayload(args[0], causeMetadata);

  taggedErrorClassWithNew.new = function (this: new (value: unknown) => unknown) {
    const makeError = (value: unknown) => new this(value as never);
    const construct = Fn.dual(shouldConstructImmediately, (causeOrInput: unknown, rest?: unknown) =>
      Match.value(rest).pipe(
        Match.when(undefined, () => makeError(causeOrInput)),
        Match.orElse((providedRest) => makeError(toCausePayload(causeOrInput, providedRest)))
      )
    );

    return Reflect.apply(construct, undefined, arguments);
  } as TaggedErrorNewMethod<ErrorClass>;
  taggedErrorClassWithNew.newThunk = function (this: new (value: unknown) => unknown) {
    const makeError = (value: unknown) => new this(value as never);
    const construct = Fn.dual(shouldConstructImmediately, (causeOrInput: unknown, rest?: unknown) =>
      Match.value(rest).pipe(
        Match.when(undefined, () => () => makeError(causeOrInput)),
        Match.orElse((providedRest) => () => makeError(toCausePayload(causeOrInput, providedRest)))
      )
    );

    return Reflect.apply(construct, undefined, arguments);
  } as TaggedErrorNewThunkMethod<ErrorClass>;
  taggedErrorClassWithNew.extend = function (this: ErrorClass, identifier: string) {
    const extendWithIdentifier = Reflect.apply(originalExtend, this, [identifier]) as (
      fields: TaggedErrorFields,
      annotations?: S.Annotations.Declaration<TUnsafe.Any, readonly [TaggedErrorStruct]>
    ) => S.Class<TUnsafe.Any, TUnsafe.Any, TUnsafe.Any>;

    return ((
      fields: TaggedErrorFields,
      annotations?: S.Annotations.Declaration<TUnsafe.Any, readonly [TaggedErrorStruct]>
    ) => augmentTaggedErrorClass(extendWithIdentifier(fields, annotations))) as never;
  } as TaggedErrorExtendMethod<ErrorClass>;
  taggedErrorClassWithNew[TaggedErrorOriginalExtend] = originalExtend;

  return taggedErrorClassWithNew;
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
    const errorClass = isStruct(schema)
      ? S.TaggedErrorClass<TUnsafe.Any, TUnsafe.Any>(identifier)(tagValue, schema, annotations as never)
      : S.TaggedErrorClass<TUnsafe.Any, TUnsafe.Any>(identifier)(tagValue, schema, annotations as never);

    return augmentTaggedErrorClass(errorClass);
  }) as unknown as UnsafeTaggedErrorClassFactory;
};
