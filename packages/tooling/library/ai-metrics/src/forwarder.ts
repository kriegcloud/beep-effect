/**
 * Durable local forwarder for repo AI metrics.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoAiMetricsId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Clock, Effect, FileSystem, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { AiMetricsRawArchiveKey, writeEncryptedRawArchiveObject } from "./archive.ts";
import {
  AiMetricsConfigSnapshotInput,
  makeAiMetricsConfigSnapshot,
  writeAiMetricsConfigSnapshotArtifacts,
} from "./config-snapshot.ts";
import {
  AiMetricsDerivedStorageWriteInput,
  AiMetricsDerivedTranscriptRecord,
  writeAiMetricsDerivedStorage,
} from "./derived-storage.ts";
import { summarizeTranscriptText } from "./ingest.ts";
import { AiMetricsInstallInput, makeAiMetricsInstallSpec } from "./install.ts";
import { AiMetricsDeployTarget, AiMetricsTranscriptSource } from "./models.ts";
import { hashPrivateIdentifier, makeAiMetricsPrivacyCheckResult } from "./privacy.ts";

const $I = $RepoAiMetricsId.create("forwarder");
const DEFAULT_MAX_FILES = 200;

/**
 * Error raised by the durable AI metrics forwarder.
 *
 * @example
 * ```ts
 * import { AiMetricsForwarderError } from "@beep/repo-ai-metrics"
 * const error = new AiMetricsForwarderError({
 *   cause: "boom",
 *   message: "Forwarder failed."
 * })
 * void error
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsForwarderError extends TaggedErrorClass<AiMetricsForwarderError>($I`AiMetricsForwarderError`)(
  "AiMetricsForwarderError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AiMetricsForwarderError", {
    description: "Typed failure raised by the durable AI metrics forwarder.",
  })
) {}

/**
 * Input for the durable AI metrics forwarder.
 *
 * @example
 * ```ts
 * import { AiMetricsForwarderInput } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsForwarderInput)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsForwarderInput extends S.Class<AiMetricsForwarderInput>($I`AiMetricsForwarderInput`)(
  {
    claudeProjectsRoot: S.optionalKey(S.String),
    codexSessionsRoot: S.optionalKey(S.String),
    dataRoot: S.optionalKey(S.String),
    hashSalt: S.optionalKey(S.String),
    hashSaltSecretRef: S.optionalKey(S.String),
    homeDir: S.String,
    includeAll: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    maxFiles: S.Number.pipe(
      S.withConstructorDefault(Effect.succeed(DEFAULT_MAX_FILES)),
      S.withDecodingDefaultKey(Effect.succeed(DEFAULT_MAX_FILES))
    ),
    openClawUnitPath: S.optionalKey(S.String),
    rawArchiveKey: AiMetricsRawArchiveKey,
    rawArchiveKeySecretRef: S.optionalKey(S.String),
    repoRoot: S.String,
    sinceEpochMillis: S.optionalKey(S.Number),
    target: AiMetricsDeployTarget.pipe(
      S.withConstructorDefault(Effect.succeed(AiMetricsDeployTarget.Enum.local)),
      S.withDecodingDefaultKey(Effect.succeed(AiMetricsDeployTarget.Enum.local))
    ),
  },
  $I.annote("AiMetricsForwarderInput", {
    description: "Configurable roots, target, and archive key for one durable AI metrics forwarder run.",
  })
) {}

/**
 * Per-source coverage selected by one durable forwarder run.
 *
 * @example
 * ```ts
 * import { AiMetricsForwarderSourceCoverage } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsForwarderSourceCoverage)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsForwarderSourceCoverage extends S.Class<AiMetricsForwarderSourceCoverage>(
  $I`AiMetricsForwarderSourceCoverage`
)(
  {
    candidateFileCount: S.Number,
    includedFileCount: S.Number,
    limitedByMaxFiles: S.Boolean,
    sourceKind: AiMetricsTranscriptSource,
  },
  $I.annote("AiMetricsForwarderSourceCoverage", {
    description: "Source-aware file selection counts used to detect maxFiles starvation.",
  })
) {}

/**
 * Safe result emitted by one durable AI metrics forwarder run.
 *
 * @example
 * ```ts
 * import { AiMetricsForwarderRunResult } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsForwarderRunResult)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsForwarderRunResult extends S.Class<AiMetricsForwarderRunResult>($I`AiMetricsForwarderRunResult`)(
  {
    archiveObjectCount: S.Number,
    configSnapshotId: S.String,
    duckDbPath: S.String,
    ingestRunId: S.String,
    parquetExportDir: S.String,
    parquetTables: S.Array(S.String),
    rawArchiveDir: S.String,
    sourceCoverage: S.Array(AiMetricsForwarderSourceCoverage).pipe(
      S.withConstructorDefault(Effect.succeed([])),
      S.withDecodingDefaultKey(Effect.succeed([]))
    ),
    sourceFileCount: S.Number,
    target: AiMetricsDeployTarget,
    turnCount: S.Number,
  },
  $I.annote("AiMetricsForwarderRunResult", {
    description: "Safe counts and storage paths returned by one durable AI metrics forwarder run.",
  })
) {}

/**
 * Input for rendering a workstation-owned forwarder timer.
 *
 * @example
 * ```ts
 * import { AiMetricsForwarderTimerInput } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsForwarderTimerInput)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsForwarderTimerInput extends S.Class<AiMetricsForwarderTimerInput>(
  $I`AiMetricsForwarderTimerInput`
)(
  {
    command: S.String,
    hashSaltSecretRef: S.optionalKey(S.String),
    intervalMinutes: S.Number.pipe(
      S.withConstructorDefault(Effect.succeed(30)),
      S.withDecodingDefaultKey(Effect.succeed(30))
    ),
    lockPath: S.String,
    rawArchiveKeySecretRef: S.optionalKey(S.String),
    serviceName: S.String.pipe(
      S.withConstructorDefault(Effect.succeed("beep-ai-metrics-forwarder")),
      S.withDecodingDefaultKey(Effect.succeed("beep-ai-metrics-forwarder"))
    ),
    statusPath: S.String,
    workingDirectory: S.String,
  },
  $I.annote("AiMetricsForwarderTimerInput", {
    description: "Workstation timer parameters for scheduled AI metrics forwarder collection.",
  })
) {}

/**
 * Rendered systemd user units for the workstation-owned forwarder timer.
 *
 * @example
 * ```ts
 * import { AiMetricsForwarderTimerPlan } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsForwarderTimerPlan)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsForwarderTimerPlan extends S.Class<AiMetricsForwarderTimerPlan>($I`AiMetricsForwarderTimerPlan`)(
  {
    installCommands: S.Array(S.String),
    lockPath: S.String,
    serviceUnit: S.String,
    serviceUnitName: S.String,
    statusPath: S.String,
    timerUnit: S.String,
    timerUnitName: S.String,
  },
  $I.annote("AiMetricsForwarderTimerPlan", {
    description: "Systemd user timer artifacts that own P6a live collection on the workstation.",
  })
) {}

const encodeForwarderResultJson = S.encodeUnknownEffect(S.fromJsonString(AiMetricsForwarderRunResult));
const encodeForwarderTimerPlanJson = S.encodeUnknownEffect(S.fromJsonString(AiMetricsForwarderTimerPlan));

type ForwarderSourceFile = {
  readonly modifiedAtMillis: number;
  readonly relativePath: string;
  readonly sourceKind: AiMetricsTranscriptSource;
  readonly sourcePath: string;
};

type ForwarderSourceSelection = {
  readonly coverage: AiMetricsForwarderSourceCoverage;
  readonly files: ReadonlyArray<ForwarderSourceFile>;
};

const forwarderFailure = (message: string, cause: unknown): AiMetricsForwarderError =>
  new AiMetricsForwarderError({ cause, message });

const repoPathToClaudeProjectName: (repoRoot: string) => string = Str.replace(/[/\\]/gu, "-");

const normalizedRelativePath = (pathApi: Path.Path, root: string, filePath: string): string =>
  pipe(pathApi.relative(root, filePath), Str.replace(/\\/gu, "/"));

const shellQuote = (value: string): string => `'${Str.replace(/'/gu, "'\\''")(value)}'`;

const requireForwarderHashSalt = Effect.fn("AiMetrics.forwarder.requireHashSalt")(function* (
  input: AiMetricsForwarderInput
) {
  if (
    input.target === AiMetricsDeployTarget.Enum.local ||
    (input.hashSalt !== undefined && Str.isNonEmpty(Str.trim(input.hashSalt)))
  ) {
    return;
  }

  return yield* forwarderFailure(
    "AI metrics non-local forwarder runs require a resolved hash salt value.",
    input.target
  );
});

/**
 * Render a systemd user timer that repeatedly runs the forwarder with locking and status evidence.
 *
 * @param input - Timer rendering input with service names, command text, status path, and secret references.
 * @returns A render-only systemd timer/service plan for operator installation.
 * @example
 * ```ts
 * import { renderAiMetricsForwarderTimerPlan } from "@beep/repo-ai-metrics"
 * console.log(renderAiMetricsForwarderTimerPlan)
 * ```
 * @category services
 * @since 0.0.0
 */
