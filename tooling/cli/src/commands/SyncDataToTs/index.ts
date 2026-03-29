/**
 * Sync checked-in official datasets into deterministic TypeScript modules.
 *
 * @module
 * @since 0.0.0
 */

import { findRepoRoot } from "@beep/repo-utils";
import { thunkTrue, thunkUndefined } from "@beep/utils";
import { csvParse } from "d3-dsv";
import { Console, Effect, FileSystem, Match, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import { XmlTextToUnknown } from "../Shared/SchemaCodecs/index.js";
import type { XmlCodecService as XmlCodecServiceType } from "../Shared/SchemaCodecs/XmlCodecs.js";
import {
  type SyncDataRunMode as SyncDataRunModeType,
  type SyncDataTarget,
  SyncDataTargetResult,
  SyncDataToTsDriftError,
  SyncDataToTsError,
} from "./internal/Models.js";
import { syncDataTargets } from "./targets/index.js";

const targetFlag = Flag.string("target").pipe(
  Flag.withAlias("t"),
  Flag.withDescription("Sync a single checked-in target by id"),
  Flag.optional
);

const allFlag = Flag.boolean("all").pipe(Flag.withDescription("Sync every checked-in target"));
const checkFlag = Flag.boolean("check").pipe(
  Flag.withDescription("Report drift without writing files and exit non-zero when changes are needed")
);
const dryRunFlag = Flag.boolean("dry-run").pipe(Flag.withDescription("Preview file updates without writing them"));
const verboseFlag = Flag.boolean("verbose").pipe(
  Flag.withAlias("v"),
  Flag.withDescription("Log unchanged targets in addition to changed targets")
);

const decodeJsonText = S.decodeUnknownEffect(S.UnknownFromJsonString);
const decodeXmlText = S.decodeUnknownEffect(XmlTextToUnknown);

const resolveRunMode = (check: boolean, dryRun: boolean): Effect.Effect<SyncDataRunModeType, SyncDataToTsError> =>
  check && dryRun
    ? Effect.fail(
        new SyncDataToTsError({
          message: "The --check and --dry-run flags are mutually exclusive.",
        })
      )
    : check
      ? Effect.succeed("check")
      : dryRun
        ? Effect.succeed("dry-run")
        : Effect.succeed("write");

const resolveTargets = (
  targetId: O.Option<string>,
  all: boolean
): Effect.Effect<ReadonlyArray<SyncDataTarget>, SyncDataToTsError> => {
  if (all && O.isSome(targetId)) {
    return Effect.fail(
      new SyncDataToTsError({
        message: "Pass either --all or --target, but not both.",
      })
    );
  }

  if (all) {
    return Effect.succeed(syncDataTargets);
  }

  if (O.isNone(targetId)) {
    return Effect.fail(
      new SyncDataToTsError({
        message: "Select at least one target with --target <id> or pass --all.",
      })
    );
  }

  const target = pipe(
    syncDataTargets,
    A.findFirst((candidate) => candidate.id === targetId.value)
  );

  if (O.isSome(target)) {
    return Effect.succeed(A.make(target.value));
  }

  return Effect.fail(
    new SyncDataToTsError({
      message: `Unknown sync target "${targetId.value}". Available targets: ${pipe(
        syncDataTargets,
        A.map((candidate) => candidate.id),
        A.join(", ")
      )}`,
      targetId: targetId.value,
    })
  );
};

const fetchSourceText = (target: SyncDataTarget): Effect.Effect<string, SyncDataToTsError, HttpClient.HttpClient> =>
  Effect.gen(function* () {
    const response = yield* HttpClient.get(target.sourceUrl).pipe(
      Effect.mapError(
        (cause) =>
          new SyncDataToTsError({
            message: `Failed to fetch ${target.sourceUrl}: ${cause.message}`,
            targetId: target.id,
          })
      ),
      Effect.flatMap(HttpClientResponse.filterStatusOk),
      Effect.mapError(
        (cause) =>
          new SyncDataToTsError({
            message: `Received a non-2xx response from ${target.sourceUrl}: ${cause.message}`,
            targetId: target.id,
          })
      )
    );

    return yield* response.text.pipe(
      Effect.mapError(
        (cause) =>
          new SyncDataToTsError({
            message: `Failed to read response body from ${target.sourceUrl}: ${cause.message}`,
            targetId: target.id,
          })
      )
    );
  });

const parseCsvText = (content: string, target: SyncDataTarget): Effect.Effect<unknown, SyncDataToTsError> =>
  Effect.try({
    try: () => csvParse(content),
    catch: (cause) =>
      new SyncDataToTsError({
        message: `Failed to parse CSV payload for ${target.id}.`,
        targetId: target.id,
        cause,
      }),
  });

const parseSourceText = (
  content: string,
  target: SyncDataTarget
): Effect.Effect<unknown, SyncDataToTsError, XmlCodecServiceType> =>
  Match.value(target.format).pipe(
    Match.when("json", () =>
      decodeJsonText(content).pipe(
        Effect.mapError(
          (cause) =>
            new SyncDataToTsError({
              message: `Failed to parse JSON payload for ${target.id}: ${cause.message}`,
              targetId: target.id,
              cause,
            })
        )
      )
    ),
    Match.when("csv", () => parseCsvText(content, target)),
    Match.when("xml", () =>
      decodeXmlText(content).pipe(
        Effect.mapError(
          (cause) =>
            new SyncDataToTsError({
              message: `Failed to parse XML payload for ${target.id}: ${cause.message}`,
              targetId: target.id,
            })
        )
      )
    ),
    Match.exhaustive
  );

const readExistingFile = (
  absolutePath: string,
  target: SyncDataTarget
): Effect.Effect<O.Option<string>, SyncDataToTsError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(absolutePath).pipe(
      Effect.mapError(
        () =>
          new SyncDataToTsError({
            message: `Failed to check whether ${absolutePath} exists.`,
            targetId: target.id,
            file: target.outputPath,
          })
      )
    );

    if (!exists) {
      return O.none();
    }

    return yield* fs.readFileString(absolutePath).pipe(
      Effect.map(O.some),
      Effect.mapError(
        () =>
          new SyncDataToTsError({
            message: `Failed to read ${absolutePath}.`,
            targetId: target.id,
            file: target.outputPath,
          })
      )
    );
  });

