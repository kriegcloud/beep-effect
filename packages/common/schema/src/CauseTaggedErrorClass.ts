import type { TUnsafe } from "@beep/types";
import type { Struct } from "effect";
import { Effect } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { withStatics } from "./SchemaUtils/withStatics.ts";
import { TaggedErrorClass, type TaggedErrorClassFromFields } from "./TaggedErrorClass.ts";

type CauseTaggedErrorFields = S.Struct.Fields;
type CauseTaggedErrorReservedField = "message" | "cause";
type CauseTaggedErrorClassLike = (new (
  ...args: ReadonlyArray<TUnsafe.Any>
) => TUnsafe.Any) & {
  readonly Type: TUnsafe.Any;
  readonly fields: CauseTaggedErrorFields;
  readonly "~type.parameters": readonly [S.Struct<CauseTaggedErrorFields>];
  readonly extend: TUnsafe.Any;
};

type CauseTaggedErrorStandardFields = {
  readonly message: typeof S.String;
  readonly cause: typeof S.DefectWithStack;
};

type CauseTaggedErrorCombinedFields<Fields extends CauseTaggedErrorFields> = Struct.Simplify<
  Struct.Assign<Fields, CauseTaggedErrorStandardFields>
>;

type CauseTaggedErrorNoReservedFields<Fields extends CauseTaggedErrorFields> =
  Extract<keyof Fields, CauseTaggedErrorReservedField> extends never ? Fields : never;

type CauseTaggedErrorAnnotation<Self, Schema extends S.Top> = S.Annotations.Declaration<Self, readonly [Schema]> & {
  readonly message?: never;
  readonly cause?: never;
};

type CauseTaggedErrorNewInput<Fields extends CauseTaggedErrorFields> = S.Schema.Type<
  S.Struct<CauseTaggedErrorCombinedFields<Fields>>
>;

type CauseTaggedErrorExtrasInput<Fields extends CauseTaggedErrorFields> = Omit<
  CauseTaggedErrorNewInput<Fields>,
  "message" | "cause"
>;

type CauseTaggedErrorCtor<Error, Fields extends CauseTaggedErrorFields> = new (
  input: CauseTaggedErrorNewInput<Fields>
) => Error;
type CauseTaggedErrorConstructorArgs<ErrorClass extends CauseTaggedErrorClassLike> = ErrorClass extends new (
  ...args: infer Args
) => TUnsafe.Any
  ? Args
  : never;
type CauseTaggedErrorInstance<ErrorClass extends CauseTaggedErrorClassLike> = ErrorClass extends new (
  ...args: ReadonlyArray<TUnsafe.Any>
) => infer Instance
  ? Instance
  : never;

type CauseTaggedErrorNew<Error, Fields extends CauseTaggedErrorFields> = [keyof Fields] extends [never]
  ? {
      (cause: unknown, message: string): Error;
      (message: string): (cause: unknown) => Error;
    }
  : {
      (cause: unknown, message: string, extras: CauseTaggedErrorExtrasInput<Fields>): Error;
      (message: string, extras: CauseTaggedErrorExtrasInput<Fields>): (cause: unknown) => Error;
    };

type CauseTaggedErrorMapError<Error, Fields extends CauseTaggedErrorFields> = [keyof Fields] extends [never]
  ? {
      <A, E, R>(self: Effect.Effect<A, E, R>, message: string): Effect.Effect<A, Error, R>;
      (message: string): <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, Error, R>;
    }
  : {
      <A, E, R>(
        self: Effect.Effect<A, E, R>,
        message: string,
        extras: CauseTaggedErrorExtrasInput<Fields>
      ): Effect.Effect<A, Error, R>;
      (
        message: string,
        extras: CauseTaggedErrorExtrasInput<Fields>
      ): <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, Error, R>;
    };

type CauseTaggedErrorStatics<Error, Fields extends CauseTaggedErrorFields> = {
  readonly new: CauseTaggedErrorNew<Error, Fields>;
  readonly mapError: CauseTaggedErrorMapError<Error, Fields>;
};

