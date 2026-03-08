/**
 * Effect laws allowlist integrity checks.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { findRepoRoot } from "@beep/repo-utils";
import { thunkEmptyReadonlyArray, thunkFalse, thunkSomeEmptyArray } from "@beep/utils";
import { Console, Effect, FileSystem, Path, pipe, Result, SchemaIssue } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { type ParseError, parse } from "jsonc-parser";

const $I = $RepoCliId.create("commands/Laws/AllowlistCheck");

/**
 * Relative path to the effect laws allowlist.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const ALLOWLIST_PATH = "standards/effect-laws.allowlist.jsonc";

const NonEmptyString = S.String.check(
  S.makeFilter((value) => value.length > 0 || "Expected non-empty string.")
).annotate(
  $I.annote("NonEmptyString", {
    description: "Non-empty string value used for effect-laws allowlist fields.",
  })
);

const DateYmdString = S.String.check(
  S.makeFilter((value) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || "Expected YYYY-MM-DD date string format.")
).annotate(
  $I.annote("DateYmdString", {
    description: "Calendar date string in YYYY-MM-DD format for allowlist expiration.",
  })
);

class EffectLawsAllowlistEntry extends S.Class<EffectLawsAllowlistEntry>($I`EffectLawsAllowlistEntry`)(
  {
    rule: NonEmptyString,
    file: NonEmptyString,
    kind: NonEmptyString,
    reason: NonEmptyString,
    owner: NonEmptyString,
    issue: NonEmptyString,
    expiresOn: S.optionalKey(S.UndefinedOr(DateYmdString)),
  },
  $I.annote("EffectLawsAllowlistEntry", {
    description: "Single allowlist entry describing a temporary exception for an Effect law.",
  })
) {}

class EffectLawsAllowlistDocument extends S.Class<EffectLawsAllowlistDocument>($I`EffectLawsAllowlistDocument`)(
  {
    version: S.Literal(1),
    entries: S.Array(EffectLawsAllowlistEntry).pipe(
      S.withConstructorDefault(() => O.some(A.empty<EffectLawsAllowlistEntry>())),
      S.withDecodingDefault(A.empty<EffectLawsAllowlistEntry>)
    ),
  },
  $I.annote("EffectLawsAllowlistDocument", {
    description: "Schema-backed allowlist document for custom Effect law exceptions.",
  })
) {}

const decodeEffectLawsAllowlist = S.decodeUnknownEffect(EffectLawsAllowlistDocument);

/**
 * Runtime options for allowlist integrity checks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class AllowlistCheckOptions extends S.Class<AllowlistCheckOptions>($I`AllowlistCheckOptions`)(
  {
    cwd: NonEmptyString,
  },
  $I.annote("AllowlistCheckOptions", {
    description: "Runtime options for effect laws allowlist integrity checks starting from a workspace directory.",
  })
) {}

/**
 * Result of an allowlist integrity check.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class AllowlistCheckSummary extends S.Class<AllowlistCheckSummary>($I`AllowlistCheckSummary`)(
  {
    ok: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefault(thunkFalse)
    ),
    diagnostics: S.Array(S.String).pipe(
      S.withConstructorDefault(thunkSomeEmptyArray<string>),
      S.withDecodingDefault(thunkEmptyReadonlyArray<string>())
    ),
  },
  $I.annote("AllowlistCheckSummary", {
    description: "Summary of effect laws allowlist integrity diagnostics.",
  })
) {}

const formatSchemaDiagnostics = (issue: SchemaIssue.Issue): ReadonlyArray<string> =>
  pipe(
    SchemaIssue.makeFormatterStandardSchemaV1()(issue).issues,
    A.map((diagnostic) => {
      const pathLabel =
        diagnostic.path === undefined || diagnostic.path.length === 0
          ? "<root>"
          : pipe(
              diagnostic.path,
              A.map((segment) => String(segment)),
              A.join(".")
            );

      return `${pathLabel}: ${diagnostic.message}`;
    })
  );

const parseAllowlistText = (text: string): Result.Result<unknown, ReadonlyArray<string>> => {
  const parseErrors = A.empty<ParseError>();
  const parsed = parse(text, parseErrors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  return A.length(parseErrors) === 0
    ? Result.succeed(parsed)
    : Result.fail(
        pipe(
          parseErrors,
          A.map((parseError) => `parse error at offset ${parseError.offset}`)
        )
      );
};

const validateEntryFiles = Effect.fn(function* (cwd: string, entries: ReadonlyArray<EffectLawsAllowlistEntry>) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  let index = 0;
  let diagnostics = A.empty<string>();

  for (const entry of entries) {
    const absoluteEntryPath = path.resolve(cwd, entry.file);
    const exists = yield* fs.exists(absoluteEntryPath);

    if (!exists) {
      diagnostics = A.append(diagnostics, `entries.${index}.file: Referenced file does not exist: ${entry.file}`);
    }

    index += 1;
  }

  return diagnostics;
});

/**
 * Run the effect laws allowlist integrity check.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const runAllowlistCheck = Effect.fn(function* (options: AllowlistCheckOptions) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot(options.cwd);
  const absolutePath = path.resolve(repoRoot, ALLOWLIST_PATH);

  const exists = yield* fs.exists(absolutePath);
  if (!exists) {
    return new AllowlistCheckSummary({
      ok: false,
      diagnostics: A.make(`missing file: ${ALLOWLIST_PATH}`),
    });
  }

  const text = yield* fs.readFileString(absolutePath);
  const parsedResult = parseAllowlistText(text);

  if (Result.isFailure(parsedResult)) {
    return new AllowlistCheckSummary({
      ok: false,
      diagnostics: parsedResult.failure,
    });
  }

  const decodedResult = yield* decodeEffectLawsAllowlist(parsedResult.success).pipe(
    Effect.map(Result.succeed),
    Effect.catch((error) => Effect.succeed(Result.fail(formatSchemaDiagnostics(error.issue))))
  );

  if (Result.isFailure(decodedResult)) {
    return new AllowlistCheckSummary({
      ok: false,
      diagnostics: decodedResult.failure,
    });
  }

  const diagnostics = yield* validateEntryFiles(repoRoot, decodedResult.success.entries);

  return new AllowlistCheckSummary({
    ok: A.length(diagnostics) === 0,
    diagnostics,
  });
});

/**
 * Print allowlist integrity diagnostics to the console.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const reportAllowlistCheckSummary = Effect.fn(function* (summary: AllowlistCheckSummary) {
  if (summary.ok) {
    yield* Console.log("[laws-allowlist] OK");
    return;
  }

  yield* Console.error(`[laws-allowlist] found ${A.length(summary.diagnostics)} issue(s):`);

  for (const diagnostic of summary.diagnostics) {
    yield* Console.error(`- ${diagnostic}`);
  }
});