export const renderAiMetricsForwarderTimerPlan = (input: AiMetricsForwarderTimerInput): AiMetricsForwarderTimerPlan => {
  const serviceUnitName = `${input.serviceName}.service`;
  const timerUnitName = `${input.serviceName}.timer`;
  const statusTmpPath = `${input.statusPath}.tmp`;
  const stderrTmpPath = `${input.statusPath}.stderr.tmp`;
  const envFileShellPath = "~/.config/beep/ai-metrics.env";
  const envFileUnitPath = "%h/.config/beep/ai-metrics.env";
  const execCommand = [
    "set -euo pipefail",
    `mkdir -p "$(dirname ${shellQuote(input.statusPath)})" "$(dirname ${shellQuote(input.lockPath)})"`,
    "exit_code=0",
    `if flock -n ${shellQuote(input.lockPath)} ${input.command} > ${shellQuote(statusTmpPath)} 2> ${shellQuote(stderrTmpPath)}; then :; else exit_code=$?; stderr="$(head -c 2000 ${shellQuote(stderrTmpPath)} | sed 's/\\\\/\\\\\\\\/g; s/"/\\\\"/g' | tr '\\n' ' ')"; printf '{"status":"failed","exitCode":%s,"stderr":"%s"}\\n' "$exit_code" "$stderr" > ${shellQuote(statusTmpPath)}; fi`,
    `rm -f ${shellQuote(stderrTmpPath)}`,
    `mv ${shellQuote(statusTmpPath)} ${shellQuote(input.statusPath)}`,
    'exit "$exit_code"',
  ].join("; ");
  const serviceUnit = [
    "[Unit]",
    "Description=Beep AI metrics forwarder collection",
    "Documentation=AGENTS.md",
    "StartLimitBurst=3",
    "StartLimitIntervalSec=30m",
    "",
    "[Service]",
    "Type=oneshot",
    `WorkingDirectory=${input.workingDirectory}`,
    `EnvironmentFile=${envFileUnitPath}`,
    `ExecStart=/usr/bin/env bash -lc ${shellQuote(execCommand)}`,
    "Restart=on-failure",
    "RestartSec=5m",
    "",
  ].join("\n");
  const timerUnit = [
    "[Unit]",
    "Description=Run Beep AI metrics forwarder collection",
    "",
    "[Timer]",
    "OnBootSec=5m",
    `OnUnitInactiveSec=${input.intervalMinutes}m`,
    "RandomizedDelaySec=2m",
    "Persistent=true",
    "",
    "[Install]",
    "WantedBy=timers.target",
    "",
  ].join("\n");
  const writeEnvFileCommands = [
    `install -m 0600 /dev/null ${envFileShellPath}`,
    ...(input.hashSaltSecretRef === undefined
      ? []
      : [
          `printf 'BEEP_AI_METRICS_HASH_SALT=%s\\n' "$(op read ${shellQuote(input.hashSaltSecretRef)})" >> ${envFileShellPath}`,
        ]),
    ...(input.rawArchiveKeySecretRef === undefined
      ? []
      : [
          `printf 'BEEP_AI_METRICS_RAW_ARCHIVE_KEY=%s\\n' "$(op read ${shellQuote(input.rawArchiveKeySecretRef)})" >> ${envFileShellPath}`,
        ]),
  ];

  return new AiMetricsForwarderTimerPlan({
    installCommands: [
      `mkdir -p ~/.config/systemd/user ~/.config/beep "$(dirname ${shellQuote(input.statusPath)})"`,
      ...writeEnvFileCommands,
      `printf '%s\\n' ${shellQuote(serviceUnit)} > ~/.config/systemd/user/${serviceUnitName}`,
      `printf '%s\\n' ${shellQuote(timerUnit)} > ~/.config/systemd/user/${timerUnitName}`,
      `systemctl --user daemon-reload`,
      `systemctl --user enable --now ${timerUnitName}`,
      `systemctl --user status ${timerUnitName}`,
      `journalctl --user -u ${serviceUnitName} -n 80 --no-pager`,
    ],
    lockPath: input.lockPath,
    serviceUnit,
    serviceUnitName,
    statusPath: input.statusPath,
    timerUnit,
    timerUnitName,
  });
};

