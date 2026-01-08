import { BS } from "@beep/schema";
import type { StringTypes, UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import type * as R from "effect/Record";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";

type Segment<S extends string> = S extends "" ? never : S extends `/${string}` ? never : S;

export interface Instance<R extends StringTypes.NonEmptyString> {
  <S extends StringTypes.NonEmptyString>(segment: Segment<S>): `${R}/${S}`;

  readonly root: R;

  child<S extends StringTypes.NonEmptyString>(child: Segment<S>): Instance<`${R}/${S}`>;
}

export type UrlPathLiteral = `/${string}`;

export type PathValue = UrlPathLiteral | ((...args: UnsafeTypes.UnsafeArray) => PathValue) | PathCollection;

export interface PathCollection {
  readonly [segment: string]: PathValue;
}

export type SafeStringPath<T extends UrlPathLiteral> = BS.URLPath.Branded<T>;

export type SafePathValue<T> = T extends UrlPathLiteral
  ? SafeStringPath<T>
  : T extends (...args: infer A) => infer R
    ? (...args: A) => SafePathValue<R>
    : T extends readonly unknown[]
      ? { readonly [K in keyof T]: SafePathValue<T[K]> }
      : T extends PathCollection
        ? { readonly [K in keyof T]: SafePathValue<T[K]> }
        : never;

export type PathTree = Readonly<Record<StringTypes.NonEmptyString, PathValue>>;

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type LastOf<U> = [U] extends [never]
  ? never
  : UnionToIntersection<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void
    ? L
    : never;

type UnionToTuple<U, Last = LastOf<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, Last>>, Last & string];

type ExtractStringKeys<P> = Extract<keyof P, string>;

type OrderedKeys<P> = UnionToTuple<ExtractStringKeys<P>> extends infer T extends readonly string[] ? T : [];

type QueryValue<P, K extends keyof P> = P[K] extends string ? string : never;

type QueryStringFromKeys<Params, Keys extends readonly (keyof Params & string)[]> = Keys extends readonly [
  infer Head extends keyof Params & string,
  ...infer Tail extends readonly (keyof Params & string)[],
]
  ? Tail extends []
    ? `${Head}=${QueryValue<Params, Head>}`
    : `${Head}=${QueryValue<Params, Head>}&${QueryStringFromKeys<Params, Tail>}`
  : never;

type QueryStringFromParams<Params> = QueryStringFromKeys<
  Params,
  OrderedKeys<Params> extends infer Keys extends readonly (keyof Params & string)[] ? Keys : never
>;

export function createRoot<R extends StringTypes.NonEmptyString>(rootPath: R & `/${string}`): Instance<R> {
  const fn = <S extends StringTypes.NonEmptyString>(segment: Segment<S>): `${R}/${S}` =>
    `${rootPath}/${segment}` as `${R}/${S}`;
  return Object.assign(fn, {
    root: rootPath as R,
    child<S extends StringTypes.NonEmptyString>(child: Segment<S>) {
      return createRoot(`${rootPath}/${child}` as `${R}/${S}` & `/${string}`);
    },
  });
}

const isReadonlyRecord = (input: unknown): input is UnsafeTypes.UnsafeReadonlyRecord =>
  typeof input === "object" && input !== null && !Array.isArray(input);

const formatTrail = (trail: readonly (string | number)[]) =>
  A.isNonEmptyReadonlyArray(trail) ? F.pipe(trail, A.map(String), A.join(".")) : ("(root)" as const);

const ensure = <Value extends PathValue>(
  value: Value,
  trail: readonly (string | number)[] = []
): SafePathValue<Value> => {
  if (Str.isString(value)) {
    try {
      return BS.URLPath.make(value as UrlPathLiteral) as SafePathValue<Value>;
    } catch (error) {
      const prettyTrail = formatTrail(trail);
      throw new Error(`Invalid URL path at ${prettyTrail}: ${(error as Error).message}`);
    }
  }

  if (typeof value === "function") {
    return ((...args: UnsafeTypes.UnsafeArray) =>
      ensure((value as (...args: UnsafeTypes.UnsafeArray) => PathValue)(...args), trail)) as SafePathValue<Value>;
  }

  if (isReadonlyRecord(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Struct.entries(value)) {
      result[key] = ensure(nested, [...trail, key]);
    }
    return result as SafePathValue<Value>;
  }

  const prettyTrail = formatTrail(trail);
  throw new TypeError(`Unsupported path value at ${prettyTrail}: ${String(value)}`);
};

export const collection = <const P extends PathTree>(paths: P): SafePathValue<P> => ensure(paths);

export const dynamicPath =
  <R extends StringTypes.NonEmptyString, Param extends string>(root: R) =>
  (param: Param) =>
    `${root}/${param}` as const;

// const dynamicJoin = <Params extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>>(params: Params) => A.join("&")(params) as ``;

const toQueries = <const Params extends R.ReadonlyRecord<StringTypes.NonEmptyString, StringTypes.NonEmptyString>>(
  params: Params
): QueryStringFromParams<Params> =>
  F.pipe(
    Struct.entries<Params>(params),
    (entries) => {
      if (A.isEmptyReadonlyArray(entries)) {
        throw new Error("Invalid query parameters");
      }
      return entries;
    },
    A.map(([key, value]) => `${key}=${value}` as const),
    A.join("&" as const)
  ) as QueryStringFromParams<Params>;

const toQuery = <const Params extends R.ReadonlyRecord<StringTypes.NonEmptyString, StringTypes.NonEmptyString>>(
  params: Params
): QueryStringFromParams<Params> => toQueries(params);

export const dynamicQueries =
  <R extends StringTypes.NonEmptyString>(root: R) =>
  <const Params extends R.ReadonlyRecord<StringTypes.NonEmptyString, StringTypes.NonEmptyString>>(param: Params) =>
    `${root}?${toQuery(param)}` as const;
