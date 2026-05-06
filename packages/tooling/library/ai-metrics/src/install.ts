/**
 * Target-agnostic install spec for repo AI metrics.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoAiMetricsId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { AiMetricsDeployTarget, AiMetricsPrivacyMode, AiMetricsScoreWeights, AiMetricsTool } from "./models.ts";

const $I = $RepoAiMetricsId.create("install");

const defaultCandidateTools = [
  AiMetricsTool.Enum.langfuse,
  AiMetricsTool.Enum.phoenix,
  AiMetricsTool.Enum.opik,
] as const;

const servicePort = (tool: AiMetricsTool): number => {
  if (tool === AiMetricsTool.Enum.langfuse) {
    return 3001;
  }

  if (tool === AiMetricsTool.Enum.phoenix) {
    return 6006;
  }

  if (tool === AiMetricsTool.Enum.opik) {
    return 5173;
  }

  return 8000;
};

const defaultDataRoot = (target: AiMetricsDeployTarget): string =>
  target === AiMetricsDeployTarget.Enum.dankserver ? "/srv/data/ai-metrics" : ".beep/ai-metrics";

const defaultPublicBaseUrl = (target: AiMetricsDeployTarget): string =>
  target === AiMetricsDeployTarget.Enum.dankserver ? "https://dankserver.tailc7c348.ts.net" : "http://127.0.0.1";

const childPath = (root: string, child: string): string => `${root}/${child}`;

const nonEmptyString = (value: string | undefined): O.Option<string> =>
  value === undefined || Str.isEmpty(Str.trim(value)) ? O.none() : O.some(value);

const requireHashSaltSecretRef = Effect.fn("AiMetrics.requireHashSaltSecretRef")(function* (
  target: AiMetricsDeployTarget,
  hashSaltSecretRef: string | undefined
) {
  const ref = nonEmptyString(hashSaltSecretRef);
  if (target === AiMetricsDeployTarget.Enum.local || O.isSome(ref)) {
    return ref;
  }

  return yield* new AiMetricsInstallConfigurationError({
    cause: { target },
    message:
      "AI metrics non-local installs require hashSaltSecretRef so private identifier hashing never uses the local smoke salt.",
  });
});

const requireRawArchiveKeySecretRef = Effect.fn("AiMetrics.requireRawArchiveKeySecretRef")(function* (
  target: AiMetricsDeployTarget,
  rawArchiveKeySecretRef: string | undefined
) {
  const ref = nonEmptyString(rawArchiveKeySecretRef);
  if (target === AiMetricsDeployTarget.Enum.local || O.isSome(ref)) {
    return ref;
  }

  return yield* new AiMetricsInstallConfigurationError({
    cause: { target },
    message:
      "AI metrics non-local installs require rawArchiveKeySecretRef so encrypted raw transcripts never depend on inline operator input.",
  });
});

/**
 * Error raised when an AI metrics install spec would be unsafe for the requested target.
 *
 * @example
 * ```ts
 * import { AiMetricsInstallConfigurationError } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsInstallConfigurationError)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsInstallConfigurationError extends TaggedErrorClass<AiMetricsInstallConfigurationError>(
  $I`AiMetricsInstallConfigurationError`
)(
  "AiMetricsInstallConfigurationError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AiMetricsInstallConfigurationError", {
    description:
      "Typed failure raised when a requested AI metrics install target is missing required safety configuration.",
  })
) {}

/**
 * Input for resolving an AI metrics install spec.
 *
 * @example
 * ```ts
 * import { AiMetricsInstallInput } from "@beep/repo-ai-metrics"
 * console.log(new AiMetricsInstallInput({}).target)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsInstallInput extends S.Class<AiMetricsInstallInput>($I`AiMetricsInstallInput`)(
  {
    candidateTools: S.Array(AiMetricsTool).pipe(
      S.withConstructorDefault(Effect.succeed(defaultCandidateTools)),
      S.withDecodingDefaultKey(Effect.succeed(defaultCandidateTools))
    ),
    dataRoot: S.optionalKey(S.String),
    defaultTool: AiMetricsTool.pipe(
      S.withConstructorDefault(Effect.succeed(AiMetricsTool.Enum.phoenix)),
      S.withDecodingDefaultKey(Effect.succeed(AiMetricsTool.Enum.phoenix))
    ),
    hashSaltSecretRef: S.optionalKey(S.String),
    litellmGatewayEnabled: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(true)),
      S.withDecodingDefaultKey(Effect.succeed(true))
    ),
    privacyMode: AiMetricsPrivacyMode.pipe(
      S.withConstructorDefault(Effect.succeed(AiMetricsPrivacyMode.Enum.encrypted_raw_redacted_ui)),
      S.withDecodingDefaultKey(Effect.succeed(AiMetricsPrivacyMode.Enum.encrypted_raw_redacted_ui))
    ),
    publicBaseUrl: S.optionalKey(S.String),
    rawArchiveKeySecretRef: S.optionalKey(S.String),
    target: AiMetricsDeployTarget.pipe(
      S.withConstructorDefault(Effect.succeed(AiMetricsDeployTarget.Enum.local)),
      S.withDecodingDefaultKey(Effect.succeed(AiMetricsDeployTarget.Enum.local))
    ),
    tailnetOnly: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(true)),
      S.withDecodingDefaultKey(Effect.succeed(true))
    ),
  },
  $I.annote("AiMetricsInstallInput", {
    description: "User-selectable inputs for the target-agnostic AI metrics install module.",
  })
) {}

/**
 * Storage layout resolved for an AI metrics target.
 *
 * @example
 * ```ts
 * import { AiMetricsStorageLayout } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsStorageLayout)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsStorageLayout extends S.Class<AiMetricsStorageLayout>($I`AiMetricsStorageLayout`)(
  {
    dataRoot: S.String,
    derivedDir: S.String,
    duckDbPath: S.String,
    parquetDir: S.String,
    rawArchiveDir: S.String,
  },
  $I.annote("AiMetricsStorageLayout", {
    description: "Canonical raw and derived storage paths for an AI metrics target.",
  })
) {}

/**
 * One candidate service in the local bakeoff or promoted install target.
 *
 * @example
 * ```ts
 * import { AiMetricsServiceSpec } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsServiceSpec)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsServiceSpec extends S.Class<AiMetricsServiceSpec>($I`AiMetricsServiceSpec`)(
  {
    enabledByDefault: S.Boolean,
    internalUrl: S.String,
    publicUrl: S.String,
    tool: AiMetricsTool,
  },
  $I.annote("AiMetricsServiceSpec", {
    description: "Candidate observability tool endpoint resolved for a target install.",
  })
) {}

/**
 * Resolved target-agnostic install spec for AI metrics.
 *
 * @example
 * ```ts
 * import { AiMetricsInstallSpec } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsInstallSpec)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsInstallSpec extends S.Class<AiMetricsInstallSpec>($I`AiMetricsInstallSpec`)(
  {
    candidateTools: S.Array(AiMetricsTool),
    defaultScoreWeights: AiMetricsScoreWeights,
    defaultTool: AiMetricsTool,
    hashSaltSecretRef: S.optionalKey(S.String),
    litellmGatewayEnabled: S.Boolean,
    plannedCommands: S.Array(S.String),
    privacyMode: AiMetricsPrivacyMode,
    rawArchiveKeySecretRef: S.optionalKey(S.String),
    services: S.Array(AiMetricsServiceSpec),
    stackName: S.String,
    storage: AiMetricsStorageLayout,
    tailnetOnly: S.Boolean,
    target: AiMetricsDeployTarget,
  },
  $I.annote("AiMetricsInstallSpec", {
    description: "Resolved install/deploy contract shared by the CLI installer and Pulumi orchestration.",
  })
) {}

const makeStorageLayout = (dataRoot: string): AiMetricsStorageLayout =>
  new AiMetricsStorageLayout({
    dataRoot,
    derivedDir: childPath(dataRoot, "derived"),
    duckDbPath: childPath(dataRoot, "derived/ai-metrics.duckdb"),
    parquetDir: childPath(dataRoot, "derived/parquet"),
    rawArchiveDir: childPath(dataRoot, "raw"),
  });

const makeServiceSpec =
  (defaultTool: AiMetricsTool, publicBaseUrl: string) =>
  (tool: AiMetricsTool): AiMetricsServiceSpec =>
    new AiMetricsServiceSpec({
      enabledByDefault: tool === defaultTool,
      internalUrl: `http://127.0.0.1:${servicePort(tool)}`,
      publicUrl: `${publicBaseUrl}/ai-metrics/${tool}`,
      tool,
    });

const withHashSaltSecret =
  (hashSaltSecretRef: O.Option<string>) =>
  (command: string): string =>
    pipe(
      hashSaltSecretRef,
      O.match({
        onNone: () => command,
        onSome: (ref) => `BEEP_AI_METRICS_HASH_SALT=<secret:${ref}> ${command}`,
      })
    );

const plannedCommands = (
  target: AiMetricsDeployTarget,
  storage: AiMetricsStorageLayout,
  hashSaltSecretRef: O.Option<string>,
  rawArchiveKeySecretRef: O.Option<string>
): ReadonlyArray<string> => [
  `mkdir -p ${storage.rawArchiveDir} ${storage.parquetDir}`,
  withHashSaltSecret(hashSaltSecretRef)(`beep-cli ai-metrics sources discover --target ${target}`),
  "beep-cli ai-metrics config snapshot",
  withHashSaltSecret(hashSaltSecretRef)("beep-cli ai-metrics privacy check --source codex --input ~/.codex/sessions"),
  pipe(
    rawArchiveKeySecretRef,
    O.match({
      onNone: () =>
        withHashSaltSecret(hashSaltSecretRef)(
          `BEEP_AI_METRICS_RAW_ARCHIVE_KEY=<base64-32-byte-key> beep-cli ai-metrics forwarder run --target ${target}`
        ),
      onSome: (rawRef) =>
        withHashSaltSecret(hashSaltSecretRef)(
          `BEEP_AI_METRICS_RAW_ARCHIVE_KEY=<secret:${rawRef}> beep-cli ai-metrics forwarder run --target ${target} --raw-archive-key-secret-ref ${rawRef}`
        ),
    })
  ),
];

/**
 * Resolve an install spec for the requested AI metrics target.
 *
 * @param input - Optional operator install preferences; omitted fields use the local target defaults.
 * @returns An effect that resolves the normalized install spec consumed by IaC and CLI planning.
 * @example
 * ```ts
 * import { makeAiMetricsInstallSpec } from "@beep/repo-ai-metrics"
 * import { Effect } from "effect"
 * const spec = Effect.runSync(makeAiMetricsInstallSpec())
 * console.log(spec.storage.rawArchiveDir)
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const makeAiMetricsInstallSpec: (
  input?: AiMetricsInstallInput
) => Effect.Effect<AiMetricsInstallSpec, AiMetricsInstallConfigurationError> = Effect.fn(
  "AiMetrics.makeAiMetricsInstallSpec"
)(function* (input: AiMetricsInstallInput = new AiMetricsInstallInput({})) {
  const dataRoot = input.dataRoot ?? defaultDataRoot(input.target);
  const publicBaseUrl = input.publicBaseUrl ?? defaultPublicBaseUrl(input.target);
  const hashSaltSecretRef = yield* requireHashSaltSecretRef(input.target, input.hashSaltSecretRef);
  const rawArchiveKeySecretRef = yield* requireRawArchiveKeySecretRef(input.target, input.rawArchiveKeySecretRef);
  const storage = makeStorageLayout(dataRoot);
  const services = A.map(input.candidateTools, makeServiceSpec(input.defaultTool, publicBaseUrl));

  return new AiMetricsInstallSpec({
    candidateTools: input.candidateTools,
    defaultScoreWeights: new AiMetricsScoreWeights({}),
    defaultTool: input.defaultTool,
    ...(O.isSome(hashSaltSecretRef) ? { hashSaltSecretRef: hashSaltSecretRef.value } : {}),
    litellmGatewayEnabled: input.litellmGatewayEnabled,
    plannedCommands: plannedCommands(input.target, storage, hashSaltSecretRef, rawArchiveKeySecretRef),
    privacyMode: input.privacyMode,
    ...(O.isSome(rawArchiveKeySecretRef) ? { rawArchiveKeySecretRef: rawArchiveKeySecretRef.value } : {}),
    services,
    stackName: `beep-ai-metrics-${input.target}`,
    storage,
    tailnetOnly: input.tailnetOnly,
    target: input.target,
  });
});