const statOption = Effect.fn("AiMetrics.forwarder.statOption")(function* (pathName: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.stat(pathName).pipe(Effect.option);
});

const modifiedAtMillis = (info: FileSystem.File.Info): number =>
  pipe(
    info.mtime,
    O.map((mtime) => mtime.getTime()),
    O.getOrElse(() => 0)
  );

const sourcePathHashForDiagnostics = Effect.fn("AiMetrics.forwarder.sourcePathHashForDiagnostics")(function* (
  input: AiMetricsForwarderInput,
  sourceFile: ForwarderSourceFile
) {
  return yield* hashPrivateIdentifier(sourceFile.sourcePath, input.hashSalt).pipe(
    Effect.mapError((cause) =>
      forwarderFailure("Failed to hash AI metrics source path for diagnostics.", {
        cause,
        sourceKind: sourceFile.sourceKind,
      })
    )
  );
});

const shouldIncludeFile =
  (input: AiMetricsForwarderInput) =>
  (info: FileSystem.File.Info): boolean =>
    input.includeAll || input.sinceEpochMillis === undefined || modifiedAtMillis(info) >= input.sinceEpochMillis;

const collectJsonlFiles = Effect.fn("AiMetrics.forwarder.collectJsonlFiles")(function* (
  root: string
): Effect.fn.Return<ReadonlyArray<string>, never, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const rootInfo = yield* statOption(root);

  if (O.isNone(rootInfo) || rootInfo.value.type !== "Directory") {
    return A.empty<string>();
  }

  const walk = Effect.fnUntraced(function* (
    currentPath: string
  ): Effect.fn.Return<ReadonlyArray<string>, never, FileSystem.FileSystem | Path.Path> {
    const info = yield* statOption(currentPath);
    if (O.isNone(info)) {
      return A.empty<string>();
    }

    if (info.value.type === "File") {
      return Str.endsWith(".jsonl")(currentPath) ? A.of(currentPath) : A.empty<string>();
    }

    if (info.value.type !== "Directory") {
      return A.empty<string>();
    }

    const entries = yield* fs.readDirectory(currentPath).pipe(Effect.orElseSucceed(A.empty<string>));
    let files = A.empty<string>();
    for (const entry of entries) {
      files = A.appendAll(files, yield* walk(pathApi.join(currentPath, entry)));
    }

    return files;
  });

  return yield* walk(root);
});

