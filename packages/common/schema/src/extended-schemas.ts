import type { StructTypes, UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as Hash from "effect/Hash";
import * as HashSet from "effect/HashSet";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as _Struct from "effect/Struct";

export const withDefaultConstructor: <A, I, R>(
  makeDefault: () => NoInfer<A>
) => (self: S.Schema<A, I, R>) => S.PropertySignature<":", A, never, ":", I, true, R> = (makeDefault) => (self) =>
  S.propertySignature(self).pipe(S.withConstructorDefault(makeDefault));

/**
 * Like the default Schema `Struct` but with batching enabled by default
 */
export function Struct<Fields extends S.Struct.Fields, const Records extends S.IndexSignature.NonEmptyRecords>(
  fields: Fields,
  ...records: Records
): S.TypeLiteral<Fields, Records>;
export function Struct<Fields extends S.Struct.Fields>(fields: Fields): S.Struct<Fields>;
export function Struct<Fields extends S.Struct.Fields, const Records extends S.IndexSignature.Records>(
  fields: Fields,
  ...records: Records
): S.TypeLiteral<Fields, Records> {
  return S.Struct(fields, ...(records as UnsafeTypes.UnsafeAny)).pipe(S.annotations({ batching: true }));
}

export declare namespace Struct {
  export type Fields = S.Struct.Fields;
  export type Type<F extends Fields> = S.Struct.Type<F>;
  export type Encoded<F extends Fields> = S.Struct.Encoded<F>;
  export type Context<F extends Fields> = S.Struct.Context<F>;
  export type Constructor<F extends Fields> = S.Struct.Constructor<F>;
}

/**
 * Like the default Schema `tuple` but with batching enabled by default
 */
export function Tuple<const Elements extends S.TupleType.Elements, Rest extends A.NonEmptyReadonlyArray<S.Schema.Any>>(
  elements: Elements,
  ...rest: Rest
): S.TupleType<Elements, Rest>;
export function Tuple<Elements extends S.TupleType.Elements>(...elements: Elements): S.Tuple<Elements>;
export function Tuple(...args: ReadonlyArray<UnsafeTypes.UnsafeAny>): UnsafeTypes.UnsafeAny {
  return S.Tuple(...args).pipe(S.annotations({ batching: true }));
}

/**
 * Like the default Schema `NonEmptyArray` but with batching enabled by default
 */
export function NonEmptyArray<Value extends S.Schema.Any>(value: Value): S.NonEmptyArray<Value> {
  return F.pipe(S.NonEmptyArray(value), S.annotations({ batching: true }));
}

/**
 * Like the default Schema `Array` but with `withDefault` and batching enabled by default
 */
export function Array<Value extends S.Schema.Any>(value: Value) {
  return F.pipe(S.Array(value), S.annotations({ batching: true }), (s) =>
    Object.assign(s, { withDefault: s.pipe(withDefaultConstructor(() => [])) })
  );
}

/**
 * Like the default Schema `ReadonlySet` but with `withDefault` and batching enabled by default
 */
export const ReadonlySet = <Value extends S.Schema.Any>(value: Value) =>
  F.pipe(S.ReadonlySet(value), S.annotations({ batching: true }), (s) =>
    Object.assign(s, {
      withDefault: s.pipe(withDefaultConstructor(() => new Set<S.Schema.Type<Value>>())),
    })
  );

/**
 * Like the default Schema `ReadonlyMap` but with `withDefault` and batching enabled by default
 */
export const ReadonlyMap = <K extends S.Schema.Any, V extends S.Schema.Any>(pair: {
  readonly key: K;
  readonly value: V;
}) =>
  F.pipe(S.ReadonlyMap(pair), S.annotations({ batching: true }), (s) =>
    Object.assign(s, {
      withDefault: s.pipe(withDefaultConstructor(() => new Map())),
    })
  );

/**
 * Like the default Schema `NullOr` but with `withDefault`
 */
export const NullOr = <S extends S.Schema.Any>(self: S) =>
  F.pipe(S.NullOr(self), (s) =>
    Object.assign(s, {
      withDefault: s.pipe(withDefaultConstructor(() => null)),
    })
  );

export const defaultDate = <I, R>(s: S.Schema<Date, I, R>) => s.pipe(withDefaultConstructor(() => new global.Date()));

export const defaultBool = <I, R>(s: S.Schema<boolean, I, R>) => s.pipe(withDefaultConstructor(() => false));

export const defaultNullable = <A, I, R>(s: S.Schema<A | null, I, R>) => s.pipe(withDefaultConstructor(() => null));

export const defaultArray = <A, I, R>(s: S.Schema<ReadonlyArray<A>, I, R>) => s.pipe(withDefaultConstructor(() => []));

export const defaultMap = <A, A2, I, R>(s: S.Schema<ReadonlyMap<A, A2>, I, R>) =>
  s.pipe(withDefaultConstructor(() => new Map()));

export const defaultSet = <A, I, R>(s: S.Schema<ReadonlySet<A>, I, R>) =>
  s.pipe(withDefaultConstructor(() => new Set<A>()));

export const withDefaultMake = <Self extends S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, never>>(
  s: Self
) => {
  const a = Object.assign(S.decodeSync(s) as WithDefaults<Self>, s);
  Object.setPrototypeOf(a, s);
  return a;

  // return s as Self & WithDefaults<Self>
};

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
  return _Struct.keys(t).reduce((prev, cur) => {
    if (S.isSchema(t[cur])) {
      prev[cur] = S.optional(t[cur] as UnsafeTypes.UnsafeAny);
    } else {
      prev[cur] = makeOpt(t[cur] as UnsafeTypes.UnsafeAny);
    }
    return prev;
  }, {} as UnsafeTypes.UnsafeAny);
}

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
  return _Struct.keys(t).reduce((prev, cur) => {
    if (S.isSchema(t[cur])) {
      prev[cur] = S.optionalWith(t[cur] as UnsafeTypes.UnsafeAny, {
        exact: true,
      });
    } else {
      prev[cur] = makeOpt(t[cur] as UnsafeTypes.UnsafeAny);
    }
    return prev;
  }, {} as UnsafeTypes.UnsafeAny);
}