type CauseTaggedErrorMissingSelfGeneric<Usage extends string> =
  `Missing \`Self\` generic - use \`class Self extends ${Usage}<Self>(...)\``;

type CauseTaggedErrorExtendMethod<
  Tag extends string,
  Fields extends CauseTaggedErrorFields,
  ErrorClass extends CauseTaggedErrorClassLike,
> = <Extended = never, Brand = {}>(
  identifier: string
) => <NewFields extends CauseTaggedErrorFields>(
  fields: CauseTaggedErrorNoReservedFields<NewFields>,
  annotations?: CauseTaggedErrorAnnotation<
    Extended,
    S.Struct<Struct.Simplify<Struct.Assign<ErrorClass["~type.parameters"][0]["fields"], NewFields>>>
  >
) => [Extended] extends [never]
  ? CauseTaggedErrorMissingSelfGeneric<"Base.extend">
  : CauseTaggedErrorClassWithStatics<
      Extended,
      Tag,
      Struct.Simplify<Struct.Assign<Fields, NewFields>>,
      Brand,
      TaggedErrorClassFromFields<
        Extended,
        Tag,
        Struct.Simplify<Struct.Assign<CauseTaggedErrorCombinedFields<Fields>, NewFields>>,
        Brand
      >
    >;

/**
 * Tagged error class returned by {@link CauseTaggedErrorClass}, including dual construction helpers.
 *
 * @since 0.0.0
 * @category models
 */
export type CauseTaggedErrorClassWithStatics<
  Self,
  Tag extends string,
  Fields extends CauseTaggedErrorFields,
  Brand,
  ErrorClass extends CauseTaggedErrorClassLike = TaggedErrorClassFromFields<
    Self,
    Tag,
    CauseTaggedErrorCombinedFields<Fields>,
    Brand
  >,
> = (new (
  ...args: CauseTaggedErrorConstructorArgs<ErrorClass>
) => CauseTaggedErrorInstance<ErrorClass>) &
  Omit<ErrorClass, "extend"> &
  CauseTaggedErrorStatics<Self, Fields> & {
    readonly extend: CauseTaggedErrorExtendMethod<Tag, Fields, ErrorClass>;
  };

/**
 * Factory returned by {@link CauseTaggedErrorClass} after an identity namespace has been selected.
 *
 * @since 0.0.0
 * @category models
 */
export interface CauseTaggedErrorClassFactory<Self, Brand = {}> {
  <Tag extends string, const Fields extends CauseTaggedErrorFields>(
    tag: Tag,
    fields: CauseTaggedErrorNoReservedFields<Fields>,
    annotations?: CauseTaggedErrorAnnotation<Self, S.TaggedStruct<Tag, CauseTaggedErrorCombinedFields<Fields>>>
  ): CauseTaggedErrorClassWithStatics<Self, Tag, Fields, Brand>;

  <Tag extends string>(
    tag: Tag,
    annotations?: CauseTaggedErrorAnnotation<Self, S.TaggedStruct<Tag, CauseTaggedErrorStandardFields>>
  ): CauseTaggedErrorClassWithStatics<Self, Tag, {}, Brand>;
}

/**
 * Callable constructor for creating cause-tagged error class factories.
 *
 * @since 0.0.0
 * @category constructors
 */
export type CauseTaggedErrorClassConstructor = <Self, Brand = {}>(
  identifier?: undefined | string
) => CauseTaggedErrorClassFactory<Self, Brand>;

const CauseTaggedErrorStandardFields = {
  message: S.String,
  cause: S.DefectWithStack,
} as const;

const hasExtraFields = (fields: CauseTaggedErrorFields): boolean => !R.isEmptyReadonlyRecord(fields);

const isSchemaFields = (value: unknown): value is CauseTaggedErrorFields =>
  P.isObject(value) && R.every(value as Readonly<Record<string, unknown>>, S.isSchema);

const combineCauseTaggedErrorFields = <Fields extends CauseTaggedErrorFields>(
  fields: Fields
): CauseTaggedErrorCombinedFields<Fields> =>
  ({
    ...fields,
    ...CauseTaggedErrorStandardFields,
  }) as CauseTaggedErrorCombinedFields<Fields>;