const jsonlSourceFiles = Effect.fn("AiMetrics.forwarder.jsonlSourceFiles")(function* (
  input: AiMetricsForwarderInput,
  root: string,
  sourceKind: AiMetricsTranscriptSource
) {
  const fs = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const sourcePaths = yield* collectJsonlFiles(root);
  const files = yield* Effect.forEach(
    sourcePaths,
    Effect.fnUntraced(function* (sourcePath) {
      const info = yield* fs.stat(sourcePath).pipe(Effect.option);
      if (O.isNone(info) || info.value.type !== "File" || !shouldIncludeFile(input)(info.value)) {
        return O.none<ForwarderSourceFile>();
      }

      return O.some({
        modifiedAtMillis: modifiedAtMillis(info.value),
        relativePath: normalizedRelativePath(pathApi, root, sourcePath),
        sourceKind,
        sourcePath,
      });
    }),
    { concurrency: 16 }
  );

  return A.getSomes(files);
});

const openClawSourceFiles = Effect.fn("AiMetrics.forwarder.openClawSourceFiles")(function* (
  input: AiMetricsForwarderInput
) {
  const pathApi = yield* Path.Path;
  const unitPath =
    input.openClawUnitPath ?? pathApi.join(input.homeDir, ".config/systemd/user/openclaw-gateway.service");
  const info = yield* statOption(unitPath);
  if (O.isNone(info) || info.value.type !== "File" || !shouldIncludeFile(input)(info.value)) {
    return A.empty<ForwarderSourceFile>();
  }

  return A.of({
    modifiedAtMillis: modifiedAtMillis(info.value),
    relativePath: pathApi.basename(unitPath),
    sourceKind: AiMetricsTranscriptSource.Enum.openclaw,
    sourcePath: unitPath,
  });
});

