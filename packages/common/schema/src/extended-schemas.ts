import type * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as _Struct from "effect/Struct";

export const withDefaultConstructor: <A, I, R>(
  makeDefault: () => NoInfer<A>,
) => (
  self: S.Schema<A, I, R>,
) => S.PropertySignature<":", A, never, ":", I, true, R> =
  (makeDefault) => (self) =>
    S.propertySignature(self).pipe(S.withConstructorDefault(makeDefault));

/**
 * Like the default Schema `Struct` but with batching enabled by default
 */
export function Struct<
  Fields extends S.Struct.Fields,
  const Records extends S.IndexSignature.NonEmptyRecords,
>(fields: Fields, ...records: Records): S.TypeLiteral<Fields, Records>;
export function Struct<Fields extends S.Struct.Fields>(
  fields: Fields,
): S.Struct<Fields>;
export function Struct<
  Fields extends S.Struct.Fields,
  const Records extends S.IndexSignature.Records,
>(fields: Fields, ...records: Records): S.TypeLiteral<Fields, Records> {
  return S.Struct(fields, ...(records as any)).pipe(
    S.annotations({ batching: true }),
  );
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
export function Tuple<
  const Elements extends S.TupleType.Elements,
  Rest extends A.NonEmptyReadonlyArray<S.Schema.Any>,
>(elements: Elements, ...rest: Rest): S.TupleType<Elements, Rest>;
export function Tuple<Elements extends S.TupleType.Elements>(
  ...elements: Elements
): S.Tuple<Elements>;
export function Tuple(...args: ReadonlyArray<any>): any {
  return S.Tuple(...args).pipe(S.annotations({ batching: true }));
}

/**
 * Like the default Schema `NonEmptyArray` but with batching enabled by default
 */
export function NonEmptyArray<Value extends S.Schema.Any>(
  value: Value,
): S.NonEmptyArray<Value> {
  return F.pipe(S.NonEmptyArray(value), S.annotations({ batching: true }));
}

/**
 * Like the default Schema `Array` but with `withDefault` and batching enabled by default
 */
export function Array<Value extends S.Schema.Any>(value: Value) {
  return F.pipe(S.Array(value), S.annotations({ batching: true }), (s) =>
    Object.assign(s, { withDefault: s.pipe(withDefaultConstructor(() => [])) }),
  );
}

/**
 * Like the default Schema `ReadonlySet` but with `withDefault` and batching enabled by default
 */
export const ReadonlySet = <Value extends S.Schema.Any>(value: Value) =>
  F.pipe(S.ReadonlySet(value), S.annotations({ batching: true }), (s) =>
    Object.assign(s, {
      withDefault: s.pipe(
        withDefaultConstructor(() => new Set<S.Schema.Type<Value>>()),
      ),
    }),
  );

/**
 * Like the default Schema `ReadonlyMap` but with `withDefault` and batching enabled by default
 */
export const ReadonlyMap = <
  K extends S.Schema.Any,
  V extends S.Schema.Any,
>(pair: {
  readonly key: K;
  readonly value: V;
}) =>
  F.pipe(S.ReadonlyMap(pair), S.annotations({ batching: true }), (s) =>
    Object.assign(s, {
      withDefault: s.pipe(withDefaultConstructor(() => new Map())),
    }),
  );

/**
 * Like the default Schema `NullOr` but with `withDefault`
 */
export const NullOr = <S extends S.Schema.Any>(self: S) =>
  F.pipe(S.NullOr(self), (s) =>
    Object.assign(s, {
      withDefault: s.pipe(withDefaultConstructor(() => null)),
    }),
  );

export const defaultDate = <I, R>(s: S.Schema<Date, I, R>) =>
  s.pipe(withDefaultConstructor(() => new global.Date()));

export const defaultBool = <I, R>(s: S.Schema<boolean, I, R>) =>
  s.pipe(withDefaultConstructor(() => false));

export const defaultNullable = <A, I, R>(s: S.Schema<A | null, I, R>) =>
  s.pipe(withDefaultConstructor(() => null));

export const defaultArray = <A, I, R>(s: S.Schema<ReadonlyArray<A>, I, R>) =>
  s.pipe(withDefaultConstructor(() => []));

export const defaultMap = <A, A2, I, R>(
  s: S.Schema<ReadonlyMap<A, A2>, I, R>,
) => s.pipe(withDefaultConstructor(() => new Map()));

export const defaultSet = <A, I, R>(s: S.Schema<ReadonlySet<A>, I, R>) =>
  s.pipe(withDefaultConstructor(() => new Set<A>()));

export const withDefaultMake = <Self extends S.Schema<any, any, never>>(
  s: Self,
) => {
  const a = Object.assign(S.decodeSync(s) as WithDefaults<Self>, s);
  Object.setPrototypeOf(a, s);
  return a;

  // return s as Self & WithDefaults<Self>
};

export type WithDefaults<Self extends S.Schema<any, any, never>> = (
  i: S.Schema.Encoded<Self>,
  options?: AST.ParseOptions,
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
          ast.defaultValue,
        ),
      );
    }
    case "PropertySignatureTransformation": {
      return S.makePropertySignature(
        new S.PropertySignatureTransformation(
          new S.FromPropertySignature(
            exact ? ast.from.type : S.UndefinedOr(S.make(ast.from.type)).ast,
            true,
            ast.from.isReadonly,
            ast.from.annotations,
          ),
          new S.ToPropertySignature(
            exact ? ast.to.type : S.UndefinedOr(S.make(ast.to.type)).ast,
            true,
            ast.to.isReadonly,
            ast.to.annotations,
            ast.to.defaultValue,
          ),
          ast.decode,
          ast.encode,
        ),
      );
    }
  }
};

export function makeOptional<
  NER extends S.Struct.Fields | S.PropertySignature.Any,
>(
  t: NER, // TODO: enforce non empty
): {
  [K in keyof NER]: S.PropertySignature<
    "?:",
    S.Schema.Type<NER[K]> | undefined,
    never,
    "?:",
    S.Schema.Encoded<NER[K]> | undefined,
    NER[K] extends S.PropertySignature<any, any, any, any, any, infer Z, any>
      ? Z
      : false,
    S.Schema.Context<NER[K]>
  >;
} {
  return _Struct.keys(t).reduce((prev, cur) => {
    if (S.isSchema(t[cur])) {
      prev[cur] = S.optional(t[cur] as any);
    } else {
      prev[cur] = makeOpt(t[cur] as any);
    }
    return prev;
  }, {} as any);
}

export function makeExactOptional<NER extends S.Struct.Fields>(
  t: NER, // TODO: enforce non empty
): {
  [K in keyof NER]: S.PropertySignature<
    "?:",
    S.Schema.Type<NER[K]>,
    never,
    "?:",
    S.Schema.Encoded<NER[K]>,
    NER[K] extends S.PropertySignature<any, any, any, any, any, infer Z, any>
      ? Z
      : false,
    S.Schema.Context<NER[K]>
  >;
} {
  return _Struct.keys(t).reduce((prev, cur) => {
    if (S.isSchema(t[cur])) {
      prev[cur] = S.optionalWith(t[cur] as any, { exact: true });
    } else {
      prev[cur] = makeOpt(t[cur] as any);
    }
    return prev;
  }, {} as any);
}
