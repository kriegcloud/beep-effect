/**
 * AI metrics command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import {
  type AiMetricsConfigSnapshotError,
  AiMetricsConfigSnapshotInput,
  AiMetricsDeployTarget,
  type AiMetricsIngestError,
  AiMetricsInstallInput,
  AiMetricsInstallSpec,
  type AiMetricsPrivacyError,
  AiMetricsPrivacyMode,
  type AiMetricsSourceDiscoveryError,
  AiMetricsSourceDiscoveryInput,
  AiMetricsTool,
  AiMetricsTranscriptSource,
  configSnapshotToJson,
  discoverAiMetricsSources,
  makeAiMetricsConfigSnapshot,
  makeAiMetricsInstallSpec,
  makeAiMetricsPrivacyCheckResult,
  privacyCheckToJson,
  sourceDiscoveryToJson,
  summarizeTranscriptText,
  summaryToJson,
} from "@beep/repo-ai-metrics";
import { TaggedErrorClass } from "@beep/schema";
import { Clock, Config, Console, Duration, Effect, FileSystem, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/AIMetrics");

const encodeJson = S.encodeUnknownEffect(S.UnknownFromJsonString);
const encodeInstallSpecJson = S.encodeUnknownEffect(S.fromJsonString(AiMetricsInstallSpec));

/**
 * Error raised by the AI metrics CLI.
 *
 * @example
 * ```ts
 * import { aiMetricsCommand } from "@beep/repo-cli/commands/AIMetrics/index"
 * console.log(aiMetricsCommand)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsCommandError extends TaggedErrorClass<AiMetricsCommandError>($I`AiMetricsCommandError`)(
  "AiMetricsCommandError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AiMetricsCommandError", {
    description: "User-facing failure raised by the AI metrics CLI command suite.",
  })
) {}

const jsonFlag = Flag.boolean("json").pipe(Flag.withDescription("Emit machine-readable JSON output"));
const inputFlag = Flag.string("input").pipe(
  Flag.withAlias("i"),
  Flag.withDescription("Transcript JSONL file to ingest")
);
const targetFlag = Flag.choiceWithValue("target", [
  ["local", AiMetricsDeployTarget.Enum.local],
  ["dankserver", AiMetricsDeployTarget.Enum.dankserver],
]).pipe(Flag.withDefault(AiMetricsDeployTarget.Enum.local), Flag.withDescription("Install or forwarder target"));
const sourceFlag = Flag.choiceWithValue("source", [
  ["codex", AiMetricsTranscriptSource.Enum.codex],
  ["claude", AiMetricsTranscriptSource.Enum.claude],
  ["openclaw", AiMetricsTranscriptSource.Enum.openclaw],
]).pipe(Flag.withDescription("Transcript source kind"));
const toolFlag = Flag.choiceWithValue("tool", [
  ["langfuse", AiMetricsTool.Enum.langfuse],
  ["phoenix", AiMetricsTool.Enum.phoenix],
  ["opik", AiMetricsTool.Enum.opik],
  ["posthog", AiMetricsTool.Enum.posthog],
]).pipe(Flag.withDefault(AiMetricsTool.Enum.phoenix), Flag.withDescription("Default observability tool"));
const caseFlag = Flag.string("case").pipe(Flag.withDescription("Benchmark case identifier"));
const configFlag = Flag.string("config").pipe(Flag.withDescription("Config snapshot identifier"));
const repoRootFlag = Flag.string("repo-root").pipe(Flag.withDescription("Repository root path"), Flag.optional);
const homeDirFlag = Flag.string("home-dir").pipe(Flag.withDescription("Home directory to scan"), Flag.optional);
const sinceFlag = Flag.string("since").pipe(
  Flag.withDescription("Only include files modified since this ISO timestamp or epoch milliseconds"),
  Flag.optional
);
const allFlag = Flag.boolean("all").pipe(
  Flag.withDescription("Scan all matching source files instead of the default 7 days")
);
const maxFilesFlag = Flag.integer("max-files").pipe(
  Flag.withDefault(200),
  Flag.withDescription("Maximum files to report per transcript source")
);
const hashSaltFlag = Flag.string("hash-salt").pipe(
  Flag.withDescription("Salt for hashing private paths and session identifiers"),
  Flag.optional
);
const hashSaltSecretRefFlag = Flag.string("hash-salt-secret-ref").pipe(
  Flag.withDescription("Secret reference that resolves BEEP_AI_METRICS_HASH_SALT for non-local install targets"),
  Flag.optional
);
const openClawUnitFlag = Flag.string("openclaw-unit").pipe(
  Flag.withDescription("OpenClaw user systemd unit path"),
  Flag.optional
);

const readInputFile = Effect.fn("AIMetrics.readInputFile")(function* (input: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.resolve(input);
  const content = yield* fs.readFileString(absolutePath).pipe(
    Effect.mapError(
      (cause) =>
        new AiMetricsCommandError({
          cause,
          message: `Failed to read transcript input "${absolutePath}".`,
        })
    )
  );

  return { absolutePath, content };
});

const encodeCommandJson = Effect.fn("AIMetrics.encodeCommandJson")(function* (value: unknown) {
  return yield* encodeJson(value).pipe(
    Effect.mapError(
      (cause) =>
        new AiMetricsCommandError({
          cause,
          message: "Failed to encode AI metrics command output as JSON.",
        })
    )
  );
});

const encodeInstallSpecCommandJson = Effect.fn("AIMetrics.encodeInstallSpecCommandJson")(function* (
  spec: AiMetricsInstallSpec
) {
  return yield* encodeInstallSpecJson(spec).pipe(
    Effect.mapError(
      (cause) =>
        new AiMetricsCommandError({
          cause,
          message: "Failed to encode AI metrics install spec as JSON.",
        })
    )
  );
});

type AiMetricsProgramError =
  | AiMetricsCommandError
  | AiMetricsConfigSnapshotError
  | AiMetricsIngestError
  | AiMetricsPrivacyError
  | AiMetricsSourceDiscoveryError;

const runAiMetricsProgram = <A, R>(effect: Effect.Effect<A, AiMetricsProgramError, R>): Effect.Effect<void, never, R> =>
  effect.pipe(
    Effect.catchTags({
      AiMetricsCommandError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
      AiMetricsIngestError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
      AiMetricsConfigSnapshotError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
      AiMetricsPrivacyError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
      AiMetricsSourceDiscoveryError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
    }),
    Effect.asVoid
  );

const readOptionalConfigString: (key: string) => Effect.Effect<O.Option<string>, AiMetricsCommandError> = Effect.fn(
  "AIMetrics.readOptionalConfigString"
)((key) =>
  Config.option(Config.string(key))
    .asEffect()
    .pipe(
      Effect.mapError(
        (cause) =>
          new AiMetricsCommandError({
            cause,
            message: `Failed to read ${key} from the Effect config provider.`,
          })
      )
    )
);

const resolveHomeDir = Effect.fn("AIMetrics.resolveHomeDir")(function* (homeDir: O.Option<string>) {
  if (O.isSome(homeDir)) {
    return homeDir.value;
  }

  const envHome = yield* readOptionalConfigString("HOME");
  if (O.isSome(envHome)) {
    return envHome.value;
  }

  return yield* new AiMetricsCommandError({
    cause: "HOME",
    message: "Unable to resolve a home directory. Pass --home-dir explicitly.",
  });
});

const resolveRepoRoot = Effect.fn("AIMetrics.resolveRepoRoot")(function* (repoRoot: O.Option<string>) {
  const path = yield* Path.Path;
  return path.resolve(O.isSome(repoRoot) ? repoRoot.value : process.cwd());
});

const resolveHashSalt = Effect.fn("AIMetrics.resolveHashSalt")(function* (hashSalt: O.Option<string>) {
  if (O.isSome(hashSalt)) {
    return hashSalt.value;
  }

  const envSalt = yield* readOptionalConfigString("BEEP_AI_METRICS_HASH_SALT");
  return O.isSome(envSalt) ? envSalt.value : undefined;
});

const resolveHashSaltSecretRef = Effect.fn("AIMetrics.resolveHashSaltSecretRef")(function* (
  hashSaltSecretRef: O.Option<string>
) {
  if (O.isSome(hashSaltSecretRef)) {
    return hashSaltSecretRef.value;
  }

  const envRef = yield* readOptionalConfigString("BEEP_AI_METRICS_HASH_SALT_SECRET_REF");
  return O.isSome(envRef) ? envRef.value : undefined;
});

const requireHashSaltForTarget = Effect.fn("AIMetrics.requireHashSaltForTarget")(function* ({
  hashSalt,
  target,
}: {
  readonly hashSalt: string | undefined;
  readonly target: AiMetricsDeployTarget;
}) {
  if (target === AiMetricsDeployTarget.Enum.local || (hashSalt !== undefined && Str.isNonEmpty(Str.trim(hashSalt)))) {
    return hashSalt;
  }

  return yield* new AiMetricsCommandError({
    cause: target,
    message: "Non-local AI metrics commands require --hash-salt or BEEP_AI_METRICS_HASH_SALT.",
  });
});

const requireHashSaltSecretRefForTarget = Effect.fn("AIMetrics.requireHashSaltSecretRefForTarget")(function* ({
  hashSaltSecretRef,
  target,
}: {
  readonly hashSaltSecretRef: string | undefined;
  readonly target: AiMetricsDeployTarget;
}) {
  if (
    target === AiMetricsDeployTarget.Enum.local ||
    (hashSaltSecretRef !== undefined && Str.isNonEmpty(Str.trim(hashSaltSecretRef)))
  ) {
    return hashSaltSecretRef;
  }

  return yield* new AiMetricsCommandError({
    cause: target,
    message:
      "Non-local AI metrics install plans require --hash-salt-secret-ref or BEEP_AI_METRICS_HASH_SALT_SECRET_REF.",
  });
});

const parseSinceEpochMillis = Effect.fn("AIMetrics.parseSinceEpochMillis")(function* (since: O.Option<string>) {
  if (O.isNone(since)) {
    const now = yield* Clock.currentTimeMillis;
    return now - Duration.toMillis(Duration.days(7));
  }

  const trimmed = Str.trim(since.value);
  const parsedEpoch = globalThis.Number(trimmed);
  if (globalThis.Number.isFinite(parsedEpoch)) {
    return parsedEpoch;
  }

  const parsedDate = globalThis.Date.parse(trimmed);
  if (globalThis.Number.isFinite(parsedDate)) {
    return parsedDate;
  }

  return yield* new AiMetricsCommandError({
    cause: since.value,
    message: `Invalid --since value "${since.value}". Use an ISO timestamp or epoch milliseconds.`,
  });
});

const renderInstallSpec = Effect.fn("AIMetrics.renderInstallSpec")(function* (
  spec: AiMetricsInstallSpec,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* encodeInstallSpecCommandJson(spec));
    return;
  }

  yield* Console.log(`AI metrics install preview: ${spec.stackName}`);
  yield* Console.log(`target: ${spec.target}`);
  yield* Console.log(`data root: ${spec.storage.dataRoot}`);
  yield* Console.log(`raw archive: ${spec.storage.rawArchiveDir}`);
  yield* Console.log(`derived duckdb: ${spec.storage.duckDbPath}`);
  yield* Console.log(`privacy: ${spec.privacyMode}`);
  yield* Console.log(`default tool: ${spec.defaultTool}`);
});

const makeInstallPreviewProgram = Effect.fn("AIMetrics.makeInstallPreviewProgram")(function* ({
  hashSaltSecretRef,
  json,
  target,
  tool,
}: {
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly target: AiMetricsDeployTarget;
  readonly tool: AiMetricsTool;
}) {
  const resolvedHashSaltSecretRef = yield* requireHashSaltSecretRefForTarget({
    hashSaltSecretRef: yield* resolveHashSaltSecretRef(hashSaltSecretRef),
    target,
  });
  const spec = makeAiMetricsInstallSpec(
    new AiMetricsInstallInput({
      defaultTool: tool,
      ...(resolvedHashSaltSecretRef === undefined ? {} : { hashSaltSecretRef: resolvedHashSaltSecretRef }),
      privacyMode: AiMetricsPrivacyMode.Enum.encrypted_raw_redacted_ui,
      target,
    })
  );

  yield* renderInstallSpec(spec, json);
});

const makeIngestProgram = Effect.fn("AIMetrics.makeIngestProgram")(function* ({
  hashSalt,
  input,
  json,
  source,
  target,
}: {
  readonly hashSalt: O.Option<string>;
  readonly input: string;
  readonly json: boolean;
  readonly source: AiMetricsTranscriptSource;
  readonly target: AiMetricsDeployTarget;
}) {
  const { absolutePath, content } = yield* readInputFile(input);
  const resolvedHashSalt = yield* requireHashSaltForTarget({
    hashSalt: yield* resolveHashSalt(hashSalt),
    target,
  });
  const summary = yield* summarizeTranscriptText({
    content,
    ...(resolvedHashSalt === undefined ? {} : { hashSalt: resolvedHashSalt }),
    sourceKind: source,
    sourcePath: absolutePath,
  });

  if (json) {
    yield* Console.log(yield* summaryToJson(summary));
    return;
  }

  yield* Console.log(`ai-metrics ingest: ${summary.sourceKind} sourcePathHash=${summary.sourcePathHash}`);
  yield* Console.log(`target: ${target}`);
  yield* Console.log(`lines: ${summary.totalLines}`);
  yield* Console.log(`accepted events: ${summary.acceptedEvents}`);
  yield* Console.log(`rejected lines: ${summary.rejectedLines}`);
  yield* Console.log(`event names: ${pipe(summary.eventNames, A.join(", "))}`);
});

const collectJsonlInputFiles = Effect.fn("AIMetrics.collectJsonlInputFiles")(function* (
  inputPath: string
): Effect.fn.Return<ReadonlyArray<string>, AiMetricsCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const stat = yield* fs.stat(inputPath).pipe(
    Effect.mapError(
      (cause) =>
        new AiMetricsCommandError({
          cause,
          message: `Failed to stat privacy input "${inputPath}".`,
        })
    )
  );

  if (stat.type === "File") {
    return [inputPath];
  }

  if (stat.type !== "Directory") {
    return yield* new AiMetricsCommandError({
      cause: stat.type,
      message: `Expected --input to be a transcript file or directory: "${inputPath}".`,
    });
  }

  const walk = Effect.fnUntraced(function* (
    currentPath: string
  ): Effect.fn.Return<ReadonlyArray<string>, never, FileSystem.FileSystem | Path.Path> {
    const info = yield* fs.stat(currentPath).pipe(Effect.option);
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
      files = A.appendAll(files, yield* walk(path.join(currentPath, entry)));
    }

    return files;
  });

  return pipe(yield* walk(inputPath), A.sort(Order.String));
});

const readPrivacyInput = Effect.fn("AIMetrics.readPrivacyInput")(function* (input: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.resolve(input);
  const files = yield* collectJsonlInputFiles(absolutePath);
  const chunks = yield* Effect.forEach(
    files,
    (filePath) =>
      fs.readFileString(filePath).pipe(
        Effect.mapError(
          (cause) =>
            new AiMetricsCommandError({
              cause,
              message: `Failed to read transcript input "${filePath}".`,
            })
        )
      ),
    { concurrency: 8 }
  );

  return { absolutePath, content: pipe(chunks, A.join("\n")) };
});

const makeSourcesDiscoverProgram = Effect.fn("AIMetrics.makeSourcesDiscoverProgram")(function* ({
  all,
  hashSalt,
  homeDir,
  json,
  maxFiles,
  openClawUnit,
  repoRoot,
  since,
  target,
}: {
  readonly all: boolean;
  readonly hashSalt: O.Option<string>;
  readonly homeDir: O.Option<string>;
  readonly json: boolean;
  readonly maxFiles: number;
  readonly openClawUnit: O.Option<string>;
  readonly repoRoot: O.Option<string>;
  readonly since: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const resolvedHashSalt = yield* requireHashSaltForTarget({
    hashSalt: yield* resolveHashSalt(hashSalt),
    target,
  });
  const sinceEpochMillis = all ? undefined : yield* parseSinceEpochMillis(since);
  const result = yield* discoverAiMetricsSources(
    new AiMetricsSourceDiscoveryInput({
      homeDir: yield* resolveHomeDir(homeDir),
      includeAll: all,
      maxFiles,
      repoRoot: yield* resolveRepoRoot(repoRoot),
      target,
      ...(resolvedHashSalt === undefined ? {} : { hashSalt: resolvedHashSalt }),
      ...(sinceEpochMillis === undefined ? {} : { sinceEpochMillis }),
      ...(O.isSome(openClawUnit) ? { openClawUnitPath: openClawUnit.value } : {}),
    })
  );

  if (json) {
    yield* Console.log(yield* sourceDiscoveryToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics sources discover: target=${result.target}`);
  yield* Console.log(`hash salt: ${result.hashSaltStatus}`);
  yield* Console.log(`discovered files: ${result.discoveredFileCount}`);
  for (const source of result.sources) {
    yield* Console.log(`${source.sourceKind}: ${source.status} files=${source.fileCount}`);
  }
});

const makeConfigSnapshotProgram = Effect.fn("AIMetrics.makeConfigSnapshotProgram")(function* ({
  json,
  repoRoot,
}: {
  readonly json: boolean;
  readonly repoRoot: O.Option<string>;
}) {
  const result = yield* makeAiMetricsConfigSnapshot(
    new AiMetricsConfigSnapshotInput({
      repoRoot: yield* resolveRepoRoot(repoRoot),
    })
  );

  if (json) {
    yield* Console.log(yield* configSnapshotToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics config snapshot: ${result.snapshot.snapshotId}`);
  yield* Console.log(`files: ${result.fileCount}`);
  yield* Console.log(`hash: ${result.snapshot.configHash}`);
});

const makePrivacyCheckProgram = Effect.fn("AIMetrics.makePrivacyCheckProgram")(function* ({
  hashSalt,
  input,
  json,
  source,
}: {
  readonly hashSalt: O.Option<string>;
  readonly input: string;
  readonly json: boolean;
  readonly source: AiMetricsTranscriptSource;
}) {
  const { absolutePath, content } = yield* readPrivacyInput(input);
  const resolvedHashSalt = yield* resolveHashSalt(hashSalt);
  const summary = yield* summarizeTranscriptText({
    content,
    ...(resolvedHashSalt === undefined ? {} : { hashSalt: resolvedHashSalt }),
    sourceKind: source,
    sourcePath: absolutePath,
  });
  const result = yield* makeAiMetricsPrivacyCheckResult({
    content,
    sourcePath: absolutePath,
    summary,
    ...(resolvedHashSalt === undefined ? {} : { hashSalt: resolvedHashSalt }),
  });

  if (json) {
    yield* Console.log(yield* privacyCheckToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics privacy check: ${result.sourceKind}`);
  yield* Console.log(`hash salt: ${result.hashSaltStatus}`);
  yield* Console.log(`safe for derived UI: ${result.redaction.safeForDerivedUi}`);
  yield* Console.log(`accepted events: ${result.sanitized.acceptedEvents}`);
});

const makeForwarderRunProgram = Effect.fn("AIMetrics.makeForwarderRunProgram")(function* ({
  hashSaltSecretRef,
  json,
  target,
}: {
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly target: AiMetricsDeployTarget;
}) {
  const resolvedHashSaltSecretRef = yield* requireHashSaltSecretRefForTarget({
    hashSaltSecretRef: yield* resolveHashSaltSecretRef(hashSaltSecretRef),
    target,
  });
  const spec = makeAiMetricsInstallSpec(
    new AiMetricsInstallInput({
      ...(resolvedHashSaltSecretRef === undefined ? {} : { hashSaltSecretRef: resolvedHashSaltSecretRef }),
      target,
    })
  );

  if (json) {
    yield* Console.log(yield* encodeInstallSpecCommandJson(spec));
    return;
  }

  yield* Console.log(`ai-metrics forwarder: target=${target}`);
  yield* Console.log(`raw archive destination: ${spec.storage.rawArchiveDir}`);
  yield* Console.log(
    "v1 forwarder mode: snapshot local transcript files, normalize summaries, and push raw archive out-of-band"
  );
});

const makeBenchmarkRunProgram = Effect.fn("AIMetrics.makeBenchmarkRunProgram")(function* ({
  caseId,
  configSnapshotId,
  json,
}: {
  readonly caseId: string;
  readonly configSnapshotId: string;
  readonly json: boolean;
}) {
  const line = `benchmark=${caseId} config=${configSnapshotId} score-model=outcome-heavy`;

  if (json) {
    yield* Console.log(
      yield* encodeCommandJson({
        benchmarkCaseId: caseId,
        configSnapshotId,
        scoreModel: "outcome-heavy",
      })
    );
    return;
  }

  yield* Console.log(`ai-metrics benchmark run: ${line}`);
});

const makeBenchmarkCompareProgram = Effect.fn("AIMetrics.makeBenchmarkCompareProgram")(function* ({
  json,
}: {
  readonly json: boolean;
}) {
  if (json) {
    yield* Console.log(yield* encodeCommandJson({ scoreModel: "outcome-heavy", status: "ready-for-derived-runs" }));
    return;
  }

  yield* Console.log("ai-metrics benchmark compare: outcome-heavy scorecard ready for derived run tables");
});

const installPreviewCommand = Command.make(
  "preview",
  {
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    target: targetFlag,
    tool: toolFlag,
  },
  ({ hashSaltSecretRef, json, target, tool }) =>
    runAiMetricsProgram(makeInstallPreviewProgram({ hashSaltSecretRef, json, target, tool }))
).pipe(Command.withDescription("Preview the target-agnostic AI metrics install spec"));

const ingestCommand = Command.make(
  "ingest",
  {
    hashSalt: hashSaltFlag,
    input: inputFlag,
    json: jsonFlag,
    source: sourceFlag,
    target: targetFlag,
  },
  ({ hashSalt, input, json, source, target }) =>
    runAiMetricsProgram(makeIngestProgram({ hashSalt, input, json, source, target }))
).pipe(Command.withDescription("Summarize a Codex, Claude, or OpenClaw JSONL transcript"));

const sourcesDiscoverCommand = Command.make(
  "discover",
  {
    all: allFlag,
    hashSalt: hashSaltFlag,
    homeDir: homeDirFlag,
    json: jsonFlag,
    maxFiles: maxFilesFlag,
    openClawUnit: openClawUnitFlag,
    repoRoot: repoRootFlag,
    since: sinceFlag,
    target: targetFlag,
  },
  ({ all, hashSalt, homeDir, json, maxFiles, openClawUnit, repoRoot, since, target }) =>
    runAiMetricsProgram(
      makeSourcesDiscoverProgram({ all, hashSalt, homeDir, json, maxFiles, openClawUnit, repoRoot, since, target })
    )
).pipe(Command.withDescription("Discover Codex, Claude, and OpenClaw local metrics sources"));

const sourcesCommand = Command.make(
  "sources",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics source commands:");
    yield* Console.log("- bun run beep ai-metrics sources discover --target local");
  })
).pipe(
  Command.withDescription("AI metrics source discovery workflow"),
  Command.withSubcommands([sourcesDiscoverCommand])
);

const configSnapshotCommand = Command.make(
  "snapshot",
  {
    json: jsonFlag,
    repoRoot: repoRootFlag,
  },
  ({ json, repoRoot }) => runAiMetricsProgram(makeConfigSnapshotProgram({ json, repoRoot }))
).pipe(Command.withDescription("Hash the repo-local agent-facing configuration snapshot"));

const configCommand = Command.make(
  "config",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics config commands:");
    yield* Console.log("- bun run beep ai-metrics config snapshot");
  })
).pipe(
  Command.withDescription("AI metrics configuration attribution workflow"),
  Command.withSubcommands([configSnapshotCommand])
);

const privacyCheckCommand = Command.make(
  "check",
  {
    hashSalt: hashSaltFlag,
    input: inputFlag,
    json: jsonFlag,
    source: sourceFlag,
  },
  ({ hashSalt, input, json, source }) => runAiMetricsProgram(makePrivacyCheckProgram({ hashSalt, input, json, source }))
).pipe(Command.withDescription("Prove a transcript projection does not expose raw prompt or output text"));

const privacyCommand = Command.make(
  "privacy",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics privacy commands:");
    yield* Console.log("- bun run beep ai-metrics privacy check --source codex --input <file-or-dir>");
  })
).pipe(Command.withDescription("AI metrics privacy proof workflow"), Command.withSubcommands([privacyCheckCommand]));

const installCommand = Command.make(
  "install",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics install commands:");
    yield* Console.log("- bun run beep ai-metrics install preview --target local");
    yield* Console.log("- bun run beep ai-metrics install preview --target dankserver");
  })
).pipe(Command.withDescription("AI metrics install workflow"), Command.withSubcommands([installPreviewCommand]));

const forwarderRunCommand = Command.make(
  "run",
  {
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    target: targetFlag,
  },
  ({ hashSaltSecretRef, json, target }) =>
    runAiMetricsProgram(makeForwarderRunProgram({ hashSaltSecretRef, json, target }))
).pipe(Command.withDescription("Print the v1 local forwarder target contract"));

const forwarderCommand = Command.make(
  "forwarder",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics forwarder commands:");
    yield* Console.log("- bun run beep ai-metrics forwarder run --target local");
  })
).pipe(Command.withDescription("AI metrics local forwarder workflow"), Command.withSubcommands([forwarderRunCommand]));

const benchmarkRunCommand = Command.make(
  "run",
  {
    caseId: caseFlag,
    configSnapshotId: configFlag,
    json: jsonFlag,
  },
  ({ caseId, configSnapshotId, json }) =>
    runAiMetricsProgram(makeBenchmarkRunProgram({ caseId, configSnapshotId, json }))
).pipe(Command.withDescription("Register a benchmark run request for a config snapshot"));

const benchmarkCompareCommand = Command.make(
  "compare",
  {
    json: jsonFlag,
  },
  ({ json }) => runAiMetricsProgram(makeBenchmarkCompareProgram({ json }))
).pipe(Command.withDescription("Compare benchmark runs using the outcome-heavy scorecard model"));

const benchmarkCommand = Command.make(
  "benchmark",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics benchmark commands:");
    yield* Console.log("- bun run beep ai-metrics benchmark run --case <id> --config <snapshot>");
    yield* Console.log("- bun run beep ai-metrics benchmark compare");
  })
).pipe(
  Command.withDescription("AI metrics benchmark workflow"),
  Command.withSubcommands([benchmarkRunCommand, benchmarkCompareCommand])
);

/**
 * AI metrics root command.
 *
 * @example
 * ```ts
 * import { aiMetricsCommand } from "@beep/repo-cli/commands/AIMetrics/index"
 * console.log(aiMetricsCommand)
 * ```
 * @category commands
 * @since 0.0.0
 */
export const aiMetricsCommand = Command.make(
  "ai-metrics",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics commands:");
    yield* Console.log("- ingest");
    yield* Console.log("- sources discover");
    yield* Console.log("- config snapshot");
    yield* Console.log("- privacy check");
    yield* Console.log("- install preview");
    yield* Console.log("- forwarder run");
    yield* Console.log("- benchmark run");
    yield* Console.log("- benchmark compare");
  })
).pipe(
  Command.withDescription("Collect, normalize, and plan deployment for AI-agent metrics"),
  Command.withSubcommands([
    ingestCommand,
    sourcesCommand,
    configCommand,
    privacyCommand,
    installCommand,
    forwarderCommand,
    benchmarkCommand,
  ])
);