const byModifiedDescending: Order.Order<ForwarderSourceFile> = Order.mapInput(
  Order.Number,
  (file) => -file.modifiedAtMillis
);

const selectSourceFiles = (
  sourceKind: AiMetricsTranscriptSource,
  files: ReadonlyArray<ForwarderSourceFile>,
  maxFiles: number
): ForwarderSourceSelection => {
  const sortedFiles = pipe(files, A.sort(byModifiedDescending));
  const includedFiles = A.take(sortedFiles, maxFiles);

  return {
    coverage: new AiMetricsForwarderSourceCoverage({
      candidateFileCount: A.length(sortedFiles),
      includedFileCount: A.length(includedFiles),
      limitedByMaxFiles: A.length(sortedFiles) > A.length(includedFiles),
      sourceKind,
    }),
    files: includedFiles,
  };
};

const discoverForwarderSourceFiles = Effect.fn("AiMetrics.forwarder.discoverSourceFiles")(function* (
  input: AiMetricsForwarderInput
) {
  const pathApi = yield* Path.Path;
  const repoRoot = pathApi.resolve(input.repoRoot);
  const homeDir = pathApi.resolve(input.homeDir);
  const codexRoot = input.codexSessionsRoot ?? pathApi.join(homeDir, ".codex/sessions");
  const claudeRoot =
    input.claudeProjectsRoot ?? pathApi.join(homeDir, ".claude/projects", repoPathToClaudeProjectName(repoRoot));
  const [codexFiles, claudeFiles, openClawFiles] = yield* Effect.all(
    [
      jsonlSourceFiles(input, codexRoot, AiMetricsTranscriptSource.Enum.codex),
      jsonlSourceFiles(input, claudeRoot, AiMetricsTranscriptSource.Enum.claude),
      openClawSourceFiles(input),
    ] as const,
    { concurrency: 3 }
  );
  const selections = [
    selectSourceFiles(AiMetricsTranscriptSource.Enum.codex, codexFiles, input.maxFiles),
    selectSourceFiles(AiMetricsTranscriptSource.Enum.claude, claudeFiles, input.maxFiles),
    selectSourceFiles(AiMetricsTranscriptSource.Enum.openclaw, openClawFiles, input.maxFiles),
  ] as const;

  return {
    coverage: A.map(selections, (selection) => selection.coverage),
    files: pipe(
      selections,
      A.flatMap((selection) => selection.files),
      A.sort(byModifiedDescending)
    ),
  };
});