const writeProjectedFile = (
  absolutePath: string,
  content: string,
  target: SyncDataTarget
): Effect.Effect<void, SyncDataToTsError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    yield* fs.makeDirectory(path.dirname(absolutePath), { recursive: true }).pipe(
      Effect.mapError(
        () =>
          new SyncDataToTsError({
            message: `Failed to create parent directory for ${absolutePath}.`,
            targetId: target.id,
            file: target.outputPath,
          })
      )
    );
    yield* fs.writeFileString(absolutePath, content).pipe(
      Effect.mapError(
        () =>
          new SyncDataToTsError({
            message: `Failed to write ${absolutePath}.`,
            targetId: target.id,
            file: target.outputPath,
          })
      )
    );
  });

const syncTarget = (
  repoRoot: string,
  mode: SyncDataRunModeType,
  target: SyncDataTarget
): Effect.Effect<
  SyncDataTargetResult,
  SyncDataToTsError,
  FileSystem.FileSystem | HttpClient.HttpClient | Path.Path | XmlCodecServiceType
> =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const sourceText = yield* fetchSourceText(target);
    const parsed = yield* parseSourceText(sourceText, target);
    const projection = yield* target.project(parsed);
    const absoluteOutputPath = path.resolve(repoRoot, target.outputPath);
    const existing = yield* readExistingFile(absoluteOutputPath, target);
    const changed = pipe(
      existing,
      O.match({
        onNone: thunkTrue,
        onSome: (current) => current !== projection.content,
      })
    );

    if (changed && mode === "write") {
      yield* writeProjectedFile(absoluteOutputPath, projection.content, target);
    }

    return new SyncDataTargetResult({
      targetId: target.id,
      outputPath: target.outputPath,
      changed,
      recordCount: projection.recordCount,
      summary: projection.summary,
      sourceUrl: target.sourceUrl,
    });
  });

