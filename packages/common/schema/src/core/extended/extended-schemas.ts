/**
 * Extended schema helpers with batching and default wiring.
 *
 * Rehosts the legacy schema helpers with Effect-first utilities and identity annotations.
 *
 * @example
 * import * as S from "effect/Schema";
 * import * as Extended from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = Extended.Struct({ id: S.String });
 *
 * @category Core/Extended
 * @since 0.1.0
 */
import type { StructTypes, UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as Hash from "effect/Hash";
import * as HashSet from "effect/HashSet";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import * as _Struct from "effect/Struct";
/**
 * Wraps a schema in a property signature that injects constructor defaults.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { withDefaultConstructor } from "@beep/schema/core/extended/extended-schemas";
 *
 * const field = S.String.pipe(withDefaultConstructor(() => "fallback"));
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const withDefaultConstructor: <A, I, R>(
  makeDefault: () => NoInfer<A>
) => (self: S.Schema<A, I, R>) => S.PropertySignature<":", A, never, ":", I, true, R> = (makeDefault) => (self) =>
  S.propertySignature(self).pipe(S.withConstructorDefault(makeDefault));

/**
 * Struct overload that preserves index signatures while enabling batching annotations.
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function Struct<Fields extends S.Struct.Fields, const Records extends S.IndexSignature.NonEmptyRecords>(
  fields: Fields,
  ...records: Records
): S.TypeLiteral<Fields, Records>;
/**
 * Struct overload for field-only schemas with batching annotations.
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function Struct<Fields extends S.Struct.Fields>(fields: Fields): S.Struct<Fields>;
/**
 * Equivalent to `Schema.Struct` but enables batching annotations for improved concurrency.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Struct } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = Struct({ id: S.String });
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function Struct<Fields extends S.Struct.Fields, const Records extends S.IndexSignature.Records>(
  fields: Fields,
  ...records: Records
): S.TypeLiteral<Fields, Records> {
  return S.Struct(fields, ...(records as UnsafeTypes.UnsafeAny)).pipe(
    S.annotations({
      description: "Struct helper with batching enabled by default.",
      batching: true,
    })
  );
}

/**
 * Namespace for {@link Struct} helper types.
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export declare namespace Struct {
  /**
   * Alias for the fields accepted by {@link Struct}.
   *
   * @category Core/Extended
   * @since 0.1.0
   */
  export type Fields = S.Struct.Fields;
  /**
   * Runtime type for {@link Struct}.
   *
   * @category Core/Extended
   * @since 0.1.0
   */
  export type Type<F extends Fields> = S.Struct.Type<F>;
  /**
   * Encoded type for {@link Struct}.
   *
   * @category Core/Extended
   * @since 0.1.0
   */
  export type Encoded<F extends Fields> = S.Struct.Encoded<F>;
  /**
   * Context type for {@link Struct}.
   *
   * @category Core/Extended
   * @since 0.1.0
   */
  export type Context<F extends Fields> = S.Struct.Context<F>;
  /**
   * Constructor type for {@link Struct}.
   *
   * @category Core/Extended
   * @since 0.1.0
   */
  export type Constructor<F extends Fields> = S.Struct.Constructor<F>;
}