const processSourceFile = Effect.fn("AiMetrics.forwarder.processSourceFile")(
  function* (input: AiMetricsForwarderInput, rawArchiveDir: string, sourceFile: ForwarderSourceFile) {
    const fs = yield* FileSystem.FileSystem;
    const diagnosticSourcePathHash = yield* sourcePathHashForDiagnostics(input, sourceFile);
    const content = yield* fs.readFileString(sourceFile.sourcePath).pipe(
      Effect.mapError((_cause) =>
        forwarderFailure(`Failed to read AI metrics ${sourceFile.sourceKind} source file.`, {
          failure: "source_file_read_failed",
          sourceKind: sourceFile.sourceKind,
          sourcePathHash: diagnosticSourcePathHash,
        })
      )
    );
    const summary = yield* summarizeTranscriptText({
      content,
      ...(input.hashSalt === undefined ? {} : { hashSalt: input.hashSalt }),
      sourceKind: sourceFile.sourceKind,
      sourcePath: sourceFile.sourcePath,
    }).pipe(Effect.mapError((cause) => forwarderFailure("Failed to summarize AI metrics source file.", cause)));
    const archiveObject = yield* writeEncryptedRawArchiveObject({
      content,
      ...(input.hashSalt === undefined ? {} : { hashSalt: input.hashSalt }),
      rawArchiveDir,
      rawArchiveKey: input.rawArchiveKey,
      sourceKind: sourceFile.sourceKind,
      sourcePath: sourceFile.sourcePath,
    }).pipe(
      Effect.mapError((cause) => forwarderFailure("Failed to write encrypted AI metrics raw archive object.", cause))
    );
    const privacy = yield* makeAiMetricsPrivacyCheckResult({
      content,
      ...(input.hashSalt === undefined ? {} : { hashSalt: input.hashSalt }),
      relativePath: sourceFile.relativePath,
      sourcePath: sourceFile.sourcePath,
      summary,
    }).pipe(Effect.mapError((cause) => forwarderFailure("Failed to build AI metrics privacy projection.", cause)));

    return new AiMetricsDerivedTranscriptRecord({ archiveObject, privacy });
  },
  (effect, _input, _rawArchiveDir, sourceFile) =>
    effect.pipe(
      Effect.withSpan("repo_ai_metrics.forwarder.process_source_file", {
        attributes: {
          "ai_metrics.source_kind": sourceFile.sourceKind,
        },
      })
    )
);

/**
 * Run durable ingest: encrypted raw archive, DuckDB projection, and Parquet export.
 *
 * @example
 * ```ts
 * import {
 *   AiMetricsForwarderInput,
 *   runAiMetricsForwarder
 * } from "@beep/repo-ai-metrics"
 * import { Redacted } from "effect"
 * const input = new AiMetricsForwarderInput({
 *   homeDir: "/home/example",
 *   rawArchiveKey: Redacted.make("base64-32-byte-key"),
 *   repoRoot: "/work/repo"
 * })
 * const program = runAiMetricsForwarder(input)
 * void program
 * ```
 * @category services
 * @since 0.0.0
 */
