export * from "effect/Schema";

import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as SchemaGetter from "effect/SchemaGetter";
import * as SchemaIssue from "effect/SchemaIssue";
import type * as AST from "effect/SchemaAST";

type LegacyAnnotations = Omit<S.Annotations.Filter, "message"> & {
  readonly message?: string | (() => string) | undefined;
};

type LegacyFilterIssue = {
  readonly path: ReadonlyArray<PropertyKey>;
  readonly message: string;
};

type CompatFilterIssue = S.FilterIssue | LegacyFilterIssue;

type CompatFilterOutput = undefined | boolean | CompatFilterIssue | ReadonlyArray<CompatFilterIssue>;

type Either<E, A> = { readonly _tag: "Left"; readonly left: E } | { readonly _tag: "Right"; readonly right: A };

const normalizeAnnotations = (annotations?: LegacyAnnotations | undefined): S.Annotations.Filter | undefined => {
  if (annotations === undefined) {
    return undefined;
  }
  const message = annotations.message;
  if (typeof message === "function") {
    return { ...annotations, message: message() };
  }
  return annotations as S.Annotations.Filter;
};

const isLegacyFilterIssue = (entry: CompatFilterIssue): entry is LegacyFilterIssue =>
  typeof entry === "object" && entry !== null && !SchemaIssue.isIssue(entry) && "message" in entry;

const normalizeFilterIssue = (entry: CompatFilterIssue): S.FilterIssue =>
  isLegacyFilterIssue(entry) ? { path: entry.path, issue: entry.message } : entry;

const isFilterIssueArray = (output: CompatFilterOutput): output is ReadonlyArray<CompatFilterIssue> =>
  Array.isArray(output);

const normalizeFilterOutput = (output: CompatFilterOutput): S.FilterOutput =>
  Match.value(output).pipe(
    Match.when(isFilterIssueArray, (issues) => A.map(issues, normalizeFilterIssue)),
    Match.when(P.isUndefined, (value) => value),
    Match.when(P.isBoolean, (value) => value),
    Match.orElse((issue) => normalizeFilterIssue(issue))
  );

const makeFilterIssue = (input: unknown, entry: CompatFilterIssue): SchemaIssue.Issue => {
  const normalizedEntry = normalizeFilterIssue(entry);
  if (typeof normalizedEntry === "string") {
    return new SchemaIssue.InvalidValue(O.some(input), { message: normalizedEntry });
  }
  if (SchemaIssue.isIssue(normalizedEntry)) {
    return normalizedEntry;
  }
  const inner =
    typeof normalizedEntry.issue === "string"
      ? new SchemaIssue.InvalidValue(O.some(input), { message: normalizedEntry.issue })
      : normalizedEntry.issue;
  return new SchemaIssue.Pointer(normalizedEntry.path, inner);
};

const makeFilterOutputIssue = (
  input: unknown,
  ast: AST.AST,
  output: CompatFilterOutput
): SchemaIssue.Issue | undefined => {
  if (output === undefined) {
    return undefined;
  }
  if (typeof output === "boolean") {
    return output ? undefined : new SchemaIssue.InvalidValue(O.some(input));
  }
  if (isFilterIssueArray(output)) {
    if (output.length === 0) {
      return undefined;
    }
    const issues = output.map((entry) => makeFilterIssue(input, entry));
    const first = issues[0];
    if (first === undefined) {
      return undefined;
    }
    return issues.length === 1 ? first : new SchemaIssue.Composite(ast, O.some(input), [first, ...issues.slice(1)]);
  }
  return makeFilterIssue(input, output);
};

export const minLength =
  (length: number, annotations?: LegacyAnnotations | undefined) =>
  <Schema extends S.Top>(schema: Schema): Schema =>
    schema.check(S.isMinLength(length, normalizeAnnotations(annotations)) as never) as Schema;

export const pattern =
  (regex: RegExp, annotations?: LegacyAnnotations | undefined) =>
  <Schema extends S.Top>(schema: Schema): Schema =>
    schema.check(S.isPattern(regex, normalizeAnnotations(annotations)) as never) as Schema;

export const filter =
  <Source extends S.Top>(predicate: (value: S.Schema.Type<Source>) => CompatFilterOutput) =>
  (schema: Source): Source =>
    schema.check(S.makeFilter((value) => normalizeFilterOutput(predicate(value as S.Schema.Type<Source>)))) as Source;

export const filterEffect =
  <Source extends S.Top, R>(predicate: (value: S.Schema.Type<Source>) => Effect.Effect<CompatFilterOutput, never, R>) =>
  (schema: Source): Source =>
    schema.pipe(
      S.decode({
        decode: SchemaGetter.transformOrFail((value) =>
          predicate(value as S.Schema.Type<Source>).pipe(
            Effect.flatMap((output) => {
              const issue = makeFilterOutputIssue(value, schema.ast, output);
              return issue === undefined ? Effect.succeed(value) : Effect.fail(issue);
            })
          )
        ),
        encode: SchemaGetter.passthrough(),
      })
    ) as unknown as Source;

export function Union<const Members extends ReadonlyArray<S.Top>>(members: Members): S.Union<Members>;
export function Union<const Members extends ReadonlyArray<S.Top>>(...members: Members): S.Union<Members>;
export function Union(...args: ReadonlyArray<S.Top | ReadonlyArray<S.Top>>): S.Union<ReadonlyArray<S.Top>> {
  const members = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  return S.Union(members as ReadonlyArray<S.Top>);
}

export const decodeUnknownResult =
  <Schema extends S.Decoder<unknown>>(schema: Schema, options?: AST.ParseOptions) =>
  (input: unknown, parseOptions?: AST.ParseOptions): Result.Result<S.Schema.Type<Schema>, S.SchemaError> => {
    const result = S.decodeUnknownResult(schema, options)(input, parseOptions);
    return Result.isSuccess(result)
      ? Result.succeed(result.success as S.Schema.Type<Schema>)
      : Result.fail(result.failure);
  };

export const decodeUnknownEither =
  <Schema extends S.Decoder<unknown>>(schema: Schema, options?: AST.ParseOptions) =>
  (input: unknown, parseOptions?: AST.ParseOptions): Either<S.SchemaError, S.Schema.Type<Schema>> => {
    const exit = S.decodeUnknownExit(schema, options)(input, parseOptions);
    if (Exit.isSuccess(exit)) {
      return { _tag: "Right", right: exit.value as S.Schema.Type<Schema> };
    }
    const error = Cause.findErrorOption(exit.cause);
    return { _tag: "Left", left: O.getOrThrow(error) };
  };

export const decodeUnknown = S.decodeUnknownEffect;
