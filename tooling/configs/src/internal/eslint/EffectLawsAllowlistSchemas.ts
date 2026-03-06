import { thunkSomeEmptyArray, thunkSomeNone } from "@beep/utils";
import { Effect, Inspectable, pipe, SchemaIssue, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { type ParseError, parse, printParseErrorCode } from "jsonc-parser";
import { normalizePath, PosixPath } from "../../eslint/Shared.ts";

export const ALLOWLIST_PATH = "standards/effect-laws.allowlist.jsonc";
const DATE_YMD_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

const NonEmptyString = S.NonEmptyString;
const DateYmdString = S.String.check(S.isPattern(DATE_YMD_PATTERN));
const ArrayOfStrings = S.Array(S.String);
export class EffectLawsAllowlistEntry extends S.Class<EffectLawsAllowlistEntry>("EffectLawsAllowlistEntry")({
  rule: NonEmptyString,
  file: NonEmptyString,
  kind: NonEmptyString,
  reason: NonEmptyString,
  owner: NonEmptyString,
  issue: NonEmptyString,
  expiresOn: S.OptionFromOptionalKey(DateYmdString).pipe(S.withConstructorDefault(thunkSomeNone<string>)),
}) {}

export class EffectLawsAllowlistDocument extends S.Class<EffectLawsAllowlistDocument>("EffectLawsAllowlistDocument")({
  version: S.Literal(1),
  entries: S.Array(EffectLawsAllowlistEntry).pipe(
    S.withConstructorDefault(thunkSomeEmptyArray<EffectLawsAllowlistEntry>),
    S.withDecodingDefault(A.empty<(typeof EffectLawsAllowlistEntry)["Encoded"]>)
  ),
}) {}

export class EffectLawsAllowlistSnapshot extends S.Class<EffectLawsAllowlistSnapshot>("EffectLawsAllowlistSnapshot")({
  path: PosixPath,
  entries: S.Array(EffectLawsAllowlistEntry).pipe(
    S.withConstructorDefault(thunkSomeEmptyArray<EffectLawsAllowlistEntry>),
    S.withDecodingDefault(A.empty<(typeof EffectLawsAllowlistEntry)["Encoded"]>)
  ),
  diagnostics: ArrayOfStrings.pipe(
    S.withConstructorDefault(thunkSomeEmptyArray<string>),
    S.withDecodingDefault(A.empty<string>)
  ),
}) {}

export class EffectLawsAllowlistCheckInput extends S.Class<EffectLawsAllowlistCheckInput>(
  "EffectLawsAllowlistCheckInput"
)({
  ruleId: NonEmptyString,
  filePath: NonEmptyString,
  kind: NonEmptyString,
}) {}

export class EffectLawsAllowlistLookupKey extends S.Class<EffectLawsAllowlistLookupKey>("EffectLawsAllowlistLookupKey")(
  {
    rule: NonEmptyString,
    file: PosixPath,
    kind: NonEmptyString,
  }
) {}

const toInvalidValueIssue = (actual: unknown, message: string): SchemaIssue.Issue =>
  new SchemaIssue.InvalidValue(O.some(actual), { message });

const encodeUnsupported =
  (transformationName: string) =>
  (value: unknown): Effect.Effect<string, SchemaIssue.Issue> =>
    Effect.fail(toInvalidValueIssue(value, `Encoding unknown values is not supported by ${transformationName}.`));

const parseAllowlistJsonc = (content: string): Effect.Effect<unknown, SchemaIssue.Issue> => {
  const parseErrors = A.empty<ParseError>();
  const parsed = parse(content, parseErrors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  return A.match(parseErrors, {
    onEmpty: () => Effect.succeed(parsed),
    onNonEmpty: (errors) =>
      Effect.fail(
        toInvalidValueIssue(
          content,
          pipe(
            errors,
            A.map((error) => `${printParseErrorCode(error.error)}@${error.offset}:${error.length}`),
            A.join(", "),
            (details) => `Allowlist JSONC parse error (${details}).`
          )
        )
      ),
  });
};

export const AllowlistJsoncTextToUnknown = S.String.pipe(
  S.decodeTo(
    S.Unknown,
    SchemaTransformation.transformOrFail({
      decode: parseAllowlistJsonc,
      encode: encodeUnsupported("AllowlistJsoncTextToUnknown"),
    })
  )
);

export const decodeAllowlistDocumentFromJsoncText = S.decodeUnknownEffect(
  AllowlistJsoncTextToUnknown.pipe(S.decodeTo(EffectLawsAllowlistDocument))
);

export const decodeAllowlistCheckInput = S.decodeUnknownOption(EffectLawsAllowlistCheckInput);
export const decodeAllowlistSnapshot = S.decodeUnknownSync(EffectLawsAllowlistSnapshot);
export const encodeAllowlistSnapshot = S.encodeUnknownSync(EffectLawsAllowlistSnapshot);
export const areLookupKeysEquivalent = S.toEquivalence(EffectLawsAllowlistLookupKey);

export const normalizeAllowlistEntries = (
  entries: ReadonlyArray<EffectLawsAllowlistEntry>
): ReadonlyArray<EffectLawsAllowlistEntry> =>
  pipe(
    entries,
    A.map(
      (entry) =>
        new EffectLawsAllowlistEntry({
          ...entry,
          file: normalizePath(entry.file),
        })
    )
  );

export const formatSchemaDiagnostics = (issue: SchemaIssue.Issue): ReadonlyArray<string> => {
  const formatter = SchemaIssue.makeFormatterStandardSchemaV1();
  return pipe(
    formatter(issue).issues,
    A.map((diagnostic) => {
      const pathLabel = pipe(
        O.fromNullishOr(diagnostic.path),
        O.filter(A.isReadonlyArrayNonEmpty),
        O.map((pathSegments) =>
          pipe(
            pathSegments,
            A.map((segment) => Inspectable.toStringUnknown(segment, 0)),
            A.join(".")
          )
        ),
        O.getOrElse(() => "<root>")
      );
      return `${pathLabel}: ${diagnostic.message}`;
    })
  );
};

export const toSnapshotDecodeDiagnostics = (cause: unknown): ReadonlyArray<string> =>
  pipe(
    O.fromNullishOr(cause),
    O.filter(S.isSchemaError),
    O.map((value) => formatSchemaDiagnostics(value.issue)),
    O.getOrElse(() => A.make(`Invalid allowlist snapshot payload: ${Inspectable.toStringUnknown(cause, 0)}`))
  );