export const runAiMetricsForwarder = Effect.fn("AiMetrics.runAiMetricsForwarder")(
  function* (input: AiMetricsForwarderInput) {
    const startedAtEpochMillis = yield* Clock.currentTimeMillis;
    yield* requireForwarderHashSalt(input);
    const installSpec = yield* makeAiMetricsInstallSpec(
      new AiMetricsInstallInput({
        ...(input.dataRoot === undefined ? {} : { dataRoot: input.dataRoot }),
        ...(input.hashSaltSecretRef === undefined ? {} : { hashSaltSecretRef: input.hashSaltSecretRef }),
        ...(input.rawArchiveKeySecretRef === undefined ? {} : { rawArchiveKeySecretRef: input.rawArchiveKeySecretRef }),
        target: input.target,
      })
    ).pipe(Effect.mapError((cause) => forwarderFailure("Failed to resolve AI metrics install storage layout.", cause)));
    const pathApi = yield* Path.Path;
    const configSnapshotDir = pathApi.join(installSpec.storage.dataRoot, "config-snapshots");
    const configSnapshot = yield* makeAiMetricsConfigSnapshot(
      new AiMetricsConfigSnapshotInput({
        previousSnapshotPath: pathApi.join(configSnapshotDir, "latest.json"),
        repoRoot: input.repoRoot,
      })
    ).pipe(Effect.mapError((cause) => forwarderFailure("Failed to build AI metrics config snapshot.", cause)));
    yield* writeAiMetricsConfigSnapshotArtifacts({
      commitLatest: false,
      outputDir: configSnapshotDir,
      result: configSnapshot,
    }).pipe(Effect.mapError((cause) => forwarderFailure("Failed to persist AI metrics config snapshot.", cause)));
    const repoRootHash = yield* hashPrivateIdentifier(pathApi.resolve(input.repoRoot), input.hashSalt).pipe(
      Effect.mapError((cause) => forwarderFailure("Failed to hash AI metrics repo root.", cause))
    );
    const sourceSelection = yield* discoverForwarderSourceFiles(input);
    const records = yield* Effect.forEach(
      sourceSelection.files,
      (sourceFile) => processSourceFile(input, installSpec.storage.rawArchiveDir, sourceFile),
      { concurrency: 4 }
    );
    const ingestRunId = `forwarder-${startedAtEpochMillis}`;
    const derived = yield* writeAiMetricsDerivedStorage(
      new AiMetricsDerivedStorageWriteInput({
        configSnapshot: configSnapshot.snapshot,
        ingestRunId,
        records,
        repoRootHash,
        startedAtEpochMillis,
        storage: installSpec.storage,
        target: input.target,
      })
    ).pipe(Effect.mapError((cause) => forwarderFailure("Failed to write AI metrics derived storage.", cause)));
    yield* writeAiMetricsConfigSnapshotArtifacts({
      outputDir: configSnapshotDir,
      result: configSnapshot,
    }).pipe(Effect.mapError((cause) => forwarderFailure("Failed to commit latest AI metrics config snapshot.", cause)));

    return new AiMetricsForwarderRunResult({
      archiveObjectCount: derived.archiveObjectCount,
      configSnapshotId: configSnapshot.snapshot.snapshotId,
      duckDbPath: derived.duckDbPath,
      ingestRunId: derived.ingestRunId,
      parquetExportDir: derived.parquetExportDir,
      parquetTables: derived.parquetTables,
      rawArchiveDir: installSpec.storage.rawArchiveDir,
      sourceCoverage: sourceSelection.coverage,
      sourceFileCount: derived.sourceFileCount,
      target: input.target,
      turnCount: derived.turnCount,
    });
  },
  (effect, input) =>
    effect.pipe(
      Effect.withSpan("repo_ai_metrics.forwarder.run", {
        attributes: {
          "ai_metrics.include_all": input.includeAll,
          "ai_metrics.max_files": input.maxFiles,
          "ai_metrics.target": input.target,
        },
      })
    )
);

/**
 * Render a durable forwarder run result as JSON.
 *
 * @example
 * ```ts
 * import {
 *   AiMetricsForwarderRunResult,
 *   forwarderRunResultToJson
 * } from "@beep/repo-ai-metrics"
 * const result = new AiMetricsForwarderRunResult({
 *   archiveObjectCount: 0,
 *   configSnapshotId: "config-1",
 *   duckDbPath: ".ai-metrics/derived/ai-metrics.duckdb",
 *   ingestRunId: "forwarder-1",
 *   parquetExportDir: ".ai-metrics/derived/parquet/forwarder-1",
 *   parquetTables: [],
 *   rawArchiveDir: ".ai-metrics/raw",
 *   sourceFileCount: 0,
 *   target: "local",
 *   turnCount: 0
 * })
 * const program = forwarderRunResultToJson(result)
 * void program
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const forwarderRunResultToJson: (
  result: AiMetricsForwarderRunResult
) => Effect.Effect<string, AiMetricsForwarderError> = Effect.fn("AiMetrics.forwarderRunResultToJson")(
  function* (result) {
    return yield* encodeForwarderResultJson(result).pipe(
      Effect.mapError((cause) => forwarderFailure("Failed to encode AI metrics forwarder result as JSON.", cause))
    );
  }
);

/**
 * Render a forwarder timer plan as JSON.
 *
 * @example
 * ```ts
 * import { forwarderTimerPlanToJson } from "@beep/repo-ai-metrics"
 * console.log(forwarderTimerPlanToJson)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const forwarderTimerPlanToJson: (
  result: AiMetricsForwarderTimerPlan
) => Effect.Effect<string, AiMetricsForwarderError> = Effect.fn("AiMetrics.forwarderTimerPlanToJson")(
  function* (result) {
    return yield* encodeForwarderTimerPlanJson(result).pipe(
      Effect.mapError((cause) => forwarderFailure("Failed to encode AI metrics forwarder timer plan as JSON.", cause))
    );
  }
);