const reportTargetResult = Effect.fn("SyncDataToTs.reportTargetResult")(function* (
  result: SyncDataTargetResult,
  mode: SyncDataRunModeType,
  verbose: boolean
) {
  const maybeMessage = Match.value(mode).pipe(
    Match.when("write", () =>
      result.changed
        ? O.some(`sync-data-to-ts: updated ${result.targetId} -> ${result.outputPath} (${result.summary})`)
        : verbose
          ? O.some(`sync-data-to-ts: up to date ${result.targetId} -> ${result.outputPath}`)
          : O.none()
    ),
    Match.when("dry-run", () =>
      result.changed
        ? O.some(`sync-data-to-ts: would update ${result.targetId} -> ${result.outputPath} (${result.summary})`)
        : verbose
          ? O.some(`sync-data-to-ts: up to date ${result.targetId} -> ${result.outputPath}`)
          : O.none()
    ),
    Match.when("check", () =>
      result.changed
        ? O.some(`sync-data-to-ts: drift detected for ${result.targetId} -> ${result.outputPath}`)
        : verbose
          ? O.some(`sync-data-to-ts: up to date ${result.targetId} -> ${result.outputPath}`)
          : O.none()
    ),
    Match.exhaustive
  );

  if (O.isSome(maybeMessage)) {
    yield* Console.log(maybeMessage.value);
  }
});

const reportSummary = Effect.fn("SyncDataToTs.reportSummary")(function* (
  results: ReadonlyArray<SyncDataTargetResult>,
  mode: SyncDataRunModeType
) {
  const changedCount = pipe(
    results,
    A.filter((result) => result.changed),
    A.length
  );

  const totalCount = A.length(results);

  yield* Console.log(
    Match.value(mode).pipe(
      Match.when("write", () => `sync-data-to-ts: wrote ${changedCount} of ${totalCount} target(s)`),
      Match.when("dry-run", () => `sync-data-to-ts: ${changedCount} of ${totalCount} target(s) would change`),
      Match.when("check", () => `sync-data-to-ts: ${changedCount} of ${totalCount} target(s) have drift`),
      Match.exhaustive
    )
  );
});

const failOnCheckDrift = (results: ReadonlyArray<SyncDataTargetResult>, mode: SyncDataRunModeType) => {
  if (mode !== "check") {
    return Effect.void;
  }

  const changedTargets = pipe(
    results,
    A.filter((result) => result.changed)
  );

  return A.match(changedTargets, {
    onEmpty: () => Effect.void,
    onNonEmpty: (nonEmptyTargets) =>
      Effect.fail(
        new SyncDataToTsDriftError({
          driftCount: A.length(nonEmptyTargets),
          message: `Detected drift in ${A.length(nonEmptyTargets)} target(s): ${pipe(
            nonEmptyTargets,
            A.map((result) => result.targetId),
            A.join(", ")
          )}. Run "bun run beep sync-data-to-ts --all" to refresh generated files.`,
        })
      ),
  });
};

/**
 * CLI command for syncing official upstream datasets into checked-in TypeScript modules.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const syncDataToTsCommand = Command.make(
  "sync-data-to-ts",
  {
    target: targetFlag,
    all: allFlag,
    check: checkFlag,
    dryRun: dryRunFlag,
    verbose: verboseFlag,
  },
  ({ target, all, check, dryRun, verbose }) =>
    Effect.gen(function* () {
      const repoRoot = yield* findRepoRoot();
      const mode = yield* resolveRunMode(check, dryRun);
      const targets = yield* resolveTargets(target, all);
      const results = yield* Effect.forEach(targets, (currentTarget) => syncTarget(repoRoot, mode, currentTarget), {
        concurrency: 1,
      });

      yield* Effect.forEach(results, (result) => reportTargetResult(result, mode, verbose), {
        discard: true,
      });
      yield* reportSummary(results, mode);
      yield* failOnCheckDrift(results, mode);
    }).pipe(
      Effect.catchTag(
        "SyncDataToTsDriftError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`sync-data-to-ts: ${error.message}`);
        })
      ),
      Effect.catchTag(
        "SyncDataToTsError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          const contextParts = A.make(
            pipe(
              O.fromNullishOr(error.targetId),
              O.match({
                onNone: thunkUndefined,
                onSome: (value) => `target=${value}`,
              })
            ),
            pipe(
              O.fromNullishOr(error.file),
              O.match({
                onNone: thunkUndefined,
                onSome: (value) => `file=${value}`,
              })
            )
          );
          const context = pipe(
            contextParts,
            A.filter((value): value is string => value !== undefined),
            A.join(", ")
          );
          yield* Console.error(
            context.length > 0 ? `sync-data-to-ts: ${error.message} (${context})` : `sync-data-to-ts: ${error.message}`
          );
        })
      ),
      Effect.catchTag(
        "NoSuchFileError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`sync-data-to-ts: ${error.message}`);
        })
      )
    )
).pipe(Command.withDescription("Sync official upstream datasets into checked-in TypeScript modules"));
