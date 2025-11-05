import { FsUtils } from "@beep/tooling-utils/FsUtils";
import { RepoUtils } from "@beep/tooling-utils/RepoUtils";
import { DomainError } from "@beep/tooling-utils/repo";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { TreeFormatter } from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const CLDR_AVAILABLE_LOCALES_URL =
  "https://raw.githubusercontent.com/unicode-org/cldr-json/c883679ed17a36da8a3ebcc6b3f4994a9277f132/cldr-json/cldr-core/availableLocales.json";

const CLDR_GENERATED_DIR_SEGMENTS = ["tooling", "repo-scripts", "src", "i18n", "_generated"] as const;

const CLDR_GENERATED_FILENAME = "available-locales.ts" as const;

const CLDR_AVAILABLE_LOCALES_SCHEMA = S.Struct({
  availableLocales: S.Struct({
    all: S.optional(S.Array(S.String)),
    full: S.NonEmptyArray(S.String),
  }),
});

const NEWLINE = "\n" as const;

export const fetchAvailableCLDRLocales: Effect.Effect<
  ReadonlyArray<string>,
  DomainError,
  FetchHttpClient.Fetch
> = Effect.gen(function* () {
  const fetch = yield* FetchHttpClient.Fetch;

  const response = yield* Effect.tryPromise({
    try: () => fetch(CLDR_AVAILABLE_LOCALES_URL),
    catch: (cause) =>
      new DomainError({
        message: "Failed to fetch CLDR available locales",
        cause,
      }),
  });

  if (!response.ok) {
    return yield* new DomainError({
      cause: response,
      message: F.pipe(
        "Unexpected response while fetching CLDR available locales (status " as const,
        Str.concat(String(response.status)),
        Str.concat(")")
      ),
    });
  }

  const payload = yield* Effect.tryPromise({
    try: () => response.json() as Promise<unknown>,
    catch: (cause) =>
      new DomainError({
        message: "Failed to decode CLDR available locales response body",
        cause,
      }),
  });

  const parsed = yield* S.decodeUnknown(CLDR_AVAILABLE_LOCALES_SCHEMA)(payload).pipe(
    Effect.mapError(
      (error) =>
        new DomainError({
          message: F.pipe(
            "Received malformed CLDR available locales payload: " as const,
            Str.concat(TreeFormatter.formatErrorSync(error))
          ),
          cause: error,
        })
    )
  );

  return F.pipe(
    parsed.availableLocales.all,
    O.fromNullable,
    O.getOrElse(() => parsed.availableLocales.full)
  );
}).pipe(Effect.mapError(DomainError.selfOrMap));

export const generateLocalesContent: Effect.Effect<
  string,
  DomainError,
  FetchHttpClient.Fetch | FileSystem.FileSystem | Path.Path | FsUtils | RepoUtils
> = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const fsUtils = yield* FsUtils;
  const repo = yield* RepoUtils;

  const locales = yield* fetchAvailableCLDRLocales;
  const sortedLocales = F.pipe(locales, A.sort(Str.Order));

  const outputDir = F.pipe(
    CLDR_GENERATED_DIR_SEGMENTS,
    A.reduce(repo.REPOSITORY_ROOT, (acc, segment) => path.join(acc, segment))
  );

  yield* fsUtils.mkdirCached(outputDir);
  const outputFilePath = path.join(outputDir, CLDR_GENERATED_FILENAME);

  const header = F.pipe("export const ALL_LOCALES = [" as const, Str.concat(NEWLINE));
  const footer = F.pipe("] as const;" as const, Str.concat(NEWLINE));

  const localeLines = F.pipe(
    sortedLocales,
    A.map((locale) => F.pipe('"' as const, Str.concat(locale), Str.concat('"' as const), Str.concat("," as const)))
  );

  const indentedLines = F.pipe(
    localeLines,
    A.map((line) => F.pipe(" " as const, Str.concat(line)))
  );

  const body = F.pipe(indentedLines, A.join(NEWLINE), Str.concat(NEWLINE));

  const content = F.pipe(header, Str.concat(body), Str.concat(footer));

  yield* fs.writeFileString(outputFilePath, content);

  return content;
}).pipe(Effect.mapError(DomainError.selfOrMap));

export const LocaleTerritories = S.Struct({});
