import { Function as Fn } from "effect";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as A from "../Array.ts";

export const PathInput = S.Union([S.String, S.Array(S.String)]);

export type PathInput = typeof PathInput.Type;

const PathLookupSchema = S.TaggedUnion({
  notFound: { found: S.tag(false) },
  found: { found: S.tag(true), value: S.Unknown },
});

export type PathLookup = typeof PathLookupSchema.Type;

const normalizePath = (path: PathInput): ReadonlyArray<string> => (P.isString(path) ? Str.split(path, ".") : path);

export const lookupAtPath = (self: unknown, path: PathInput): PathLookup => {
  const parts = normalizePath(path);
  if (parts.length === 0) {
    return PathLookupSchema.cases.notFound.make({ found: false });
  }

  let current: unknown = self;

  for (const part of parts) {
    if (part.length === 0) {
      return PathLookupSchema.cases.notFound.make({ found: false });
    }

    if (P.isNullish(current)) {
      return PathLookupSchema.cases.notFound.make({ found: false });
    }
    if (P.not(P.isObject)(current) && P.not(A.isArray)(current) && P.not(P.isFunction)(current)) {
      return PathLookupSchema.cases.notFound.make({ found: false });
    }

    const record = Fn.cast<unknown, Record<string, unknown>>(current);
    if (!R.has(record, part)) {
      return PathLookupSchema.cases.notFound.make({ found: false });
    }

    current = record[part];
  }

  return PathLookupSchema.cases.found.make({
    found: true,
    value: current,
  });
};

export const unsafeDotGet = (self: object, path: PathInput): unknown => {
  const lookup = lookupAtPath(self, path);
  return lookup.found ? lookup.value : undefined;
};
