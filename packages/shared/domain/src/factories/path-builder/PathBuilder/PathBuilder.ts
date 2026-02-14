import { BS } from "@beep/schema";
import type { StringTypes, UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import type * as R from "effect/Record";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import type { AppendPath, PathInstance, PathTree, PathValue, SafePathValue, Segment, UrlPathLiteral } from "../types";

// -- Segment validation -------------------------------------------------------

const ensureSegment = (segment: string): void => {
  if (Str.isEmpty(segment)) {
    throw new Error("Path segment must not be empty");
  }
  if (Str.startsWith("/")(segment)) {
    throw new Error(`Path segment must not start with "/": ${segment}`);
  }
  if (Str.endsWith("/")(segment)) {
    throw new Error(`Path segment must not end with "/": ${segment}`);
  }
  if (Str.includes("/")(segment)) {
    throw new Error(`Path segment must not contain "/": ${segment}`);
  }
};

// -- make factory -------------------------------------------------------------

const appendSegment = <Root extends `/${string}`>(root: Root, segment: string): `/${string}` =>
  (Eq.equals(root)("/") ? `/${segment}` : `${root}/${segment}`) as `/${string}`;

export const make = <const Root extends `/${string}`>(rootPath: Root): PathInstance<Root> => {
  const fn = (
    stringsOrSegment: TemplateStringsArray | readonly [string] | string,
    ...values: ReadonlyArray<unknown>
  ): UrlPathLiteral => {
    // Direct function call: auth("sign-in")
    if (Str.isString(stringsOrSegment)) {
      ensureSegment(stringsOrSegment);
      return appendSegment(rootPath, stringsOrSegment) as UrlPathLiteral;
    }
    // Tagged template call: auth`sign-in`
    const strings = stringsOrSegment;
    if (A.length(values as ReadonlyArray<unknown>) > 0) {
      throw new Error("PathBuilder tagged template does not allow interpolations");
    }
    const segment = A.isNonEmptyReadonlyArray(strings) ? A.headNonEmpty(strings) : "";
    ensureSegment(segment);
    return appendSegment(rootPath, segment) as UrlPathLiteral;
  };

  return Object.assign(fn, {
    string: (): Root => rootPath,
    create<const S extends string>(segment: Segment<S>): PathInstance<AppendPath<Root, S> & `/${string}`> {
      ensureSegment(segment);
      return make(appendSegment(rootPath, segment) as AppendPath<Root, S> & `/${string}`);
    },
    dynamic: <P extends string>(param: P): AppendPath<Root, P> & `/${string}` =>
      appendSegment(rootPath, param) as AppendPath<Root, P> & `/${string}`,
    withQuery<const Params extends Record<string, string>>(params: Params): `${Root}?${string}` {
      return `${rootPath}?${toQuery(params as R.ReadonlyRecord<StringTypes.NonEmptyString, StringTypes.NonEmptyString>)}` as `${Root}?${string}`;
    },
  }) as PathInstance<Root>;
};

// -- collection ---------------------------------------------------------------

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

// -- Query helpers ------------------------------------------------------------

type QueryStringFromParams<Params> = import("../types").QueryStringFromParams<Params>;

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
