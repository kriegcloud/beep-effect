/**
 * Sync checked-in official datasets into deterministic TypeScript modules.
 *
 * @module
 * @since 0.0.0
 */

import { findRepoRoot } from "@beep/repo-utils";
import { CSV } from "@beep/schema";
import { parseCsvRows } from "@beep/schema/csv/parse/CsvParser";
import { ParserOptions } from "@beep/schema/csv/parse/ParserOptions";
import { XmlTextToUnknown } from "@beep/schema/Xml";
import { P, Struct, thunkEffectVoid, thunkTrue } from "@beep/utils";
import { cast } from "@beep/utils/Function";
import { Console, Effect, FileSystem, flow, Match, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import {
  SyncDataRunMode,
  type SyncDataRunMode as SyncDataRunModeType,
  SyncDataSourceFormat,
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
const defaultCsvParserOptions = ParserOptions.new();

type ParsedCsvRecords = Array<Record<string, string>> & {
  readonly columns: ReadonlyArray<string>;
};

type SyncDataRunModeFlags = readonly [check: boolean, dryRun: boolean];
type SyncDataTargetSelection = {
  readonly targetId: O.Option<string>;
  readonly all: boolean;
};

const attachCsvColumns = (
  rows: ReadonlyArray<Record<string, string>>,
  columns: ReadonlyArray<string>
): ParsedCsvRecords => {
  const records = A.fromIterable(rows);

  Reflect.defineProperty(records, "columns", {
    configurable: true,
    enumerable: true,
    value: columns,
    writable: false,
  });

  return cast<Array<Record<string, string>>, ParsedCsvRecords>(records);
};

const makeRunModeFlags = (check: boolean, dryRun: boolean): SyncDataRunModeFlags => [check, dryRun];

const isRunModeFlagConflict = P.Tuple([P.isTruthy, P.isTruthy]);

const runModeFlag = <Mode extends SyncDataRunModeType>(mode: Mode) => flow(O.liftPredicate(P.isTruthy), O.as(mode));

const resolveEnabledRunMode = ([check, dryRun]: SyncDataRunModeFlags): SyncDataRunModeType =>
  pipe(
    [pipe(check, runModeFlag("check")), pipe(dryRun, runModeFlag("dry-run"))] satisfies ReadonlyArray<
      O.Option<SyncDataRunModeType>
    >,
    O.firstSomeOf,
    O.getOrElse((): SyncDataRunModeType => "write")
  );

const runModeFlagConflictError = () =>
  new SyncDataToTsError({
    message: "The --check and --dry-run flags are mutually exclusive.",
  });

const resolveRunModeFlags: (flags: SyncDataRunModeFlags) => Effect.Effect<SyncDataRunModeType, SyncDataToTsError> =
  Match.type<SyncDataRunModeFlags>().pipe(
    Match.when(isRunModeFlagConflict, () => Effect.fail(runModeFlagConflictError())),
    Match.orElse((flags) => Effect.succeed(resolveEnabledRunMode(flags)))
  );

const resolveRunMode = (check: boolean, dryRun: boolean): Effect.Effect<SyncDataRunModeType, SyncDataToTsError> =>
  resolveRunModeFlags(makeRunModeFlags(check, dryRun));

const targetSelectionConflictError = () =>
  new SyncDataToTsError({
    message: "Pass either --all or --target, but not both.",
  });

const targetSelectionRequiredError = () =>
  new SyncDataToTsError({
    message: "Select at least one target with --target <id> or pass --all.",
  });

const unknownTargetError = (targetId: string) =>
  new SyncDataToTsError({
    message: `Unknown sync target "${targetId}". Available targets: ${pipe(
      syncDataTargets,
      A.map((candidate) => candidate.id),
      A.join(", ")
    )}`,
    targetId,
  });

const resolveTargetById = (targetId: string): Effect.Effect<ReadonlyArray<SyncDataTarget>, SyncDataToTsError> =>
  pipe(
    syncDataTargets,
    A.findFirst((candidate) => candidate.id === targetId),
    O.map(A.of),
    Effect.fromOption,
    Effect.mapError(() => unknownTargetError(targetId))
  );

const resolveSelectedTarget = (targetId: O.Option<string>) =>
  pipe(
    targetId,
    O.map(resolveTargetById),
    O.getOrElse(() => Effect.fail(targetSelectionRequiredError()))
  );

const resolveTargetSelection: (
  selection: SyncDataTargetSelection
) => Effect.Effect<ReadonlyArray<SyncDataTarget>, SyncDataToTsError> = Match.type<SyncDataTargetSelection>().pipe(
  Match.when(
    ({ all, targetId }) => all && O.isSome(targetId),
    () => Effect.fail(targetSelectionConflictError())
  ),
  Match.when(
    ({ all }) => all,
    () => Effect.succeed(syncDataTargets)
  ),
  Match.orElse(({ targetId }) => resolveSelectedTarget(targetId))
);

const resolveTargets = Effect.fnUntraced(function* (
  targetId: O.Option<string>,
  all: boolean
): Effect.fn.Return<ReadonlyArray<SyncDataTarget>, SyncDataToTsError> {
  return yield* resolveTargetSelection({ targetId, all });
});

const fetchSourceText = Effect.fn("fetchSourceText")(function* (
  target: SyncDataTarget
): Effect.fn.Return<string, SyncDataToTsError, HttpClient.HttpClient> {
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

const decodeCsvText = Effect.fn("SyncDataToTs.decodeCsvText")(function* (content: string) {
  const rawRows = yield* parseCsvRows(content, defaultCsvParserOptions);

  return yield* A.match(rawRows, {
    onEmpty: () => Effect.succeed(attachCsvColumns([], [])),
    onNonEmpty: ([headerRow]) => {
      const rowSchema = S.Struct(
        pipe(
          headerRow,
          A.map((header) => [header, S.String] as const),
          R.fromEntries
        )
      );

      return S.decodeUnknownEffect(CSV({})(rowSchema))(content).pipe(
        Effect.map((rows) => attachCsvColumns(rows, headerRow))
      );
    },
  });
});

const parseCsvText = (content: string, target: SyncDataTarget): Effect.Effect<unknown, SyncDataToTsError> =>
  decodeCsvText(content).pipe(
    Effect.mapError(
      (cause) =>
        new SyncDataToTsError({
          message: `Failed to parse CSV payload for ${target.id}: ${cause.message}`,
          targetId: target.id,
          cause,
        })
    )
  );

const parseSourceText = (content: string, target: SyncDataTarget): Effect.Effect<unknown, SyncDataToTsError> =>
  SyncDataSourceFormat.$match(target.format, {
    json: () =>
      decodeJsonText(content).pipe(
        Effect.mapError(
          (cause) =>
            new SyncDataToTsError({
              message: `Failed to parse JSON payload for ${target.id}: ${cause.message}`,
              targetId: target.id,
              cause,
            })
        )
      ),
    csv: () => parseCsvText(content, target),
    xml: () =>
      decodeXmlText(content).pipe(
        Effect.mapError(
          (cause) =>
            new SyncDataToTsError({
              message: `Failed to parse XML payload for ${target.id}: ${cause.message}`,
              targetId: target.id,
            })
        )
      ),
  });

const readExistingFile = Effect.fn(function* (
  absolutePath: string,
  target: SyncDataTarget
): Effect.fn.Return<O.Option<string>, SyncDataToTsError, FileSystem.FileSystem> {
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

  return yield* fs.readFileString(absolutePath).pipe(
    Effect.map(O.some),
    Effect.mapError(
      () =>
        new SyncDataToTsError({
          message: `Failed to read ${absolutePath}.`,
          targetId: target.id,
          file: target.outputPath,
        })
    ),
    Effect.when(Effect.succeed(exists)),
    Effect.map(O.flatten)
  );
});

const writeProjectedFile = Effect.fn("writeProjectedFile")(function* (
  absolutePath: string,
  content: string,
  target: SyncDataTarget
): Effect.fn.Return<void, SyncDataToTsError, FileSystem.FileSystem | Path.Path> {
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

const syncTarget = Effect.fn("syncTarget")(function* (
  repoRoot: string,
  mode: SyncDataRunModeType,
  target: SyncDataTarget
): Effect.fn.Return<
  SyncDataTargetResult,
  SyncDataToTsError,
  FileSystem.FileSystem | HttpClient.HttpClient | Path.Path
> {
  const path = yield* Path.Path;
  const sourceText = yield* fetchSourceText(target);
  const parsed = yield* parseSourceText(sourceText, target);
  const projection = yield* target.project(parsed);
  const absoluteOutputPath = path.resolve(repoRoot, target.outputPath);
  const existing = yield* readExistingFile(absoluteOutputPath, target);
  const changed = pipe(
    existing,
    O.map((current) => current !== projection.content),
    O.getOrElse(thunkTrue)
  );

  yield* writeProjectedFile(absoluteOutputPath, projection.content, target).pipe(
    Effect.when(Effect.succeed(changed && SyncDataRunMode.is.write(mode))),
    Effect.asVoid
  );

  return new SyncDataTargetResult({
    targetId: target.id,
    outputPath: target.outputPath,
    changed,
    recordCount: projection.recordCount,
    summary: projection.summary,
    sourceUrl: target.sourceUrl,
  });
});

const renderChangedTargetMessage = (result: SyncDataTargetResult, mode: SyncDataRunModeType): string =>
  SyncDataRunMode.$match(mode, {
    write: () => `sync-data-to-ts: updated ${result.targetId} -> ${result.outputPath} (${result.summary})`,
    "dry-run": () => `sync-data-to-ts: would update ${result.targetId} -> ${result.outputPath} (${result.summary})`,
    check: () => `sync-data-to-ts: drift detected for ${result.targetId} -> ${result.outputPath}`,
  });

const renderUnchangedTargetMessage = (result: SyncDataTargetResult): string =>
  `sync-data-to-ts: up to date ${result.targetId} -> ${result.outputPath}`;

const targetResultMessage = (mode: SyncDataRunModeType, verbose: boolean) =>
  Match.type<SyncDataTargetResult>().pipe(
    Match.when(
      (result) => result.changed,
      (result) => O.some(renderChangedTargetMessage(result, mode))
    ),
    Match.orElse((result) =>
      pipe(
        O.some(renderUnchangedTargetMessage(result)),
        O.filter(() => verbose)
      )
    )
  );

const reportTargetResult = Effect.fn("SyncDataToTs.reportTargetResult")(function* (
  result: SyncDataTargetResult,
  mode: SyncDataRunModeType,
  verbose: boolean
) {
  yield* pipe(
    targetResultMessage(mode, verbose)(result),
    O.map(Console.log),
    O.getOrElse(() => Effect.void)
  );
});

const renderSummaryMessage = (mode: SyncDataRunModeType, changedCount: number, totalCount: number): string =>
  SyncDataRunMode.$match(mode, {
    write: () => `sync-data-to-ts: wrote ${changedCount} of ${totalCount} target(s)`,
    "dry-run": () => `sync-data-to-ts: ${changedCount} of ${totalCount} target(s) would change`,
    check: () => `sync-data-to-ts: ${changedCount} of ${totalCount} target(s) have drift`,
  });

const reportSummary = Effect.fn("SyncDataToTs.reportSummary")(function* (
  results: ReadonlyArray<SyncDataTargetResult>,
  mode: SyncDataRunModeType
) {
  const changedCount = pipe(results, A.filter(Struct.get("changed")), A.length);

  const totalCount = A.length(results);

  yield* Console.log(renderSummaryMessage(mode, changedCount, totalCount));
});

const failOnChangedTargets = (results: ReadonlyArray<SyncDataTargetResult>) => {
  const changedTargets = pipe(
    results,
    A.filter((result) => result.changed)
  );

  return A.match(changedTargets, {
    onEmpty: thunkEffectVoid,
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

const failOnCheckDrift = (results: ReadonlyArray<SyncDataTargetResult>, mode: SyncDataRunModeType) =>
  failOnChangedTargets(results).pipe(Effect.when(Effect.succeed(SyncDataRunMode.is.check(mode))), Effect.asVoid);

const renderSyncDataErrorContext = (error: SyncDataToTsError): string =>
  pipe(
    A.make(
      pipe(
        O.fromNullishOr(error.targetId),
        O.map((value) => `target=${value}`)
      ),
      pipe(
        O.fromNullishOr(error.file),
        O.map((value) => `file=${value}`)
      )
    ),
    A.getSomes,
    A.join(", ")
  );

const renderSyncDataError = (error: SyncDataToTsError): string =>
  pipe(
    renderSyncDataErrorContext(error),
    O.liftPredicate(Str.isNonEmpty),
    O.map((context) => `sync-data-to-ts: ${error.message} (${context})`),
    O.getOrElse(() => `sync-data-to-ts: ${error.message}`)
  );

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
  Effect.fn(
    function* ({ target, all, check, dryRun, verbose }) {
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
    },
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
        yield* Console.error(renderSyncDataError(error));
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
).pipe(Command.withDescription("Sync official upstream datasets into" + " checked-in TypeScript modules"));