export class DurationFromSeconds extends S.transform(
  S.NonNegative.annotations({
    description: "a non-negative number of seconds to be decoded into a Duration",
  }),
  S.DurationFromSelf,
  {
    strict: true,
    decode: (i) => Duration.seconds(i),
    encode: (a) => Duration.toSeconds(a),
  }
) {}

export class DurationFromDeltaSecondsString extends S.compose(S.NumberFromString, DurationFromSeconds).annotations({
  title: "DurationFromDeltaSecondsString",
  description: "parses a string of non-negative delta-seconds into a Duration",
}) {}

/**
 * A schema for destructive transformations when you need to infer the type from the result of the transformation callback, without specifying the encoded type.
 *
 * @category schema
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
      encode: () =>
        ParseResult.fail(
          new ParseResult.Forbidden(self.ast, "Encoding is not supported for destructive transformations")
        ),
    });
  };
}

/**
 * A schema for trimming and validating non-empty strings.
 *
 * @category schema
 */
export const TrimNonEmpty = (opts?: { message?: string }): S.refine<string, S.filter<typeof S.Trim>> =>
  S.Trim.pipe(
    S.minLength(1),
    S.maxLength(5000),
    S.annotations({
      message: () => opts?.message ?? "Expected a non-empty trimmed string",
      override: true,
    })
  );

/**
 * Creates a schema that allows null values and falls back to null on decoding errors.
 *
 * @category schema
 */
export const NullOrFromFallible = <A, I, R>(schema: S.Schema<A, I, R>): S.NullOr<S.Schema<A, I, R>> =>
  S.NullOr(schema).pipe(
    S.annotations({
      decodingFallback: () => Either.right(null),
    })
  );