const causeTaggedErrorInput = <Fields extends CauseTaggedErrorFields>(
  cause: unknown,
  message: string,
  extras?: CauseTaggedErrorExtrasInput<Fields>
): CauseTaggedErrorNewInput<Fields> =>
  ({
    ...extras,
    message,
    cause,
  }) as CauseTaggedErrorNewInput<Fields>;

const makeCauseTaggedErrorNew = <Error, Fields extends CauseTaggedErrorFields>(
  fields: Fields
): CauseTaggedErrorNew<Error, Fields> => {
  const hasExtras = hasExtraFields(fields);
  const build = dual(
    hasExtras ? 4 : 3,
    (
      ctor: CauseTaggedErrorCtor<Error, Fields>,
      cause: unknown,
      message: string,
      extras?: CauseTaggedErrorExtrasInput<Fields>
    ) => new ctor(causeTaggedErrorInput<Fields>(cause, message, extras))
  ) as (
    ctor: CauseTaggedErrorCtor<Error, Fields>,
    cause: unknown,
    message: string,
    extras?: CauseTaggedErrorExtrasInput<Fields>
  ) => Error;

  return function (
    this: CauseTaggedErrorCtor<Error, Fields>,
    causeOrMessage: unknown,
    messageOrExtras?: string | CauseTaggedErrorExtrasInput<Fields>,
    extras?: CauseTaggedErrorExtrasInput<Fields>
  ): Error | ((cause: unknown) => Error) {
    if (hasExtras) {
      return arguments.length >= 3
        ? build(this, causeOrMessage, messageOrExtras as string, extras)
        : (cause: unknown) =>
            build(this, cause, causeOrMessage as string, messageOrExtras as CauseTaggedErrorExtrasInput<Fields>);
    }

    return arguments.length >= 2
      ? build(this, causeOrMessage, messageOrExtras as string)
      : (cause: unknown) => build(this, cause, causeOrMessage as string);
  } as CauseTaggedErrorNew<Error, Fields>;
};

const makeCauseTaggedErrorMapError = <Error, Fields extends CauseTaggedErrorFields>(
  fields: Fields
): CauseTaggedErrorMapError<Error, Fields> => {
  const hasExtras = hasExtraFields(fields);
  const build = dual(
    hasExtras ? 4 : 3,
    <A, E, R>(
      ctor: CauseTaggedErrorCtor<Error, Fields>,
      self: Effect.Effect<A, E, R>,
      message: string,
      extras?: CauseTaggedErrorExtrasInput<Fields>
    ): Effect.Effect<A, Error, R> =>
      Effect.mapError(self, (cause) => new ctor(causeTaggedErrorInput<Fields>(cause, message, extras)))
  ) as <A, E, R>(
    ctor: CauseTaggedErrorCtor<Error, Fields>,
    self: Effect.Effect<A, E, R>,
    message: string,
    extras?: CauseTaggedErrorExtrasInput<Fields>
  ) => Effect.Effect<A, Error, R>;

  return function <A, E, R>(
    this: CauseTaggedErrorCtor<Error, Fields>,
    selfOrMessage: Effect.Effect<A, E, R> | string,
    messageOrExtras?: string | CauseTaggedErrorExtrasInput<Fields>,
    extras?: CauseTaggedErrorExtrasInput<Fields>
  ): Effect.Effect<A, Error, R> | ((self: Effect.Effect<A, E, R>) => Effect.Effect<A, Error, R>) {
    if (hasExtras) {
      return arguments.length >= 3
        ? build(this, selfOrMessage as Effect.Effect<A, E, R>, messageOrExtras as string, extras)
        : (self: Effect.Effect<A, E, R>) =>
            build(this, self, selfOrMessage as string, messageOrExtras as CauseTaggedErrorExtrasInput<Fields>);
    }

    return arguments.length >= 2
      ? build(this, selfOrMessage as Effect.Effect<A, E, R>, messageOrExtras as string)
      : (self: Effect.Effect<A, E, R>) => build(this, self, selfOrMessage as string);
  } as CauseTaggedErrorMapError<Error, Fields>;
};

