import {Function as Fn, Match, pipe} from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as A from "../Array.ts";

export const PathInput = S.Union([
  S.String,
  S.Array(S.String)
]);

export type PathInput = typeof PathInput.Type;

const PathLookupSchema = S.TaggedUnion({
  notFound: {found: S.tag(false)},
  found: {
    found: S.tag(true),
    value: S.Unknown
  },
});

export type PathLookup = typeof PathLookupSchema.Type;

const makeNotFound = (): PathLookup => PathLookupSchema.cases.notFound.make({found: false});

const makeFound = (value: unknown): PathLookup =>
  PathLookupSchema.cases.found.make({
    found: true,
    value,
  });

const isRecordLookupTarget = (input: unknown): input is Record<string, unknown> =>
  P.or(
    P.or(
      P.isObject,
      A.isArray
    ),
    P.isFunction
  )(
    input);

const normalizePath = (path: PathInput): ReadonlyArray<string> =>
  Match.value(path).pipe(
    Match.when(Str.isString, Str.split(".")),
    Match.orElse((parts) => parts)
  );

const toRecordOption = (input: unknown): O.Option<Record<string, unknown>> =>
  Match.value(P.isNullish(input) || !isRecordLookupTarget(input))
    .pipe(
      Match.when(
        true,
        () => O.none()
      ),
      Match.orElse(() => O.some(Fn.cast<unknown, Record<string, unknown>>(input)))
    );

const lookupPart = (
  current: unknown,
  part: string
): O.Option<unknown> =>
  Match.value(part.length === 0)
    .pipe(
      Match.when(
        true,
        () => O.none()
      ),
      Match.orElse(() =>
        pipe(
          toRecordOption(current),
          O.filter((record) => R.has(
            record,
            part
          )),
          O.map((record) => record[part])
        )
      )
    );

export const lookupAtPath = (
  self: unknown,
  path: PathInput
): PathLookup =>
  pipe(
    normalizePath(path),
    A.match({
      onEmpty: makeNotFound,
      onNonEmpty: (parts) => {
        const result = A.reduce(
          parts,
          O.some(self) as O.Option<unknown>,
          (current, part) => O.flatMap(current, (value) => lookupPart(
            value,
            part
          ))
        );

        return O.match(result, {
          onNone: makeNotFound,
          onSome: makeFound,
        });
      },
    })
  );

export const unsafeDotGet = (
  self: object,
  path: PathInput
): unknown => {
  const lookup = lookupAtPath(self, path);

  return Match.value(lookup).pipe(
    Match.when({found: true}, ({value}) => value),
    Match.orElse(() => undefined)
  );
};