/**
 * Transforms optional null/undefined values to required null values
 *
 * @category schema
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
 * A schema for transforming a partitioned array of invalid values into a non-nullable array.
 *
 * @category schema
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
      decode: (array) => array.filter(P.isNotNull),
      encode: F.identity,
      strict: true,
    })
  );

/**
 * A schema for transforming a partitioned array of invalid values into a non-nullable HashSet.
 *
 * @category schema
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
 * A schema for transforming a partitioned array of invalid values into a non-nullable Set.
 *
 * @category schema
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
 * Creates a schema that transforms an array into a HashSet during decoding and back to an array during encoding.
 *
 * @category schema
 * @param schema The schema for the elements in the array/HashSet
 * @returns A schema that transforms between Array<A> and HashSet<A>
 * @example
 * ```ts
 * const numberHashSet = HashSetFromIterable(S.Number)
 * // Decoding: number[] -> HashSet<number>
 * // Encoding: HashSet<number> -> number[]
 * ```
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
 * Formats parse issues into a readable string, including the path for each issue.
 *
 * @category formatting
 * @param issue The ParseIssue to be formatted
 * @param opts Optional configuration:
 *   - newLines: number of newlines between messages
 *   - numbered: whether to prefix messages with numbers (1., 2., etc)
 * @returns An Effect that resolves to a formatted string of parse issues
 */
export const formatParseIssueMessages = (
  issue: ParseResult.ParseIssue,
  opts?: {
    newLines?: number;
    numbered?: boolean;
  }
): Effect.Effect<string, never, never> =>
  ParseResult.ArrayFormatter.formatIssue(issue).pipe(
    Effect.map((issues) =>
      issues
        .map(
          ({ message, path }, index) =>
            `${opts?.numbered === true ? `${index + 1}. ` : ""}[${path.length > 0 ? path.join(".") : "ROOT"}] ${message}`
        )
        .join("\n".repeat(opts?.newLines ?? 1))
    )
  );

// ---------------
// Equality/Hash Utilities
// ---------------

export const noHashKey = Symbol("noHashKey");
/**
 * A schema for adding equality and hash functions to a resulting record.
 *
 * @category schema
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
        const extensions: Partial<Record<symbol, unknown>> = {
          [Hash.symbol](this: A): number {
            if (hashKey === noHashKey) {
              return 0;
            }
            return Hash.cached(this, Hash.hash(this[hashKey]));
          },
          [Eq.symbol](that: unknown): boolean {
            if (!S.is(schema)(that)) {
              return false;
            }

            if (equalityFn !== undefined) {
              return equalityFn(this as unknown as A, that);
            }

            return Hash.hash(this) === Hash.hash(that);
          },
        };

        if (equalityFn !== undefined) {
          extensions[Eq.symbol] = function (that: unknown): boolean {
            return Eq.isEqual(that) && S.is(schema)(that) && equalityFn(this as unknown as A, that);
          };
        }

        return Object.assign(value, extensions);
      },
      encode: F.identity,
      strict: true,
    });

// ---------------
// Transformations
// ---------------

/**
 * Creates a schema that derives and attaches a property to the original schema.
 *
 * @category transformation
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
      decode: (input) =>
        Effect.gen(function* () {
          const result = args.decode(input);

          if (Effect.isEffect(result)) {
            return yield* result.pipe(
              Effect.map((value) => ({
                ...input,
                [args.key]: value,
              }))
            );
          }

          return {
            ...input,
            [args.key]: result,
          };
        }),
      encode: (struct) => ParseResult.succeed(_Struct.omit(args.key)(struct)),
      strict: false,
    });
  };

/**
 * Lifts a `Schema` to a `PropertySignature` and enhances it by specifying a different key for it in the Encoded type.
 *
 * @category schema
 */
export const fromKey: <const K extends string>(
  key: K
) => <A, I, R>(self: S.Schema<A, I, R>) => S.PropertySignature<":", A, K, ":", I, false, R> =
  <const K extends string>(key: K) =>
  <A, I, R>(self: S.Schema<A, I, R>) =>
    self.pipe(S.propertySignature, S.fromKey(key));

/**
 * Reverses a schema, i.e., swaps the encoded and decoded types.
 *
 * @category schema
 */
export const reverseSchema = <A, I, R>(schema: S.Schema<A, I, R>): S.Schema<I, A, R> =>
  S.transformOrFail(S.typeSchema(schema), S.encodedSchema(schema), {
    decode: ParseResult.encode(schema),
    encode: ParseResult.decode(schema),
  });
