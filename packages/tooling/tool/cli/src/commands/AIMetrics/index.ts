/**
 * AI metrics command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb";
import { $RepoCliId } from "@beep/identity/packages";
import { layerNodeSdkServerTraces, ServerObservabilityConfig } from "@beep/observability/server";
import {
  type AiMetricsArchiveError,
  AiMetricsBenchmarkCaseInput,
  AiMetricsBenchmarkRunInput,
  type AiMetricsConfigSnapshotError,
  AiMetricsConfigSnapshotInput,
  AiMetricsDeployTarget,
  type AiMetricsForwarderError,
  AiMetricsForwarderInput,
  AiMetricsForwarderTimerInput,
  type AiMetricsIngestError,
  type AiMetricsInstallConfigurationError,
  AiMetricsInstallDoctorInput,
  type AiMetricsInstallDoctorResult,
  AiMetricsInstallDoctorStatus,
  AiMetricsInstallInput,
  type AiMetricsInstallPlan,
  AiMetricsInstallSpec,
  AiMetricsLabelQueueInput,
  AiMetricsOtlpEndpointSpec,
  type AiMetricsOtlpExportError,
  AiMetricsOtlpExportInput,
  AiMetricsOutcomeLabelInput,
  type AiMetricsPrivacyError,
  AiMetricsPrivacyMode,
  AiMetricsQualityGateStatus,
  type AiMetricsScorecardError,
  type AiMetricsSourceDiscoveryError,
  AiMetricsSourceDiscoveryInput,
  AiMetricsTool,
  AiMetricsTranscriptSource,
  AiMetricsWeeklyReportInput,
  addAiMetricsOutcomeLabel,
  aiMetricsBenchmarkCaseListToJson,
  aiMetricsBenchmarkCaseToJson,
  aiMetricsBenchmarkRunToJson,
  aiMetricsInstallApplyDryRunToJson,
  aiMetricsInstallDoctorToJson,
  aiMetricsInstallPlanToJson,
  aiMetricsLabelQueueToJson,
  aiMetricsOutcomeLabelToJson,
  aiMetricsWeeklyReportToJson,
  configSnapshotToJson,
  decryptEncryptedRawArchiveEnvelope,
  discoverAiMetricsSources,
  forwarderRunResultToJson,
  forwarderTimerPlanToJson,
  generateAiMetricsWeeklyReport,
  hashPublicTextSha256,
  listAiMetricsBenchmarkCases,
  makeAiMetricsConfigSnapshot,
  makeAiMetricsInstallApplyDryRunResult,
  makeAiMetricsInstallDoctorResult,
  makeAiMetricsInstallPlan,
  makeAiMetricsInstallSpec,
  makeAiMetricsPrivacyCheckResult,
  otlpExportResultToJson,
  privacyCheckToJson,
  queueAiMetricsLabels,
  readEncryptedRawArchiveEnvelope,
  recordAiMetricsBenchmarkRun,
  renderAiMetricsForwarderTimerPlan,
  renderAiMetricsLocalPhoenixCompose,
  runAiMetricsForwarder,
  runAiMetricsOtlpExport,
  sourceDiscoveryToJson,
  summarizeTranscriptText,
  summaryToJson,
  upsertAiMetricsBenchmarkCase,
} from "@beep/repo-ai-metrics";
import { TaggedErrorClass } from "@beep/schema";
import {
  Clock,
  Config,
  Console,
  DateTime,
  Duration,
  Effect,
  FileSystem,
  Layer,
  Order,
  Path,
  pipe,
  Redacted,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/AIMetrics");

const encodeJson = S.encodeUnknownEffect(S.UnknownFromJsonString);
const encodeInstallSpecJson = S.encodeUnknownEffect(S.fromJsonString(AiMetricsInstallSpec));
const localCollectorDataRoot = ".beep/ai-metrics";
const shellQuote = (value: string): string => `'${Str.replace(/'/gu, "'\\''")(value)}'`;

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

class AiMetricsArchiveDrillRow extends S.Class<AiMetricsArchiveDrillRow>($I`AiMetricsArchiveDrillRow`)(
  {
    archiveObjectId: S.String,
    archivePath: S.String,
    plaintextContentHash: S.String,
  },
  $I.annote("AiMetricsArchiveDrillRow", {
    description: "Latest encrypted raw archive row selected for a non-printing decrypt drill.",
  })
) {}

const decodeArchiveDrillRows = S.decodeUnknownEffect(S.Array(AiMetricsArchiveDrillRow));

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
const taskFlag = Flag.string("task").pipe(Flag.withDescription("AI metrics agent task identifier"));
const titleFlag = Flag.string("title").pipe(Flag.withDescription("Human-readable benchmark case title"));
const promptHashFlag = Flag.string("prompt-hash").pipe(Flag.withDescription("Hash of benchmark prompt content"));
const promptRefFlag = Flag.string("prompt-ref").pipe(
  Flag.withDescription("Optional reference to benchmark prompt content"),
  Flag.optional
);
const checksFlag = Flag.string("checks").pipe(
  Flag.withDefault(""),
  Flag.withDescription("Comma-separated benchmark quality checks")
);
const ratingFlag = Flag.integer("rating").pipe(Flag.withDescription("Human rating from 1 to 5"));
const interventionsFlag = Flag.integer("interventions").pipe(
  Flag.withDefault(0),
  Flag.withDescription("Human intervention count")
);
const elapsedMsFlag = Flag.integer("elapsed-ms").pipe(Flag.withDescription("Benchmark elapsed milliseconds"));
const limitFlag = Flag.integer("limit").pipe(Flag.withDefault(20), Flag.withDescription("Maximum rows to return"));
const intervalMinutesFlag = Flag.integer("interval-minutes").pipe(
  Flag.withDefault(30),
  Flag.withDescription("Minutes between scheduled forwarder runs")
);
const passedValueFlag = Flag.choiceWithValue("passed", [
  ["true", true],
  ["false", false],
]).pipe(Flag.withDescription("Whether the task or benchmark passed"));
const followUpFixValueFlag = Flag.choiceWithValue("follow-up-fix", [
  ["true", true],
  ["false", false],
]).pipe(Flag.withDefault(false), Flag.withDescription("Whether a follow-up fix or revert was needed"));
const qualityGateFlag = Flag.choiceWithValue("quality-gate", [
  ["passed", AiMetricsQualityGateStatus.Enum.passed],
  ["failed", AiMetricsQualityGateStatus.Enum.failed],
  ["not_run", AiMetricsQualityGateStatus.Enum.not_run],
  ["unknown", AiMetricsQualityGateStatus.Enum.unknown],
]).pipe(Flag.withDefault(AiMetricsQualityGateStatus.Enum.unknown), Flag.withDescription("Quality-gate outcome"));
const noteFlag = Flag.string("note").pipe(Flag.withDescription("Optional redacted human note"), Flag.optional);
const repoRootFlag = Flag.string("repo-root").pipe(Flag.withDescription("Repository root path"), Flag.optional);
const homeDirFlag = Flag.string("home-dir").pipe(Flag.withDescription("Home directory to scan"), Flag.optional);
const sinceFlag = Flag.string("since").pipe(
  Flag.withDescription("Only include files modified since this ISO timestamp or epoch milliseconds"),
  Flag.optional
);
const untilFlag = Flag.string("until").pipe(
  Flag.withDescription("Only include records before this ISO timestamp or epoch milliseconds"),
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
const rawArchiveKeySecretRefFlag = Flag.string("raw-archive-key-secret-ref").pipe(
  Flag.withDescription("Secret reference that resolves BEEP_AI_METRICS_RAW_ARCHIVE_KEY for non-local install targets"),
  Flag.optional
);
const dataRootFlag = Flag.string("data-root").pipe(Flag.withDescription("AI metrics data root"), Flag.optional);
const openClawUnitFlag = Flag.string("openclaw-unit").pipe(
  Flag.withDescription("OpenClaw user systemd unit path"),
  Flag.optional
);
const otlpFlag = Flag.boolean("otlp").pipe(Flag.withDescription("Enable explicit OTLP trace export for this command"));
const dryRunFlag = Flag.boolean("dry-run").pipe(
  Flag.withDescription("Preview install apply steps without changing local or remote state")
);
const otlpBaseUrlFlag = Flag.string("otlp-base-url").pipe(
  Flag.withDescription("Override the install spec OTLP base URL"),
  Flag.optional
);
const ingestRunFlag = Flag.string("ingest-run").pipe(
  Flag.withDefault("latest"),
  Flag.withDescription("Derived ingest run id to export, or latest")
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
          message: "Failed to read transcript input.",
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
  | AiMetricsArchiveError
  | AiMetricsCommandError
  | AiMetricsConfigSnapshotError
  | AiMetricsForwarderError
  | AiMetricsIngestError
  | AiMetricsInstallConfigurationError
  | AiMetricsOtlpExportError
  | AiMetricsPrivacyError
  | AiMetricsScorecardError
  | AiMetricsSourceDiscoveryError;

const runAiMetricsProgram = <A, R>(effect: Effect.Effect<A, AiMetricsProgramError, R>): Effect.Effect<void, never, R> =>
  effect.pipe(
    Effect.catchTags({
      AiMetricsArchiveError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
      AiMetricsCommandError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
      AiMetricsIngestError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
      AiMetricsForwarderError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
      AiMetricsInstallConfigurationError: Effect.fn(function* (error) {
        process.exitCode = 1;
        yield* Console.error(`ai-metrics: ${error.message}`);
      }),
      AiMetricsOtlpExportError: Effect.fn(function* (error) {
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
      AiMetricsScorecardError: Effect.fn(function* (error) {
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

const readOptionalRedactedConfigString: (
  key: string
) => Effect.Effect<O.Option<Redacted.Redacted<string>>, AiMetricsCommandError> = Effect.fn(
  "AIMetrics.readOptionalRedactedConfigString"
)((key) =>
  Config.option(Config.redacted(key))
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

const resolveRawArchiveKey = Effect.fn("AIMetrics.resolveRawArchiveKey")(function* () {
  const envKey = yield* readOptionalRedactedConfigString("BEEP_AI_METRICS_RAW_ARCHIVE_KEY");
  if (O.isSome(envKey) && Str.isNonEmpty(Str.trim(Redacted.value(envKey.value)))) {
    return envKey.value;
  }

  return yield* new AiMetricsCommandError({
    cause: "BEEP_AI_METRICS_RAW_ARCHIVE_KEY",
    message: "AI metrics forwarder requires BEEP_AI_METRICS_RAW_ARCHIVE_KEY.",
  });
});

const resolveRawArchiveKeySecretRef = Effect.fn("AIMetrics.resolveRawArchiveKeySecretRef")(function* (
  rawArchiveKeySecretRef: O.Option<string>
) {
  if (O.isSome(rawArchiveKeySecretRef)) {
    return rawArchiveKeySecretRef.value;
  }

  const envRef = yield* readOptionalConfigString("BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF");
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

const requireRawArchiveKeySecretRefForTarget = Effect.fn("AIMetrics.requireRawArchiveKeySecretRefForTarget")(
  function* ({
    rawArchiveKeySecretRef,
    target,
  }: {
    readonly rawArchiveKeySecretRef: string | undefined;
    readonly target: AiMetricsDeployTarget;
  }) {
    if (
      target === AiMetricsDeployTarget.Enum.local ||
      (rawArchiveKeySecretRef !== undefined && Str.isNonEmpty(Str.trim(rawArchiveKeySecretRef)))
    ) {
      return rawArchiveKeySecretRef;
    }

    return yield* new AiMetricsCommandError({
      cause: target,
      message:
        "Non-local AI metrics install plans require --raw-archive-key-secret-ref or BEEP_AI_METRICS_RAW_ARCHIVE_KEY_SECRET_REF.",
    });
  }
);

const parseEpochMillisOption = (value: string): O.Option<number> => {
  const trimmed = Str.trim(value);
  const parsedEpoch = globalThis.Number(trimmed);
  if (globalThis.Number.isFinite(parsedEpoch)) {
    return O.some(parsedEpoch);
  }

  return pipe(DateTime.make(trimmed), O.map(DateTime.toEpochMillis));
};

const parseSinceEpochMillis = Effect.fn("AIMetrics.parseSinceEpochMillis")(function* (since: O.Option<string>) {
  if (O.isNone(since)) {
    const now = yield* Clock.currentTimeMillis;
    return now - Duration.toMillis(Duration.days(7));
  }

  const parsed = parseEpochMillisOption(since.value);
  if (O.isSome(parsed)) {
    return parsed.value;
  }

  return yield* new AiMetricsCommandError({
    cause: since.value,
    message: `Invalid --since value "${since.value}". Use an ISO timestamp or epoch milliseconds.`,
  });
});

const parseOptionalEpochMillis = Effect.fn("AIMetrics.parseOptionalEpochMillis")(function* (
  flagName: string,
  value: O.Option<string>
) {
  if (O.isNone(value)) {
    return O.none<number>();
  }

  const parsed = parseEpochMillisOption(value.value);
  if (O.isSome(parsed)) return parsed;

  return yield* new AiMetricsCommandError({
    cause: value.value,
    message: `Invalid --${flagName} value "${value.value}". Use an ISO timestamp or epoch milliseconds.`,
  });
});

const parseWindow = Effect.fn("AIMetrics.parseWindow")(function* ({
  since,
  until,
}: {
  readonly since: O.Option<string>;
  readonly until: O.Option<string>;
}) {
  const end = yield* parseOptionalEpochMillis("until", until);
  const windowEndEpochMillis = O.isSome(end) ? end.value : yield* Clock.currentTimeMillis;
  const start = yield* parseOptionalEpochMillis("since", since);
  const windowStartEpochMillis = O.isSome(start)
    ? start.value
    : windowEndEpochMillis - Duration.toMillis(Duration.days(7));

  if (windowStartEpochMillis < windowEndEpochMillis) {
    return { windowEndEpochMillis, windowStartEpochMillis };
  }

  return yield* new AiMetricsCommandError({
    cause: { windowEndEpochMillis, windowStartEpochMillis },
    message: "AI metrics report windows require --since to be before --until.",
  });
});

const parseChecks = (checks: string): ReadonlyArray<string> =>
  pipe(Str.split(checks, ","), A.map(Str.trim), A.filter(Str.isNonEmpty));

const p6aCollectorDataRoot = (dataRoot: O.Option<string>, target: AiMetricsDeployTarget): O.Option<string> =>
  O.isSome(dataRoot) || target === AiMetricsDeployTarget.Enum.local ? dataRoot : O.some(localCollectorDataRoot);

const makeCommandInstallInput = Effect.fn("AIMetrics.makeCommandInstallInput")(function* ({
  dataRoot,
  hashSaltSecretRef,
  rawArchiveKeySecretRef,
  target,
}: {
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const resolvedDataRoot = O.getOrUndefined(dataRoot);
  const resolvedHashSaltSecretRef = yield* requireHashSaltSecretRefForTarget({
    hashSaltSecretRef: yield* resolveHashSaltSecretRef(hashSaltSecretRef),
    target,
  });
  const resolvedRawArchiveKeySecretRef = yield* requireRawArchiveKeySecretRefForTarget({
    rawArchiveKeySecretRef: yield* resolveRawArchiveKeySecretRef(rawArchiveKeySecretRef),
    target,
  });

  return new AiMetricsInstallInput({
    ...(resolvedDataRoot === undefined ? {} : { dataRoot: resolvedDataRoot }),
    ...(resolvedHashSaltSecretRef === undefined ? {} : { hashSaltSecretRef: resolvedHashSaltSecretRef }),
    ...(resolvedRawArchiveKeySecretRef === undefined ? {} : { rawArchiveKeySecretRef: resolvedRawArchiveKeySecretRef }),
    target,
  });
});

const makeCommandInstallSpec = Effect.fn("AIMetrics.makeCommandInstallSpec")(function* ({
  dataRoot,
  hashSaltSecretRef,
  rawArchiveKeySecretRef,
  target,
}: {
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  return yield* makeAiMetricsInstallSpec(
    yield* makeCommandInstallInput({ dataRoot, hashSaltSecretRef, rawArchiveKeySecretRef, target })
  );
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
  const duckDbLocation = spec.storage.duckDbPath;
  yield* Console.log(`derived duckdb: ${duckDbLocation}`);
  yield* Console.log(`privacy: ${spec.privacyMode}`);
  yield* Console.log(`default tool: ${spec.defaultTool}`);
});

const defaultServiceEndpoint = Effect.fn("AIMetrics.defaultServiceEndpoint")(function* (
  spec: AiMetricsInstallSpec,
  otlpBaseUrl: O.Option<string>
) {
  const service = pipe(
    spec.services,
    A.findFirst((candidate) => candidate.enabledByDefault)
  );

  if (O.isNone(service)) {
    return yield* new AiMetricsCommandError({
      cause: spec.defaultTool,
      message: "AI metrics install spec does not contain an enabled backend service.",
    });
  }

  if (O.isNone(otlpBaseUrl)) {
    return service.value.otlp;
  }

  const baseUrl = pipe(otlpBaseUrl.value, Str.replace(/\/+$/u, ""));
  return new AiMetricsOtlpEndpointSpec({
    baseUrl,
    protocol: service.value.otlp.protocol,
    resourceAttributes: service.value.otlp.resourceAttributes,
    signalScope: service.value.otlp.signalScope,
    traceUrl: `${baseUrl}/v1/traces`,
  });
});

const serverObservabilityConfigFor = (
  target: AiMetricsDeployTarget,
  endpoint: AiMetricsOtlpEndpointSpec
): ServerObservabilityConfig =>
  new ServerObservabilityConfig({
    devtoolsEnabled: false,
    devtoolsUrl: "ws://localhost:34437",
    environment: target,
    minLogLevel: "Info",
    otlpBaseUrl: endpoint.baseUrl,
    otlpEnabled: true,
    otlpResourceAttributes: endpoint.resourceAttributes,
    prometheusPrefix: "beep_ai_metrics",
    serviceName: "beep-ai-metrics",
    serviceVersion: "0.0.0",
  });

const makeInstallPreviewProgram = Effect.fn("AIMetrics.makeInstallPreviewProgram")(function* ({
  hashSaltSecretRef,
  json,
  rawArchiveKeySecretRef,
  target,
  tool,
}: {
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
  readonly tool: AiMetricsTool;
}) {
  const resolvedHashSaltSecretRef = yield* requireHashSaltSecretRefForTarget({
    hashSaltSecretRef: yield* resolveHashSaltSecretRef(hashSaltSecretRef),
    target,
  });
  const resolvedRawArchiveKeySecretRef = yield* requireRawArchiveKeySecretRefForTarget({
    rawArchiveKeySecretRef: yield* resolveRawArchiveKeySecretRef(rawArchiveKeySecretRef),
    target,
  });
  const spec = yield* makeAiMetricsInstallSpec(
    new AiMetricsInstallInput({
      defaultTool: tool,
      ...(resolvedHashSaltSecretRef === undefined ? {} : { hashSaltSecretRef: resolvedHashSaltSecretRef }),
      ...(resolvedRawArchiveKeySecretRef === undefined
        ? {}
        : { rawArchiveKeySecretRef: resolvedRawArchiveKeySecretRef }),
      privacyMode: AiMetricsPrivacyMode.Enum.encrypted_raw_redacted_ui,
      target,
    })
  );

  yield* renderInstallSpec(spec, json);
});

const makeInstallComposeProgram = Effect.fn("AIMetrics.makeInstallComposeProgram")(function* ({
  json,
  target,
  tool,
}: {
  readonly json: boolean;
  readonly target: AiMetricsDeployTarget;
  readonly tool: AiMetricsTool;
}) {
  const spec = yield* makeAiMetricsInstallSpec(
    new AiMetricsInstallInput({
      defaultTool: tool,
      privacyMode: AiMetricsPrivacyMode.Enum.encrypted_raw_redacted_ui,
      target,
    })
  );
  const compose = yield* renderAiMetricsLocalPhoenixCompose(spec);

  if (json) {
    yield* Console.log(
      yield* encodeCommandJson({
        compose,
        target,
        tool,
      })
    );
    return;
  }

  yield* Console.log(compose);
});

const renderInstallPlan = Effect.fn("AIMetrics.renderInstallPlan")(function* (
  plan: AiMetricsInstallPlan,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* aiMetricsInstallPlanToJson(plan));
    return;
  }

  yield* Console.log(`ai-metrics install plan: target=${plan.target}`);
  yield* Console.log(`stack: ${plan.stackName}`);
  yield* Console.log(`dry-run-only: ${plan.dryRunOnly}`);
  for (const step of plan.steps) {
    yield* Console.log(`${step.order}. ${step.stepId}: ${step.command}`);
  }
});

const makeInstallPlanProgram = Effect.fn("AIMetrics.makeInstallPlanProgram")(function* ({
  dataRoot,
  hashSaltSecretRef,
  json,
  rawArchiveKeySecretRef,
  target,
}: {
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const input = yield* makeCommandInstallInput({ dataRoot, hashSaltSecretRef, rawArchiveKeySecretRef, target });
  const plan = yield* makeAiMetricsInstallPlan(input);
  yield* renderInstallPlan(plan, json);
});

const renderInstallDoctor = Effect.fn("AIMetrics.renderInstallDoctor")(function* (
  result: AiMetricsInstallDoctorResult,
  json: boolean
) {
  if (json) {
    yield* Console.log(yield* aiMetricsInstallDoctorToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics install doctor: target=${result.target} status=${result.status}`);
  yield* Console.log(`available sources: ${result.availableSourceCount}`);
  for (const check of result.checks) {
    yield* Console.log(`${check.status} ${check.checkId}: ${check.message}`);
  }
});

const makeInstallDoctorProgram = Effect.fn("AIMetrics.makeInstallDoctorProgram")(function* ({
  all,
  dataRoot,
  hashSalt,
  hashSaltSecretRef,
  homeDir,
  json,
  maxFiles,
  openClawUnit,
  rawArchiveKeySecretRef,
  repoRoot,
  since,
  target,
}: {
  readonly all: boolean;
  readonly dataRoot: O.Option<string>;
  readonly hashSalt: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly homeDir: O.Option<string>;
  readonly json: boolean;
  readonly maxFiles: number;
  readonly openClawUnit: O.Option<string>;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly repoRoot: O.Option<string>;
  readonly since: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const install = yield* makeCommandInstallInput({ dataRoot, hashSaltSecretRef, rawArchiveKeySecretRef, target });
  const resolvedHashSalt = yield* resolveHashSalt(hashSalt);
  const sinceEpochMillis = all ? undefined : yield* parseSinceEpochMillis(since);
  const sourceDiscovery = yield* discoverAiMetricsSources(
    new AiMetricsSourceDiscoveryInput({
      homeDir: yield* resolveHomeDir(homeDir),
      includeAll: all,
      maxFiles,
      repoRoot: yield* resolveRepoRoot(repoRoot),
      target: AiMetricsDeployTarget.Enum.local,
      ...(resolvedHashSalt === undefined ? {} : { hashSalt: resolvedHashSalt }),
      ...(sinceEpochMillis === undefined ? {} : { sinceEpochMillis }),
      ...(O.isSome(openClawUnit) ? { openClawUnitPath: openClawUnit.value } : {}),
    })
  );
  const result = yield* makeAiMetricsInstallDoctorResult(
    new AiMetricsInstallDoctorInput({
      install,
      sourceDiscovery,
    })
  );

  yield* renderInstallDoctor(result, json);
  if (result.status === AiMetricsInstallDoctorStatus.Enum.failed) {
    process.exitCode = 1;
  }
});

const makeInstallApplyProgram = Effect.fn("AIMetrics.makeInstallApplyProgram")(function* ({
  dataRoot,
  dryRun,
  hashSaltSecretRef,
  json,
  rawArchiveKeySecretRef,
  target,
}: {
  readonly dataRoot: O.Option<string>;
  readonly dryRun: boolean;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  if (!dryRun) {
    return yield* new AiMetricsCommandError({
      cause: "install apply",
      message:
        "AI metrics CLI install apply is dry-run-only. Pass --dry-run; real dankserver mutation is owned by the Pulumi P5b stack.",
    });
  }

  const input = yield* makeCommandInstallInput({ dataRoot, hashSaltSecretRef, rawArchiveKeySecretRef, target });
  const result = yield* makeAiMetricsInstallApplyDryRunResult(input);

  if (json) {
    yield* Console.log(yield* aiMetricsInstallApplyDryRunToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics install apply: target=${result.target} dry-run=${result.dryRun}`);
  yield* Console.log(result.message);
  for (const step of result.plan.steps) {
    yield* Console.log(`${step.order}. ${step.stepId}: ${step.command}`);
  }
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

  const sourceHash = summary.sourcePathHash;
  yield* Console.log(`ai-metrics ingest: ${summary.sourceKind} sourceHash=${sourceHash}`);
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
          message: "Failed to inspect privacy input.",
        })
    )
  );

  if (stat.type === "File") {
    return [inputPath];
  }

  if (stat.type !== "Directory") {
    return yield* new AiMetricsCommandError({
      cause: stat.type,
      message: "Expected --input to be a transcript file or directory.",
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
              message: "Failed to read transcript input.",
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
    yield* Console.log(
      `${source.sourceKind}: ${source.status} files=${source.fileCount} candidates=${source.candidateFileCount} limited=${source.limitedByMaxFiles}`
    );
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
  all,
  dataRoot,
  hashSalt,
  hashSaltSecretRef,
  homeDir,
  json,
  maxFiles,
  openClawUnit,
  otlp,
  otlpBaseUrl,
  rawArchiveKeySecretRef,
  repoRoot,
  since,
  target,
}: {
  readonly all: boolean;
  readonly dataRoot: O.Option<string>;
  readonly hashSalt: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly homeDir: O.Option<string>;
  readonly json: boolean;
  readonly maxFiles: number;
  readonly openClawUnit: O.Option<string>;
  readonly otlp: boolean;
  readonly otlpBaseUrl: O.Option<string>;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly repoRoot: O.Option<string>;
  readonly since: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const resolvedHashSalt = yield* requireHashSaltForTarget({
    hashSalt: yield* resolveHashSalt(hashSalt),
    target,
  });
  const resolvedHashSaltSecretRef = yield* requireHashSaltSecretRefForTarget({
    hashSaltSecretRef: yield* resolveHashSaltSecretRef(hashSaltSecretRef),
    target,
  });
  const resolvedRawArchiveKeySecretRef = yield* requireRawArchiveKeySecretRefForTarget({
    rawArchiveKeySecretRef: yield* resolveRawArchiveKeySecretRef(rawArchiveKeySecretRef),
    target,
  });
  const resolvedDataRoot = O.getOrUndefined(p6aCollectorDataRoot(dataRoot, target));
  const spec = yield* makeAiMetricsInstallSpec(
    new AiMetricsInstallInput({
      ...(resolvedDataRoot === undefined ? {} : { dataRoot: resolvedDataRoot }),
      ...(resolvedHashSaltSecretRef === undefined ? {} : { hashSaltSecretRef: resolvedHashSaltSecretRef }),
      ...(resolvedRawArchiveKeySecretRef === undefined
        ? {}
        : { rawArchiveKeySecretRef: resolvedRawArchiveKeySecretRef }),
      target,
    })
  );
  const resolvedRawArchiveKey = yield* resolveRawArchiveKey();
  const sinceEpochMillis = all ? undefined : yield* parseSinceEpochMillis(since);
  const forwarderEffect = runAiMetricsForwarder(
    new AiMetricsForwarderInput({
      ...(resolvedDataRoot === undefined ? {} : { dataRoot: resolvedDataRoot }),
      ...(resolvedHashSalt === undefined ? {} : { hashSalt: resolvedHashSalt }),
      ...(resolvedHashSaltSecretRef === undefined ? {} : { hashSaltSecretRef: resolvedHashSaltSecretRef }),
      ...(resolvedRawArchiveKeySecretRef === undefined
        ? {}
        : { rawArchiveKeySecretRef: resolvedRawArchiveKeySecretRef }),
      homeDir: yield* resolveHomeDir(homeDir),
      includeAll: all,
      maxFiles,
      ...(O.isSome(openClawUnit) ? { openClawUnitPath: openClawUnit.value } : {}),
      rawArchiveKey: resolvedRawArchiveKey,
      repoRoot: yield* resolveRepoRoot(repoRoot),
      ...(sinceEpochMillis === undefined ? {} : { sinceEpochMillis }),
      target,
    })
  ).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: spec.storage.duckDbPath })))
  );
  const result = otlp
    ? yield* forwarderEffect.pipe(
        // @effect-diagnostics-next-line strictEffectProvide:off
        Effect.provide(
          layerNodeSdkServerTraces(
            serverObservabilityConfigFor(target, yield* defaultServiceEndpoint(spec, otlpBaseUrl))
          )
        )
      )
    : yield* forwarderEffect;

  if (json) {
    yield* Console.log(yield* forwarderRunResultToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics forwarder: target=${target}`);
  yield* Console.log(`ingest run: ${result.ingestRunId}`);
  yield* Console.log(`source files: ${result.sourceFileCount}`);
  yield* Console.log(`archive objects: ${result.archiveObjectCount}`);
  yield* Console.log(`turns: ${result.turnCount}`);
  yield* Console.log(`raw archive: ${result.rawArchiveDir}`);
  for (const source of result.sourceCoverage) {
    yield* Console.log(
      `${source.sourceKind}: included=${source.includedFileCount} candidates=${source.candidateFileCount} limited=${source.limitedByMaxFiles}`
    );
  }
  const duckDbLocation = result.duckDbPath;
  const parquetLocation = result.parquetExportDir;
  yield* Console.log(`derived duckdb: ${duckDbLocation}`);
  yield* Console.log(`parquet export: ${parquetLocation}`);
});

const makeForwarderTimerProgram = Effect.fn("AIMetrics.makeForwarderTimerProgram")(function* ({
  dataRoot,
  hashSaltSecretRef,
  intervalMinutes,
  json,
  otlpBaseUrl,
  rawArchiveKeySecretRef,
  repoRoot,
  target,
}: {
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly intervalMinutes: number;
  readonly json: boolean;
  readonly otlpBaseUrl: O.Option<string>;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly repoRoot: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const resolvedDataRoot = p6aCollectorDataRoot(dataRoot, target);
  const spec = yield* makeCommandInstallSpec({
    dataRoot: resolvedDataRoot,
    hashSaltSecretRef,
    rawArchiveKeySecretRef,
    target,
  });
  const endpoint = yield* defaultServiceEndpoint(spec, otlpBaseUrl);
  const resolvedHashSaltSecretRef = yield* requireHashSaltSecretRefForTarget({
    hashSaltSecretRef: yield* resolveHashSaltSecretRef(hashSaltSecretRef),
    target,
  });
  const resolvedRawArchiveKeySecretRef = yield* requireRawArchiveKeySecretRefForTarget({
    rawArchiveKeySecretRef: yield* resolveRawArchiveKeySecretRef(rawArchiveKeySecretRef),
    target,
  });
  const dataRootFlag = ` --data-root ${spec.storage.dataRoot}`;
  const hashSaltSecretRefFlagText =
    resolvedHashSaltSecretRef === undefined ? "" : ` --hash-salt-secret-ref ${shellQuote(resolvedHashSaltSecretRef)}`;
  const rawArchiveKeySecretRefFlagText =
    resolvedRawArchiveKeySecretRef === undefined
      ? ""
      : ` --raw-archive-key-secret-ref ${shellQuote(resolvedRawArchiveKeySecretRef)}`;
  const otlpFlagText =
    target === AiMetricsDeployTarget.Enum.dankserver ? ` --otlp --otlp-base-url ${endpoint.baseUrl}` : "";
  const plan = renderAiMetricsForwarderTimerPlan(
    new AiMetricsForwarderTimerInput({
      command: `bun run beep ai-metrics forwarder run --target ${target}${dataRootFlag}${hashSaltSecretRefFlagText}${rawArchiveKeySecretRefFlagText}${otlpFlagText} --json`,
      ...(resolvedHashSaltSecretRef === undefined ? {} : { hashSaltSecretRef: resolvedHashSaltSecretRef }),
      intervalMinutes,
      lockPath: "%t/beep-ai-metrics-forwarder.lock",
      ...(resolvedRawArchiveKeySecretRef === undefined
        ? {}
        : { rawArchiveKeySecretRef: resolvedRawArchiveKeySecretRef }),
      statusPath: `${spec.storage.dataRoot}/forwarder/status/latest.json`,
      workingDirectory: yield* resolveRepoRoot(repoRoot),
    })
  );

  if (json) {
    yield* Console.log(yield* forwarderTimerPlanToJson(plan));
    return;
  }

  yield* Console.log(`# ${plan.serviceUnitName}`);
  yield* Console.log(plan.serviceUnit);
  yield* Console.log(`# ${plan.timerUnitName}`);
  yield* Console.log(plan.timerUnit);
  yield* Console.log("# install commands");
  for (const command of plan.installCommands) {
    yield* Console.log(command);
  }
});

const makeOtlpExportProgram = Effect.fn("AIMetrics.makeOtlpExportProgram")(function* ({
  dataRoot,
  hashSaltSecretRef,
  ingestRunId,
  json,
  otlpBaseUrl,
  rawArchiveKeySecretRef,
  target,
}: {
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly ingestRunId: string;
  readonly json: boolean;
  readonly otlpBaseUrl: O.Option<string>;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const resolvedDataRoot = O.getOrUndefined(p6aCollectorDataRoot(dataRoot, target));
  const resolvedHashSaltSecretRef = yield* requireHashSaltSecretRefForTarget({
    hashSaltSecretRef: yield* resolveHashSaltSecretRef(hashSaltSecretRef),
    target,
  });
  const resolvedRawArchiveKeySecretRef = yield* requireRawArchiveKeySecretRefForTarget({
    rawArchiveKeySecretRef: yield* resolveRawArchiveKeySecretRef(rawArchiveKeySecretRef),
    target,
  });
  const spec = yield* makeAiMetricsInstallSpec(
    new AiMetricsInstallInput({
      ...(resolvedDataRoot === undefined ? {} : { dataRoot: resolvedDataRoot }),
      ...(resolvedHashSaltSecretRef === undefined ? {} : { hashSaltSecretRef: resolvedHashSaltSecretRef }),
      ...(resolvedRawArchiveKeySecretRef === undefined
        ? {}
        : { rawArchiveKeySecretRef: resolvedRawArchiveKeySecretRef }),
      target,
    })
  );
  const endpoint = yield* defaultServiceEndpoint(spec, otlpBaseUrl);
  const result = yield* runAiMetricsOtlpExport(
    new AiMetricsOtlpExportInput({
      duckDbPath: spec.storage.duckDbPath,
      endpoint,
      ingestRunId,
      target,
    })
  ).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(
      Layer.mergeAll(
        DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: spec.storage.duckDbPath })),
        layerNodeSdkServerTraces(serverObservabilityConfigFor(target, endpoint))
      )
    )
  );

  if (json) {
    yield* Console.log(yield* otlpExportResultToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics otlp export: target=${target}`);
  yield* Console.log(`ingest run: ${result.ingestRunId}`);
  yield* Console.log(`spans: ${result.spanCount}`);
  yield* Console.log(`sessions: ${result.sessionSpanCount}`);
  yield* Console.log(`turns: ${result.turnSpanCount}`);
  yield* Console.log(`trace endpoint: ${result.endpointTraceUrl}`);
});

const makeBenchmarkRunProgram = Effect.fn("AIMetrics.makeBenchmarkRunProgram")(function* ({
  caseId,
  configSnapshotId,
  dataRoot,
  elapsedMs,
  hashSaltSecretRef,
  json,
  note,
  passed,
  qualityGate,
  rawArchiveKeySecretRef,
  target,
}: {
  readonly caseId: string;
  readonly configSnapshotId: string;
  readonly dataRoot: O.Option<string>;
  readonly elapsedMs: number;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly note: O.Option<string>;
  readonly passed: boolean;
  readonly qualityGate: AiMetricsQualityGateStatus;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const spec = yield* makeCommandInstallSpec({
    dataRoot: p6aCollectorDataRoot(dataRoot, target),
    hashSaltSecretRef,
    rawArchiveKeySecretRef,
    target,
  });
  const result = yield* recordAiMetricsBenchmarkRun(
    new AiMetricsBenchmarkRunInput({
      benchmarkCaseId: caseId,
      configSnapshotId,
      elapsedMs,
      passed,
      qualityGate,
      ...(O.isSome(note) ? { note: note.value } : {}),
    })
  ).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: spec.storage.duckDbPath })))
  );

  if (json) {
    yield* Console.log(yield* aiMetricsBenchmarkRunToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics benchmark run: ${result.benchmarkRunId}`);
  yield* Console.log(`case: ${result.benchmarkCaseId}`);
  yield* Console.log(`config: ${result.configSnapshotId}`);
  yield* Console.log(`passed: ${result.passed}`);
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

const makeLabelQueueProgram = Effect.fn("AIMetrics.makeLabelQueueProgram")(function* ({
  dataRoot,
  hashSaltSecretRef,
  json,
  limit,
  rawArchiveKeySecretRef,
  since,
  target,
  until,
}: {
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly limit: number;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly since: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
  readonly until: O.Option<string>;
}) {
  const spec = yield* makeCommandInstallSpec({
    dataRoot: p6aCollectorDataRoot(dataRoot, target),
    hashSaltSecretRef,
    rawArchiveKeySecretRef,
    target,
  });
  const window = yield* parseWindow({ since, until });
  const result = yield* queueAiMetricsLabels(
    new AiMetricsLabelQueueInput({
      limit,
      target,
      windowEndEpochMillis: window.windowEndEpochMillis,
      windowStartEpochMillis: window.windowStartEpochMillis,
    })
  ).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: spec.storage.duckDbPath })))
  );

  if (json) {
    yield* Console.log(yield* aiMetricsLabelQueueToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics label queue: target=${target}`);
  yield* Console.log(`items: ${A.length(result.items)}`);
  for (const item of result.items) {
    yield* Console.log(`${item.agentTaskId} config=${item.configSnapshotId} turns=${item.turnCount}`);
  }
});

const makeLabelAddProgram = Effect.fn("AIMetrics.makeLabelAddProgram")(function* ({
  dataRoot,
  followUpFix,
  hashSaltSecretRef,
  interventions,
  json,
  note,
  passed,
  qualityGate,
  rating,
  rawArchiveKeySecretRef,
  target,
  taskId,
}: {
  readonly dataRoot: O.Option<string>;
  readonly followUpFix: boolean;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly interventions: number;
  readonly json: boolean;
  readonly note: O.Option<string>;
  readonly passed: boolean;
  readonly qualityGate: AiMetricsQualityGateStatus;
  readonly rating: number;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
  readonly taskId: string;
}) {
  const spec = yield* makeCommandInstallSpec({
    dataRoot: p6aCollectorDataRoot(dataRoot, target),
    hashSaltSecretRef,
    rawArchiveKeySecretRef,
    target,
  });
  const result = yield* addAiMetricsOutcomeLabel(
    new AiMetricsOutcomeLabelInput({
      agentTaskId: taskId,
      followUpFix,
      interventionCount: interventions,
      passed,
      qualityGate,
      rating,
      ...(O.isSome(note) ? { note: note.value } : {}),
    })
  ).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: spec.storage.duckDbPath })))
  );

  if (json) {
    yield* Console.log(yield* aiMetricsOutcomeLabelToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics label add: ${result.labelId}`);
  yield* Console.log(`task: ${result.agentTaskId}`);
  yield* Console.log(`passed: ${result.passed}`);
});

const makeBenchmarkCaseAddProgram = Effect.fn("AIMetrics.makeBenchmarkCaseAddProgram")(function* ({
  caseId,
  checks,
  dataRoot,
  hashSaltSecretRef,
  json,
  promptHash,
  promptRef,
  rawArchiveKeySecretRef,
  target,
  title,
}: {
  readonly caseId: string;
  readonly checks: string;
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly promptHash: string;
  readonly promptRef: O.Option<string>;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
  readonly title: string;
}) {
  const spec = yield* makeCommandInstallSpec({
    dataRoot: p6aCollectorDataRoot(dataRoot, target),
    hashSaltSecretRef,
    rawArchiveKeySecretRef,
    target,
  });
  const result = yield* upsertAiMetricsBenchmarkCase(
    new AiMetricsBenchmarkCaseInput({
      benchmarkCaseId: caseId,
      expectedChecks: parseChecks(checks),
      promptHash,
      title,
      ...(O.isSome(promptRef) ? { promptRef: promptRef.value } : {}),
    })
  ).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: spec.storage.duckDbPath })))
  );

  if (json) {
    yield* Console.log(yield* aiMetricsBenchmarkCaseToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics benchmark case add: ${result.benchmarkCaseId}`);
  yield* Console.log(`checks: ${A.length(result.expectedChecks)}`);
});

const makeBenchmarkCaseListProgram = Effect.fn("AIMetrics.makeBenchmarkCaseListProgram")(function* ({
  dataRoot,
  hashSaltSecretRef,
  json,
  rawArchiveKeySecretRef,
  target,
}: {
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const spec = yield* makeCommandInstallSpec({
    dataRoot: p6aCollectorDataRoot(dataRoot, target),
    hashSaltSecretRef,
    rawArchiveKeySecretRef,
    target,
  });
  const result = yield* listAiMetricsBenchmarkCases.pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: spec.storage.duckDbPath })))
  );

  if (json) {
    yield* Console.log(yield* aiMetricsBenchmarkCaseListToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics benchmark case list: ${A.length(result.cases)}`);
  for (const benchmarkCase of result.cases) {
    yield* Console.log(`${benchmarkCase.benchmarkCaseId}: ${benchmarkCase.title}`);
  }
});

const makeWeeklyReportProgram = Effect.fn("AIMetrics.makeWeeklyReportProgram")(function* ({
  dataRoot,
  hashSaltSecretRef,
  json,
  rawArchiveKeySecretRef,
  since,
  target,
  until,
}: {
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly since: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
  readonly until: O.Option<string>;
}) {
  const path = yield* Path.Path;
  const spec = yield* makeCommandInstallSpec({
    dataRoot: p6aCollectorDataRoot(dataRoot, target),
    hashSaltSecretRef,
    rawArchiveKeySecretRef,
    target,
  });
  const window = yield* parseWindow({ since, until });
  const result = yield* generateAiMetricsWeeklyReport(
    new AiMetricsWeeklyReportInput({
      reportDir: path.join(spec.storage.dataRoot, "reports"),
      target,
      windowEndEpochMillis: window.windowEndEpochMillis,
      windowStartEpochMillis: window.windowStartEpochMillis,
    })
  ).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: spec.storage.duckDbPath })))
  );

  if (json) {
    yield* Console.log(yield* aiMetricsWeeklyReportToJson(result));
    return;
  }

  yield* Console.log(`ai-metrics report weekly: target=${target}`);
  yield* Console.log(`scorecards: ${A.length(result.document.scores)}`);
  yield* Console.log(`markdown: ${result.markdownPath}`);
  yield* Console.log(`json: ${result.jsonPath}`);
});

const makeArchiveDrillProgram = Effect.fn("AIMetrics.makeArchiveDrillProgram")(function* ({
  dataRoot,
  hashSaltSecretRef,
  json,
  rawArchiveKeySecretRef,
  target,
}: {
  readonly dataRoot: O.Option<string>;
  readonly hashSaltSecretRef: O.Option<string>;
  readonly json: boolean;
  readonly rawArchiveKeySecretRef: O.Option<string>;
  readonly target: AiMetricsDeployTarget;
}) {
  const spec = yield* makeCommandInstallSpec({
    dataRoot: p6aCollectorDataRoot(dataRoot, target),
    hashSaltSecretRef,
    rawArchiveKeySecretRef,
    target,
  });
  const rawArchiveKey = yield* resolveRawArchiveKey();
  const result = yield* Effect.gen(function* () {
    const duckdb = yield* DuckDb;
    const rows = yield* duckdb
      .query(
        `SELECT archive_object_id AS "archiveObjectId",
                archive_path AS "archivePath",
                plaintext_content_hash AS "plaintextContentHash"
         FROM ai_metrics_raw_archive_objects
         ORDER BY encrypted_at_epoch_ms DESC
         LIMIT 1`
      )
      .pipe(
        Effect.mapError(
          (cause) =>
            new AiMetricsCommandError({
              cause,
              message: "Failed to select an AI metrics archive object for the decrypt drill.",
            })
        )
      );
    const decoded = yield* decodeArchiveDrillRows(rows).pipe(
      Effect.mapError(
        (cause) =>
          new AiMetricsCommandError({
            cause,
            message: "Failed to decode AI metrics archive drill rows.",
          })
      )
    );
    const row = A.head(decoded);
    if (O.isNone(row)) {
      return yield* new AiMetricsCommandError({
        cause: "ai_metrics_raw_archive_objects",
        message: "No AI metrics raw archive object is available for a decrypt drill.",
      });
    }

    const envelope = yield* readEncryptedRawArchiveEnvelope(row.value.archivePath);
    const plaintext = yield* decryptEncryptedRawArchiveEnvelope({ envelope, rawArchiveKey });
    const plaintextHash = yield* hashPublicTextSha256(plaintext);
    const plaintextHashMatches = plaintextHash === row.value.plaintextContentHash;
    if (!plaintextHashMatches) {
      return yield* new AiMetricsCommandError({
        cause: row.value.archiveObjectId,
        message: "AI metrics archive decrypt drill failed plaintext hash verification.",
      });
    }

    return {
      archiveObjectId: row.value.archiveObjectId,
      decryptedByteCount: new TextEncoder().encode(plaintext).byteLength,
      plaintextHashMatches,
      target,
    };
  }).pipe(
    // @effect-diagnostics-next-line strictEffectProvide:off
    Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: spec.storage.duckDbPath })))
  );

  if (json) {
    yield* Console.log(yield* encodeCommandJson(result));
    return;
  }

  yield* Console.log(`ai-metrics archive drill: target=${target}`);
  yield* Console.log(`archive object: ${result.archiveObjectId}`);
  yield* Console.log(`decrypted bytes: ${result.decryptedByteCount}`);
  yield* Console.log(`plaintext hash matches: ${result.plaintextHashMatches}`);
});

const installPreviewCommand = Command.make(
  "preview",
  {
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    target: targetFlag,
    tool: toolFlag,
  },
  ({ hashSaltSecretRef, json, rawArchiveKeySecretRef, target, tool }) =>
    runAiMetricsProgram(makeInstallPreviewProgram({ hashSaltSecretRef, json, rawArchiveKeySecretRef, target, tool }))
).pipe(Command.withDescription("Preview the target-agnostic AI metrics install spec"));

const installPlanCommand = Command.make(
  "plan",
  {
    dataRoot: dataRootFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    target: targetFlag,
  },
  ({ dataRoot, hashSaltSecretRef, json, rawArchiveKeySecretRef, target }) =>
    runAiMetricsProgram(makeInstallPlanProgram({ dataRoot, hashSaltSecretRef, json, rawArchiveKeySecretRef, target }))
).pipe(Command.withDescription("Render the typed P5a AI metrics install plan"));

const installDoctorCommand = Command.make(
  "doctor",
  {
    all: allFlag,
    dataRoot: dataRootFlag,
    hashSalt: hashSaltFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    homeDir: homeDirFlag,
    json: jsonFlag,
    maxFiles: maxFilesFlag,
    openClawUnit: openClawUnitFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    repoRoot: repoRootFlag,
    since: sinceFlag,
    target: targetFlag,
  },
  ({
    all,
    dataRoot,
    hashSalt,
    hashSaltSecretRef,
    homeDir,
    json,
    maxFiles,
    openClawUnit,
    rawArchiveKeySecretRef,
    repoRoot,
    since,
    target,
  }) =>
    runAiMetricsProgram(
      makeInstallDoctorProgram({
        all,
        dataRoot,
        hashSalt,
        hashSaltSecretRef,
        homeDir,
        json,
        maxFiles,
        openClawUnit,
        rawArchiveKeySecretRef,
        repoRoot,
        since,
        target,
      })
    )
).pipe(Command.withDescription("Validate the P5a AI metrics install contract without resolving secrets or SSH"));

const installApplyCommand = Command.make(
  "apply",
  {
    dataRoot: dataRootFlag,
    dryRun: dryRunFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    target: targetFlag,
  },
  ({ dataRoot, dryRun, hashSaltSecretRef, json, rawArchiveKeySecretRef, target }) =>
    runAiMetricsProgram(
      makeInstallApplyProgram({ dataRoot, dryRun, hashSaltSecretRef, json, rawArchiveKeySecretRef, target })
    )
).pipe(Command.withDescription("Dry-run the P5a AI metrics install apply workflow"));

const installComposeCommand = Command.make(
  "compose",
  {
    json: jsonFlag,
    target: targetFlag,
    tool: toolFlag,
  },
  ({ json, target, tool }) => runAiMetricsProgram(makeInstallComposeProgram({ json, target, tool }))
).pipe(Command.withDescription("Render the dedicated local Phoenix compose smoke target"));

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
    yield* Console.log("- bun run beep ai-metrics install plan --target local");
    yield* Console.log("- bun run beep ai-metrics install doctor --target local");
    yield* Console.log("- bun run beep ai-metrics install apply --target local --dry-run");
    yield* Console.log("- bun run beep ai-metrics install compose --target local");
    yield* Console.log("- bun run beep ai-metrics install preview --target dankserver");
  })
).pipe(
  Command.withDescription("AI metrics install workflow"),
  Command.withSubcommands([
    installPreviewCommand,
    installPlanCommand,
    installDoctorCommand,
    installApplyCommand,
    installComposeCommand,
  ])
);

const forwarderRunCommand = Command.make(
  "run",
  {
    all: allFlag,
    dataRoot: dataRootFlag,
    hashSalt: hashSaltFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    homeDir: homeDirFlag,
    json: jsonFlag,
    maxFiles: maxFilesFlag,
    openClawUnit: openClawUnitFlag,
    otlp: otlpFlag,
    otlpBaseUrl: otlpBaseUrlFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    repoRoot: repoRootFlag,
    since: sinceFlag,
    target: targetFlag,
  },
  ({
    all,
    dataRoot,
    hashSalt,
    hashSaltSecretRef,
    homeDir,
    json,
    maxFiles,
    openClawUnit,
    otlp,
    otlpBaseUrl,
    rawArchiveKeySecretRef,
    repoRoot,
    since,
    target,
  }) =>
    runAiMetricsProgram(
      makeForwarderRunProgram({
        all,
        dataRoot,
        hashSalt,
        hashSaltSecretRef,
        homeDir,
        json,
        maxFiles,
        openClawUnit,
        otlp,
        otlpBaseUrl,
        rawArchiveKeySecretRef,
        repoRoot,
        since,
        target,
      })
    )
).pipe(
  Command.withDescription("Run durable local transcript ingest into encrypted raw archive and derived DuckDB storage")
);

const forwarderTimerCommand = Command.make(
  "timer",
  {
    dataRoot: dataRootFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    intervalMinutes: intervalMinutesFlag,
    json: jsonFlag,
    otlpBaseUrl: otlpBaseUrlFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    repoRoot: repoRootFlag,
    target: targetFlag,
  },
  ({ dataRoot, hashSaltSecretRef, intervalMinutes, json, otlpBaseUrl, rawArchiveKeySecretRef, repoRoot, target }) =>
    runAiMetricsProgram(
      makeForwarderTimerProgram({
        dataRoot,
        hashSaltSecretRef,
        intervalMinutes,
        json,
        otlpBaseUrl,
        rawArchiveKeySecretRef,
        repoRoot,
        target,
      })
    )
).pipe(Command.withDescription("Render a workstation systemd user timer for live AI metrics collection"));

const forwarderCommand = Command.make(
  "forwarder",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics forwarder commands:");
    yield* Console.log("- bun run beep ai-metrics forwarder run --target local");
    yield* Console.log(
      "- bun run beep ai-metrics forwarder timer --target dankserver --hash-salt-secret-ref op://TBK/ai-metrics/hash-salt --raw-archive-key-secret-ref op://TBK/ai-metrics/raw-archive-key"
    );
  })
).pipe(
  Command.withDescription("AI metrics local forwarder workflow"),
  Command.withSubcommands([forwarderRunCommand, forwarderTimerCommand])
);

const otlpExportCommand = Command.make(
  "export",
  {
    dataRoot: dataRootFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    ingestRunId: ingestRunFlag,
    json: jsonFlag,
    otlpBaseUrl: otlpBaseUrlFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    target: targetFlag,
  },
  ({ dataRoot, hashSaltSecretRef, ingestRunId, json, otlpBaseUrl, rawArchiveKeySecretRef, target }) =>
    runAiMetricsProgram(
      makeOtlpExportProgram({
        dataRoot,
        hashSaltSecretRef,
        ingestRunId,
        json,
        otlpBaseUrl,
        rawArchiveKeySecretRef,
        target,
      })
    )
).pipe(Command.withDescription("Export redacted derived AI metrics spans through OTLP"));

const otlpCommand = Command.make(
  "otlp",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics OTLP commands:");
    yield* Console.log("- bun run beep ai-metrics otlp export --target local --ingest-run latest");
  })
).pipe(Command.withDescription("AI metrics OTLP export workflow"), Command.withSubcommands([otlpExportCommand]));

const benchmarkRunCommand = Command.make(
  "run",
  {
    caseId: caseFlag,
    configSnapshotId: configFlag,
    dataRoot: dataRootFlag,
    elapsedMs: elapsedMsFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    note: noteFlag,
    passed: passedValueFlag,
    qualityGate: qualityGateFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    target: targetFlag,
  },
  ({
    caseId,
    configSnapshotId,
    dataRoot,
    elapsedMs,
    hashSaltSecretRef,
    json,
    note,
    passed,
    qualityGate,
    rawArchiveKeySecretRef,
    target,
  }) =>
    runAiMetricsProgram(
      makeBenchmarkRunProgram({
        caseId,
        configSnapshotId,
        dataRoot,
        elapsedMs,
        hashSaltSecretRef,
        json,
        note,
        passed,
        qualityGate,
        rawArchiveKeySecretRef,
        target,
      })
    )
).pipe(Command.withDescription("Record a benchmark run result for a config snapshot"));

const benchmarkCaseAddCommand = Command.make(
  "add",
  {
    caseId: caseFlag,
    checks: checksFlag,
    dataRoot: dataRootFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    promptHash: promptHashFlag,
    promptRef: promptRefFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    target: targetFlag,
    title: titleFlag,
  },
  ({
    caseId,
    checks,
    dataRoot,
    hashSaltSecretRef,
    json,
    promptHash,
    promptRef,
    rawArchiveKeySecretRef,
    target,
    title,
  }) =>
    runAiMetricsProgram(
      makeBenchmarkCaseAddProgram({
        caseId,
        checks,
        dataRoot,
        hashSaltSecretRef,
        json,
        promptHash,
        promptRef,
        rawArchiveKeySecretRef,
        target,
        title,
      })
    )
).pipe(Command.withDescription("Add or replace a deploy-safe benchmark case"));

const benchmarkCaseListCommand = Command.make(
  "list",
  {
    dataRoot: dataRootFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    target: targetFlag,
  },
  ({ dataRoot, hashSaltSecretRef, json, rawArchiveKeySecretRef, target }) =>
    runAiMetricsProgram(
      makeBenchmarkCaseListProgram({ dataRoot, hashSaltSecretRef, json, rawArchiveKeySecretRef, target })
    )
).pipe(Command.withDescription("List deploy-safe benchmark cases"));

const benchmarkCaseCommand = Command.make(
  "case",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics benchmark case commands:");
    yield* Console.log("- bun run beep ai-metrics benchmark case add --case <id> --title <title> --prompt-hash <hash>");
    yield* Console.log("- bun run beep ai-metrics benchmark case list");
  })
).pipe(
  Command.withDescription("AI metrics benchmark case workflow"),
  Command.withSubcommands([benchmarkCaseAddCommand, benchmarkCaseListCommand])
);

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
    yield* Console.log("- bun run beep ai-metrics benchmark case add --case <id> --title <title> --prompt-hash <hash>");
    yield* Console.log("- bun run beep ai-metrics benchmark run --case <id> --config <snapshot> --passed true");
    yield* Console.log("- bun run beep ai-metrics benchmark compare");
  })
).pipe(
  Command.withDescription("AI metrics benchmark workflow"),
  Command.withSubcommands([benchmarkCaseCommand, benchmarkRunCommand, benchmarkCompareCommand])
);

const labelQueueCommand = Command.make(
  "queue",
  {
    dataRoot: dataRootFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    limit: limitFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    since: sinceFlag,
    target: targetFlag,
    until: untilFlag,
  },
  ({ dataRoot, hashSaltSecretRef, json, limit, rawArchiveKeySecretRef, since, target, until }) =>
    runAiMetricsProgram(
      makeLabelQueueProgram({ dataRoot, hashSaltSecretRef, json, limit, rawArchiveKeySecretRef, since, target, until })
    )
).pipe(Command.withDescription("List unlabeled AI metrics tasks"));

const labelAddCommand = Command.make(
  "add",
  {
    dataRoot: dataRootFlag,
    followUpFix: followUpFixValueFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    interventions: interventionsFlag,
    json: jsonFlag,
    note: noteFlag,
    passed: passedValueFlag,
    qualityGate: qualityGateFlag,
    rating: ratingFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    target: targetFlag,
    taskId: taskFlag,
  },
  ({
    dataRoot,
    followUpFix,
    hashSaltSecretRef,
    interventions,
    json,
    note,
    passed,
    qualityGate,
    rating,
    rawArchiveKeySecretRef,
    target,
    taskId,
  }) =>
    runAiMetricsProgram(
      makeLabelAddProgram({
        dataRoot,
        followUpFix,
        hashSaltSecretRef,
        interventions,
        json,
        note,
        passed,
        qualityGate,
        rating,
        rawArchiveKeySecretRef,
        target,
        taskId,
      })
    )
).pipe(Command.withDescription("Add or replace a structured human outcome label"));

const labelCommand = Command.make(
  "label",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics label commands:");
    yield* Console.log("- bun run beep ai-metrics label queue");
    yield* Console.log(
      "- bun run beep ai-metrics label queue --target dankserver --data-root .beep/ai-metrics --hash-salt-secret-ref op://TBK/ai-metrics/hash-salt --raw-archive-key-secret-ref op://TBK/ai-metrics/raw-archive-key"
    );
    yield* Console.log("- bun run beep ai-metrics label add --task <id> --passed true --rating 5");
  })
).pipe(
  Command.withDescription("AI metrics human label workflow"),
  Command.withSubcommands([labelQueueCommand, labelAddCommand])
);

const reportWeeklyCommand = Command.make(
  "weekly",
  {
    dataRoot: dataRootFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    since: sinceFlag,
    target: targetFlag,
    until: untilFlag,
  },
  ({ dataRoot, hashSaltSecretRef, json, rawArchiveKeySecretRef, since, target, until }) =>
    runAiMetricsProgram(
      makeWeeklyReportProgram({ dataRoot, hashSaltSecretRef, json, rawArchiveKeySecretRef, since, target, until })
    )
).pipe(Command.withDescription("Generate a weekly config-impact scorecard report"));

const reportCommand = Command.make(
  "report",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics report commands:");
    yield* Console.log("- bun run beep ai-metrics report weekly");
    yield* Console.log(
      "- bun run beep ai-metrics report weekly --target dankserver --data-root .beep/ai-metrics --hash-salt-secret-ref op://TBK/ai-metrics/hash-salt --raw-archive-key-secret-ref op://TBK/ai-metrics/raw-archive-key"
    );
  })
).pipe(Command.withDescription("AI metrics report workflow"), Command.withSubcommands([reportWeeklyCommand]));

const archiveDrillCommand = Command.make(
  "drill",
  {
    dataRoot: dataRootFlag,
    hashSaltSecretRef: hashSaltSecretRefFlag,
    json: jsonFlag,
    rawArchiveKeySecretRef: rawArchiveKeySecretRefFlag,
    target: targetFlag,
  },
  ({ dataRoot, hashSaltSecretRef, json, rawArchiveKeySecretRef, target }) =>
    runAiMetricsProgram(makeArchiveDrillProgram({ dataRoot, hashSaltSecretRef, json, rawArchiveKeySecretRef, target }))
).pipe(Command.withDescription("Decrypt one encrypted raw archive object without printing transcript text"));

const archiveCommand = Command.make(
  "archive",
  {},
  Effect.fn(function* () {
    yield* Console.log("AI metrics archive commands:");
    yield* Console.log("- bun run beep ai-metrics archive drill");
    yield* Console.log(
      "- bun run beep ai-metrics archive drill --target dankserver --data-root .beep/ai-metrics --hash-salt-secret-ref op://TBK/ai-metrics/hash-salt --raw-archive-key-secret-ref op://TBK/ai-metrics/raw-archive-key"
    );
  })
).pipe(
  Command.withDescription("AI metrics archive verification workflow"),
  Command.withSubcommands([archiveDrillCommand])
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
    yield* Console.log("- otlp export");
    yield* Console.log("- label queue");
    yield* Console.log("- label add");
    yield* Console.log("- benchmark run");
    yield* Console.log("- benchmark compare");
    yield* Console.log("- report weekly");
    yield* Console.log("- archive drill");
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
    otlpCommand,
    labelCommand,
    benchmarkCommand,
    reportCommand,
    archiveCommand,
  ])
);