const attachCauseTaggedErrorStatics = <
  Self,
  Tag extends string,
  Fields extends CauseTaggedErrorFields,
  Brand,
  ErrorClass extends CauseTaggedErrorClassLike,
>(
  errorClass: ErrorClass,
  fields: Fields
): CauseTaggedErrorClassWithStatics<Self, Tag, Fields, Brand, ErrorClass> => {
  const originalExtend = errorClass.extend as (
    this: CauseTaggedErrorClassLike,
    identifier: string
  ) => (
    fields: CauseTaggedErrorFields,
    annotations?: S.Annotations.Declaration<TUnsafe.Any, readonly [S.Struct<CauseTaggedErrorFields>]>
  ) => CauseTaggedErrorClassLike;

  return withStatics(errorClass, () => ({
    new: makeCauseTaggedErrorNew<Self, Fields>(fields),
    mapError: makeCauseTaggedErrorMapError<Self, Fields>(fields),
    extend: function (this: CauseTaggedErrorClassLike, identifier: string) {
      const extend = originalExtend.call(this, identifier);

      return (newFields: CauseTaggedErrorFields, annotations?: TUnsafe.Any) => {
        const extended = extend(newFields, annotations);

        return attachCauseTaggedErrorStatics(extended, {
          ...fields,
          ...newFields,
        } as CauseTaggedErrorFields);
      };
    },
  })) as CauseTaggedErrorClassWithStatics<Self, Tag, Fields, Brand, ErrorClass>;
};

/**
 * Create a tagged error class that always carries a `message` and required defect `cause`.
 *
 * `CauseTaggedErrorClass` is a pipe-friendly offshoot of {@link TaggedErrorClass}.
 * It prepends `message: S.String` and `cause: S.DefectWithStack` to every
 * generated class and attaches dual static `new` and `mapError` helpers.
 *
 * @example
 * ```ts
 * import { $SchemaId } from "@beep/identity/packages"
 * import { Effect, pipe } from "effect"
 * import { CauseTaggedErrorClass } from "@beep/schema/CauseTaggedErrorClass"
 *
 * const $I = $SchemaId.create("CauseTaggedErrorClass/basic")
 *
 * class DomainError extends CauseTaggedErrorClass<DomainError>($I`DomainError`)(
 *   "DomainError",
 *   $I.annote("DomainError", {
 *     description: "A domain failure with a message and defect cause."
 *   })
 * ) {}
 *
 * const program = pipe(
 *   Effect.fail("raw failure"),
 *   DomainError.mapError("Domain operation failed")
 * )
 *
 * void program
 * ```
 *
 * @example
 * ```ts
 * import { $SchemaId } from "@beep/identity/packages"
 * import * as S from "effect/Schema"
 * import { CauseTaggedErrorClass } from "@beep/schema/CauseTaggedErrorClass"
 *
 * const $I = $SchemaId.create("CauseTaggedErrorClass/with-extra-fields")
 *
 * class OperationError extends CauseTaggedErrorClass<OperationError>($I`OperationError`)(
 *   "OperationError",
 *   {
 *     operation: S.String
 *   },
 *   $I.annote("OperationError", {
 *     description: "An operation failure with structured context."
 *   })
 * ) {}
 *
 * const error = OperationError.new("Operation failed", {
 *   operation: "load-profile"
 * })(new Error("database unavailable"))
 *
 * void error
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const CauseTaggedErrorClass: CauseTaggedErrorClassConstructor = (identifier?: undefined | string) => {
  return ((tag: string, fieldsOrAnnotations?: TUnsafe.Any, annotations?: TUnsafe.Any) => {
    const hasFields = isSchemaFields(fieldsOrAnnotations);
    const fields = hasFields ? fieldsOrAnnotations : {};
    const taggedError = TaggedErrorClass<TUnsafe.Any, TUnsafe.Any>(identifier)(
      tag,
      combineCauseTaggedErrorFields(fields),
      hasFields ? annotations : fieldsOrAnnotations
    );

    return attachCauseTaggedErrorStatics(taggedError, fields);
  }) as TUnsafe.Any;
};
