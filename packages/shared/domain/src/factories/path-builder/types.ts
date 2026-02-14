import type { BS } from "@beep/schema";
import type { StringTypes, UnsafeTypes } from "@beep/types";

export type Segment<S extends string> = S extends ""
  ? never
  : S extends `/${string}`
    ? never
    : S extends `${string}/${string}`
      ? never
      : S;

export type AppendPath<R extends `/${string}`, S extends string> = R extends "/" ? `/${S}` : `${R}/${S}`;

export interface PathInstance<R extends `/${string}`> {
  // Direct function call — full literal preservation: auth("sign-in") → "/auth/sign-in"
  <const S extends string>(segment: Segment<S>): AppendPath<R, S> & `/${string}`;
  // Tagged template with tuple — literal preservation: auth(["sign-in"]) → "/auth/sign-in"
  <const S extends string>(strings: readonly [S]): AppendPath<R, S> & `/${string}`;
  // Tagged template — preserves root prefix: auth`sign-in` → "/auth/${string}"
  (strings: TemplateStringsArray, ...values: ReadonlyArray<unknown>): `${R}/${string}` & `/${string}`;

  string(): R;
  create<const S extends string>(segment: Segment<S>): PathInstance<AppendPath<R, S> & `/${string}`>;
  dynamic: <P extends string>(param: P) => AppendPath<R, P> & `/${string}`;
  withQuery<const Params extends Record<string, string>>(params: Params): `${R}?${string}`;
}

export type UrlPathLiteral = `/${string}`;

export type PathValue = UrlPathLiteral | ((...args: UnsafeTypes.UnsafeArray) => PathValue) | PathCollection;

interface PathCollection {
  readonly [segment: string]: PathValue;
}

type SafeStringPath<T extends UrlPathLiteral> = BS.URLPath.Branded<T>;

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

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

export type LastOf<U> = [U] extends [never]
  ? never
  : UnionToIntersection<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void
    ? L
    : never;

export type UnionToTuple<U, Last = LastOf<U>> = [U] extends [never]
  ? []
  : [...UnionToTuple<Exclude<U, Last>>, Last & string];

export type ExtractStringKeys<P> = Extract<keyof P, string>;

export type OrderedKeys<P> = UnionToTuple<ExtractStringKeys<P>> extends infer T extends readonly string[] ? T : [];

export type QueryValue<P, K extends keyof P> = P[K] extends string ? string : never;

export type QueryStringFromKeys<Params, Keys extends readonly (keyof Params & string)[]> = Keys extends readonly [
  infer Head extends keyof Params & string,
  ...infer Tail extends readonly (keyof Params & string)[],
]
  ? Tail extends []
    ? `${Head}=${QueryValue<Params, Head>}`
    : `${Head}=${QueryValue<Params, Head>}&${QueryStringFromKeys<Params, Tail>}`
  : never;

export type QueryStringFromParams<Params> = QueryStringFromKeys<
  Params,
  OrderedKeys<Params> extends infer Keys extends readonly (keyof Params & string)[] ? Keys : never
>;