/**
 * Tuple overload that captures rest schemas with batching annotations.
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function Tuple<const Elements extends S.TupleType.Elements, Rest extends A.NonEmptyReadonlyArray<S.Schema.Any>>(
  elements: Elements,
  ...rest: Rest
): S.TupleType<Elements, Rest>;
/**
 * Tuple overload for fixed element sequences with batching annotations.
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function Tuple<Elements extends S.TupleType.Elements>(...elements: Elements): S.Tuple<Elements>;
/**
 * Tuple helper that automatically applies batching annotations.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Tuple } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = Tuple(S.String, S.Number);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function Tuple(...args: ReadonlyArray<UnsafeTypes.UnsafeAny>): UnsafeTypes.UnsafeAny {
  return S.Tuple(...args).annotations({
    batching: true,
  });
}

/**
 * Non-empty array helper with bookkeeping for batched parsing.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { NonEmptyArray } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = NonEmptyArray(S.String);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function NonEmptyArray<Value extends S.Schema.Any>(value: Value): S.NonEmptyArray<Value> {
  return F.pipe(
    S.NonEmptyArray(value),
    S.annotations({
      description: "Non-empty array helper with batching.",
      batching: true,
    })
  );
}

/**
 * Array helper that enables batching and wires a `withDefault` helper returning an empty array.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Array as ArraySchema } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = ArraySchema(S.String);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function Array<Value extends S.Schema.Any>(value: Value) {
  const schema = F.pipe(
    S.Array(value),
    S.annotations({
      description: "Array helper with batching and default constructor support.",
      batching: true,
    })
  );
  const withDefault = schema.pipe(withDefaultConstructor(() => []));
  return R.set(schema, "withDefault" as const, withDefault) as typeof schema & {
    readonly withDefault: typeof withDefault;
  };
}

/**
 * ReadonlySet helper that enables batching and exposes an empty-set default constructor.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ReadonlySet } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = ReadonlySet(S.String);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const ReadonlySet = <Value extends S.Schema.Any>(value: Value) => {
  const schema = F.pipe(
    S.ReadonlySet(value),
    S.annotations({
      description: "ReadonlySet helper with batching and empty-set defaults.",
      batching: true,
    })
  );
  const withDefault = schema.pipe(withDefaultConstructor(() => new Set<S.Schema.Type<Value>>()));
  return R.set(schema, "withDefault" as const, withDefault) as typeof schema & {
    readonly withDefault: typeof withDefault;
  };
};

/**
 * ReadonlyMap helper with batching metadata and map-constructor defaults.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ReadonlyMap } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = ReadonlyMap({ key: S.String, value: S.Number });
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const ReadonlyMap = <K extends S.Schema.Any, V extends S.Schema.Any>(pair: {
  readonly key: K;
  readonly value: V;
}) => {
  const schema = F.pipe(
    S.ReadonlyMap(pair),
    S.annotations({
      description: "ReadonlyMap helper with batching and map defaults.",
      batching: true,
    })
  );
  const withDefault = schema.pipe(withDefaultConstructor(() => new Map()));
  return R.set(schema, "withDefault" as const, withDefault) as typeof schema & {
    readonly withDefault: typeof withDefault;
  };
};

/**
 * NullOr helper with an always-null constructor default for optional fields.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { NullOr } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = NullOr(S.String);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const NullOr = <SchemaType extends S.Schema.Any>(self: SchemaType) => {
  const schema = S.NullOr(self);
  const withDefault = schema.pipe(withDefaultConstructor(() => null));
  return R.set(schema, "withDefault" as const, withDefault) as typeof schema & {
    readonly withDefault: typeof withDefault;
  };
};

/**
 * Decorates a `Date` schema with a constructor default set to `new Date()`.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { defaultDate } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = defaultDate(S.Date);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const defaultDate = <I, R>(s: S.Schema<Date, I, R>) =>
  s.pipe(withDefaultConstructor(() => DateTime.toDate(DateTime.unsafeNow())));

/**
 * Decorates a boolean schema with a default `false` constructor.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { defaultBool } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = defaultBool(S.Boolean);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const defaultBool = <I, R>(s: S.Schema<boolean, I, R>) => s.pipe(withDefaultConstructor(() => false));

/**
 * Decorates nullable schemas with a default `null` constructor.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { defaultNullable } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = defaultNullable(S.NullOr(S.String));
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const defaultNullable = <A, I, R>(s: S.Schema<A | null, I, R>) => s.pipe(withDefaultConstructor(() => null));

/**
 * Decorates array schemas with an empty-array constructor default.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { defaultArray } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = defaultArray(S.Array(S.String));
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const defaultArray = <A, I, R>(s: S.Schema<ReadonlyArray<A>, I, R>) => s.pipe(withDefaultConstructor(() => []));

/**
 * Decorates map schemas with an empty-map constructor default.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { defaultMap } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = defaultMap(S.ReadonlyMap({ key: S.String, value: S.String }));
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const defaultMap = <A, A2, I, R>(s: S.Schema<ReadonlyMap<A, A2>, I, R>) =>
  s.pipe(withDefaultConstructor(() => new Map()));

/**
 * Decorates set schemas with an empty-set constructor default.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { defaultSet } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = defaultSet(S.ReadonlySet(S.String));
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const defaultSet = <A, I, R>(s: S.Schema<ReadonlySet<A>, I, R>) =>
  s.pipe(withDefaultConstructor(() => new Set<A>()));

/**
 * Produces a decoding helper that copies all schema members and applies constructor defaults.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { withDefaultMake } from "@beep/schema/core/extended/extended-schemas";
 *
 * const decoder = withDefaultMake(S.Struct({ id: S.String }));
 * const entity = decoder({ id: "123" });
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const withDefaultMake = <Self extends S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, never>>(
  schema: Self
) => {
  const decode = S.decodeSync(schema) as WithDefaults<Self>;
  Object.setPrototypeOf(decode, schema);
  return decode;
};

/**
 * Function signature returned by {@link withDefaultMake}.
 *
 * @example
 * import * as S from "effect/Schema";
 * import type { WithDefaults } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = S.Struct({ id: S.String });
 * type SchemaDecoder = WithDefaults<typeof schema>;
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export type WithDefaults<Self extends S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, never>> = (
  i: S.Schema.Encoded<Self>,
  options?: AST.ParseOptions
) => S.Schema.Type<Self>;

const makeOpt = (self: S.PropertySignature.Any, exact?: boolean) => {
  const ast = self.ast;
  switch (ast._tag) {
    case "PropertySignatureDeclaration": {
      return S.makePropertySignature(
        new S.PropertySignatureDeclaration(
          exact ? ast.type : S.UndefinedOr(S.make(ast.type)).ast,
          true,
          ast.isReadonly,
          ast.annotations,
          ast.defaultValue
        )
      );
    }
    case "PropertySignatureTransformation": {
      return S.makePropertySignature(
        new S.PropertySignatureTransformation(
          new S.FromPropertySignature(
            exact ? ast.from.type : S.UndefinedOr(S.make(ast.from.type)).ast,
            true,
            ast.from.isReadonly,
            ast.from.annotations
          ),
          new S.ToPropertySignature(
            exact ? ast.to.type : S.UndefinedOr(S.make(ast.to.type)).ast,
            true,
            ast.to.isReadonly,
            ast.to.annotations,
            ast.to.defaultValue
          ),
          ast.decode,
          ast.encode
        )
      );
    }
  }
};

/**
 * Converts struct property signatures to optional equivalents.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { makeOptional } from "@beep/schema/core/extended/extended-schemas";
 *
 * const optional = makeOptional({ id: S.String, name: S.String });
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function makeOptional<NER extends StructTypes.StructFieldsOrPropertySignatures>(
  t: StructTypes.NonEmptyStructFieldsOrPropertySignatures<NER>
): {
  [K in keyof NER]: S.PropertySignature<
    "?:",
    S.Schema.Type<NER[K]> | undefined,
    never,
    "?:",
    S.Schema.Encoded<NER[K]> | undefined,
    NER[K] extends S.PropertySignature<
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      infer Z,
      UnsafeTypes.UnsafeAny
    >
      ? Z
      : false,
    S.Schema.Context<NER[K]>
  >;
} {
  return F.pipe(
    _Struct.keys(t),
    A.reduce({} as UnsafeTypes.UnsafeAny, (acc, key) => {
      if (S.isSchema(t[key])) {
        acc[key] = S.optional(t[key] as UnsafeTypes.UnsafeAny);
      } else {
        acc[key] = makeOpt(t[key] as UnsafeTypes.UnsafeAny);
      }
      return acc;
    })
  );
}

/**
 * Converts struct property signatures to optional equivalents without widening the encoded type.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { makeExactOptional } from "@beep/schema/core/extended/extended-schemas";
 *
 * const optional = makeExactOptional({ id: S.String });
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function makeExactOptional<NER extends StructTypes.StructFieldsWithStringKeys>(
  t: StructTypes.NonEmptyStructFields<NER>
): {
  [K in keyof NER]: S.PropertySignature<
    "?:",
    S.Schema.Type<NER[K]>,
    never,
    "?:",
    S.Schema.Encoded<NER[K]>,
    NER[K] extends S.PropertySignature<
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      UnsafeTypes.UnsafeAny,
      infer Z,
      UnsafeTypes.UnsafeAny
    >
      ? Z
      : false,
    S.Schema.Context<NER[K]>
  >;
} {
  return F.pipe(
    _Struct.keys(t),
    A.reduce({} as UnsafeTypes.UnsafeAny, (acc, key) => {
      if (S.isSchema(t[key])) {
        acc[key] = S.optionalWith(t[key] as UnsafeTypes.UnsafeAny, {
          exact: true,
        });
      } else {
        acc[key] = makeOpt(t[key] as UnsafeTypes.UnsafeAny);
      }
      return acc;
    })
  );
}

/**
 * Applies a lossy transform by inferring the target type from a callback result.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { destructiveTransform } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = S.String.pipe(destructiveTransform((value) => value.length));
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export function destructiveTransform<A, B>(
  transform: (input: A) => B
): <I, R>(self: S.Schema<A, I, R>) => S.Schema<Readonly<B>, I, R> {
  return <I, R>(self: S.Schema<A, I, R>): S.Schema<Readonly<B>, I, R> => {
    return S.transformOrFail(self, S.Any as S.Schema<Readonly<B>>, {
      decode: (input) =>
        ParseResult.try({
          try: () => transform(input) as Readonly<B>,
          catch: () => new ParseResult.Type(self.ast, input, "Error applying transformation"),
        }),
      // Pass through the value on encode - this is safe because the value is already
      // in the transformed form and we can't reverse the transformation.
      // This allows destructive transforms to work in union schemas and class fields.
      encode: (value) => ParseResult.succeed(value as UnsafeTypes.UnsafeAny),
    });
  };
}

/**
 * Trimmed string schema requiring a minimum of one character (capped at 5k for safety).
 *
 * @example
 * import { TrimNonEmpty } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = TrimNonEmpty();
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const TrimNonEmpty = (opts?: { message?: string }): S.refine<string, S.filter<typeof S.Trim>> =>
  S.Trim.pipe(
    S.minLength(1),
    S.maxLength(5000),
    S.annotations({
      description: "Trimmed string schema that rejects empty values.",
      message: () => opts?.message ?? "Expected a non-empty trimmed string",
      override: true,
    })
  );

/**
 * Converts a schema into a nullable variant that logs parse issues and returns `null` for invalid items.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { NullOrFromFallible } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = NullOrFromFallible(S.Number);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const NullOrFromFallible = <A, I, R>(schema: S.Schema<A, I, R>): S.NullOr<S.Schema<A, I, R>> =>
  S.NullOr(schema).pipe(
    S.annotations({
      decodingFallback: () => Either.right(null),
    })
  );

/**
 * Converts optional nullish schemas into required nulls on decode for consistent defaults.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { NullOrFromOptional } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = NullOrFromOptional(S.String);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const NullOrFromOptional = <A, I, R>(
  schema: S.Schema<A, I, R>
): S.PropertySignature<":", Exclude<A, undefined> | null, never, "?:", I | null | undefined, true, R> =>
  S.NullishOr(schema).pipe(
    S.optional,
    S.withDefaults({
      constructor: () => null,
      decoding: () => null,
    })
  );

/**
 * Transforms an array-of-nullables schema into a non-nullable array by logging invalid elements.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { ArrayFromFallible } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = ArrayFromFallible(S.Number);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const ArrayFromFallible = <A, I, R>(
  schema: S.Schema<A, I, R>
): S.transform<S.Array$<S.NullOr<S.Schema<A, I, R>>>, S.SchemaClass<ReadonlyArray<A>, ReadonlyArray<A>, never>> =>
  S.Array(
    S.NullOr(schema).annotations({
      decodingFallback: (issue) =>
        Effect.zipRight(
          Effect.logWarning(`[ArrayFromFallible] ${ParseResult.TreeFormatter.formatIssueSync(issue)}`),
          Effect.succeed(null)
        ),
    })
  ).pipe(
    S.transform(S.typeSchema(S.Array(schema)), {
      decode: (array) => F.pipe(array, A.fromIterable, A.filter(P.isNotNull)),
      encode: F.identity,
      strict: true,
    })
  );

/**
 * Converts a nullable array schema into a HashSet while logging parse failures.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HashSetFromFallibleArray } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = HashSetFromFallibleArray(S.String);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const HashSetFromFallibleArray = <A, I, R>(
  schema: S.Schema<A, I, R>
): S.transform<
  S.transform<S.Array$<S.NullOr<S.Schema<A, I, R>>>, S.SchemaClass<ReadonlyArray<A>, ReadonlyArray<A>, never>>,
  S.SchemaClass<HashSet.HashSet<A>, HashSet.HashSet<A>, never>
> =>
  ArrayFromFallible(schema).pipe(
    S.transform(S.typeSchema(S.HashSet(schema)), {
      decode: (array) => HashSet.fromIterable(array),
      encode: (hashSet) => A.fromIterable(hashSet),
      strict: true,
    })
  );

/**
 * Converts a nullable array schema into a native `Set`, skipping invalid entries.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { SetFromFallibleArray } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = SetFromFallibleArray(S.String);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const SetFromFallibleArray = <A, I, R>(
  schema: S.Schema<A, I, R>
): S.transform<
  S.transform<S.Array$<S.NullOr<S.Schema<A, I, R>>>, S.SchemaClass<ReadonlyArray<A>, ReadonlyArray<A>, never>>,
  S.SchemaClass<Set<A>, Set<A>, never>
> =>
  ArrayFromFallible(schema).pipe(
    S.transform(S.typeSchema(S.Set(schema)), {
      decode: (array) => new Set(array),
      encode: (set) => A.fromIterable(set),
      strict: true,
    })
  );

/**
 * Transforms array schemas into HashSets during decoding (and vice versa during encoding).
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HashSetFromIterable } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = HashSetFromIterable(S.Number);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const HashSetFromIterable = <A, I, R>(
  schema: S.Schema<A, I, R>
): S.transform<S.Array$<S.Schema<A, I, R>>, S.SchemaClass<HashSet.HashSet<A>, HashSet.HashSet<A>, never>> =>
  S.transform(S.Array(schema), S.typeSchema(S.HashSet(schema)), {
    strict: true,
    decode: (array) => HashSet.fromIterable(array),
    encode: (hashSet) => A.fromIterable(hashSet),
  });

// ---------------
// Formatting
// ---------------

/**
 * Formats parse issues into newline-delimited strings that include the JSON path for each issue.
 *
 * @example
 * import * as Effect from "effect/Effect";
 * import * as S from "effect/Schema";
 * import { formatParseIssueMessages } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = S.Number;
 * const issue = S.decodeUnknown(schema)({ not: "a number" }).pipe(Effect.runSyncExit);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const formatParseIssueMessages = (
  issue: ParseResult.ParseIssue,
  opts?: {
    newLines?: number;
    numbered?: boolean;
  }
): Effect.Effect<string, never, never> =>
  ParseResult.ArrayFormatter.formatIssue(issue).pipe(
    Effect.map((issues) => {
      const newline = Str.repeat(opts?.newLines ?? 1)("\n");
      return F.pipe(
        issues,
        A.map((entry, index) => {
          const prefix = opts?.numbered === true ? `${index + 1}. ` : "";
          const pathSegments = F.pipe(
            entry.path,
            A.map((segment) => String(segment))
          );
          const joinedPath = A.isNonEmptyReadonlyArray(entry.path) ? A.join(pathSegments, ".") : "ROOT";
          return `${prefix}[${joinedPath}] ${entry.message}`;
        }),
        (messages) => A.join(messages, newline)
      );
    })
  );

// ---------------
// Equality/Hash Utilities
// ---------------

/**
 * Sentinel used to disable hash lookups when deriving equality behavior.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { WithEquality, noHashKey } from "@beep/schema/core/extended/extended-schemas";
 *
 * const Person = S.Struct({ id: S.String });
 * type PersonType = S.Schema.Type<typeof Person>;
 * type PersonEncoded = S.Schema.Encoded<typeof Person>;
 * type PersonContext = S.Schema.Context<typeof Person>;
 *
 * const schema = WithEquality<PersonType, PersonEncoded, PersonContext>({
 *   hashKey: noHashKey,
 *   equalityFn: (a, b) => a.id === b.id,
 * })(Person);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const noHashKey = Symbol("noHashKey");

/**
 * Decorates schema results with stable `Eq` and `Hash` implementations.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { WithEquality } from "@beep/schema/core/extended/extended-schemas";
 *
 * const Person = S.Struct({ id: S.String });
 * type PersonType = S.Schema.Type<typeof Person>;
 * type PersonEncoded = S.Schema.Encoded<typeof Person>;
 * type PersonContext = S.Schema.Context<typeof Person>;
 *
 * const schema = WithEquality<PersonType, PersonEncoded, PersonContext>({ hashKey: "id" })(Person);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const WithEquality =
  <A extends Record<string, unknown>, I, R>({
    equalityFn,
    hashKey,
  }:
    | {
        hashKey: keyof A;
        equalityFn?: (a: A, b: A) => boolean;
      }
    | {
        hashKey: typeof noHashKey;
        equalityFn: (a: A, b: A) => boolean;
      }) =>
  (schema: S.Schema<A, I, R>): S.Schema<A, I, R> =>
    S.transform(schema, S.Any, {
      decode: (value: A) => {
        const base = value as A & Record<PropertyKey, unknown>;
        const hashExtension =
          hashKey === noHashKey
            ? function (this: A) {
                return 0;
              }
            : function (this: A) {
                const concreteKey = hashKey as keyof A;
                return Hash.cached(this, Hash.hash(this[concreteKey]));
              };
        const equalityExtension =
          equalityFn === undefined
            ? function (this: A, that: unknown): boolean {
                return S.is(schema)(that) && Hash.hash(this) === Hash.hash(that);
              }
            : function (this: A, that: unknown): boolean {
                return Eq.isEqual(that) && S.is(schema)(that) && equalityFn(this, that as A);
              };

        return R.set(R.set(base, Hash.symbol, hashExtension), Eq.symbol, equalityExtension) as A;
      },
      encode: F.identity,
      strict: true,
    });

// ---------------
// Transformations
// ---------------

/**
 * Computes a derived property during decoding and merges it into the original struct schema.
 *
 * @example
 * import * as Effect from "effect/Effect";
 * import * as S from "effect/Schema";
 * import { deriveAndAttachProperty } from "@beep/schema/core/extended/extended-schemas";
 *
 * const attachFullName = deriveAndAttachProperty({
 *   key: "fullName",
 *   typeSchema: S.String,
 *   decode: (input: { readonly first: string; readonly last: string }) =>
 *     Effect.succeed(`${input.first} ${input.last}`),
 * });
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const deriveAndAttachProperty =
  <
    const Key extends string,
    FromA extends Record<string, unknown>,
    FromI,
    FromR,
    ToA,
    ToI,
    ToR,
    DecodeR = never,
  >(args: {
    key: Key;
    typeSchema: S.Schema<ToA, ToI, ToR>;
    decode: (input: FromA) => Effect.Effect<ToA, never, DecodeR>;
  }) =>
  (
    self: S.Schema<FromA, FromI, FromR>
  ): S.Schema<FromA & { readonly [K in Key]: ToA }, FromI, FromR | ToR | DecodeR> => {
    const derivedSchema = S.typeSchema(
      S.Struct({
        [args.key]: args.typeSchema,
      } as const)
    );

    const extendedSchema = S.extend(S.typeSchema(self), derivedSchema);

    return S.transformOrFail(self, S.typeSchema(extendedSchema), {
      decode: Effect.fnUntraced(function* (input) {
        const result = args.decode(input);
        const attach = (value: ToA) => R.set(input, args.key, value) as FromA & { readonly [K in Key]: ToA };

        if (Effect.isEffect(result)) {
          return yield* result.pipe(Effect.map(attach));
        }

        return attach(result);
      }),
      encode: (struct) => ParseResult.succeed(_Struct.omit(args.key)(struct)),
      strict: false,
    });
  };

/**
 * Lifts a schema into a property signature that encodes at a specific key.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { fromKey } from "@beep/schema/core/extended/extended-schemas";
 *
 * const field = fromKey("username")(S.String);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const fromKey: <const K extends string>(
  key: K
) => <A, I, R>(self: S.Schema<A, I, R>) => S.PropertySignature<":", A, K, ":", I, false, R> =
  <const K extends string>(key: K) =>
  <A, I, R>(self: S.Schema<A, I, R>) =>
    self.pipe(S.propertySignature, S.fromKey(key));

/**
 * Swaps the encoded and decoded channels of a schema, creating a reversible transformation.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { reverseSchema } from "@beep/schema/core/extended/extended-schemas";
 *
 * const schema = reverseSchema(S.DateFromString);
 *
 * @category Core/Extended
 * @since 0.1.0
 */
export const reverseSchema = <A, I, R>(schema: S.Schema<A, I, R>): S.Schema<I, A, R> =>
  S.transformOrFail(S.typeSchema(schema), S.encodedSchema(schema), {
    decode: ParseResult.encode(schema),
    encode: ParseResult.decode(schema),
  });
