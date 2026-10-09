/**
 * Disposable coding trial contracts and protected receipts.
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { AiMetricsBenchmarkRunInput } from "@beep/repo-ai-metrics/scorecard";
import { NativeTokenUsage } from "@beep/repo-ai-metrics/usage";
import { LiteralKit } from "@beep/schema";
import { Sha256Hex } from "@beep/schema/Sha256";
import * as S from "effect/Schema";
import { JsonStringCodec } from "../../internal/schema/JsonCodec.ts";
import {
  TrialArtifact,
  TrialEvaluatorCheck,
  TrialMount,
  TrialProductiveProfile,
  TrialProvider,
  TrialRuntimeClosure,
} from "./internal/TrialProfile.schemas.ts";

export { TrialArtifact, TrialMount, TrialProvider } from "./internal/TrialProfile.schemas.ts";

const $I = $RepoCliId.create("commands/AgentEffectiveness/AgentEffectiveness.trials.schemas");
/**
 * Mechanical completeness of the native event stream.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialCoverage } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialCoverage)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const TrialCoverage = LiteralKit([
  "complete",
  "missing-terminal",
  "malformed",
  "provider-error",
  "ambiguous-terminal",
]).pipe(
  $I.annoteSchema("TrialCoverage", {
    description: "Mechanical stream coverage; unknown or partial streams cannot count as complete measurements.",
  })
);
/**
 * Mechanical completeness of the native event stream.
 * @category models
 * @since 0.0.0
 */
export type TrialCoverage = typeof TrialCoverage.Type;
/**
 * Protected provider usage payload with its original stream position.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialNativeUsageSample } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialNativeUsageSample)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialNativeUsageSample extends S.Class<TrialNativeUsageSample>($I`TrialNativeUsageSample`)(
  { line: S.Natural, event: S.NonEmptyString, native: S.Unknown },
  $I.annote("TrialNativeUsageSample", {
    description: "Protected native usage payload only, with source line; never a content-free telemetry row.",
  })
) {}
/**
 * Observed host usage, adoption names and explicit coverage gaps.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialUsageReport } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialUsageReport)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialUsageReport extends S.Class<TrialUsageReport>($I`TrialUsageReport`)(
  {
    provider: TrialProvider,
    coverage: TrialCoverage,
    usage: NativeTokenUsage,
    eventCount: S.Natural,
    malformedLines: S.Array(S.Natural),
    toolNames: S.Array(S.NonEmptyString),
    selectedToolCalls: S.Natural.pipe(S.OptionFromNullOr),
    nativeSelectedToolCalls: S.Natural.pipe(S.OptionFromNullOr),
    cliSelectedToolCalls: S.Natural.pipe(S.OptionFromNullOr),
    adoptionCoverage: S.Literals(["native-only", "unavailable"]),
    childUsage: S.Literal("unavailable"),
    hostModels: S.Array(S.Struct({ model: S.NonEmptyString, line: S.Natural, source: S.NonEmptyString })),
    hostEfforts: S.Array(S.Struct({ effort: S.NonEmptyString, line: S.Natural, source: S.NonEmptyString })),
    identityCoverage: S.Literals(["model-and-effort", "model-only", "unknown"]),
    samples: S.Array(TrialNativeUsageSample),
  },
  $I.annote("TrialUsageReport", {
    description:
      "Protected parser receipt with native samples, explicit child-usage gap and exact selected-tool name matching.",
  })
) {}
/**
 * Observed host usage, adoption names and explicit coverage gaps.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialUsageReportJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialUsageReportJson.decodeOption("{}")) // None: required evidence is missing.
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const TrialUsageReportJson = JsonStringCodec(TrialUsageReport);

/**
 * Private native session identities with explicit source layers and incomplete child coverage.
 * **Example** (Reject absent provenance)
 * ```ts
 * import { TrialSessionIdentity } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialSessionIdentity)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialSessionIdentity extends S.Class<TrialSessionIdentity>($I`TrialSessionIdentity`)(
  {
    artifacts: S.Array(TrialArtifact),
    observations: S.Array(
      S.Struct({
        artifactDigest: Sha256Hex,
        line: S.Natural,
        model: S.NonEmptyString.pipe(S.OptionFromNullOr),
        effort: S.NonEmptyString.pipe(S.OptionFromNullOr),
        scope: S.Literals(["host", "child", "unknown"]),
        layer: S.Literals(["selected-turn-context", "provider-message", "selected-session-metadata"]),
      })
    ),
    malformedLines: S.Natural,
    childCoverage: S.Literal("unknown"),
  },
  $I.annote("TrialSessionIdentity", {
    description: "Private native source-bound identity observations; child completeness remains unknown.",
  })
) {}

/**
 * Frozen controls that must decode before a disposable attempt can start.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialPlan } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialPlan)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialPlan extends S.Class<TrialPlan>($I`TrialPlan`)(
  {
    schemaVersion: S.Literal("agent-trial-plan/v1"),
    runId: S.NonEmptyString.check(S.isPattern(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/)),
    attemptId: S.NonEmptyString.check(S.isPattern(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/)),
    provider: TrialProvider,
    model: S.NonEmptyString,
    effort: S.Literal("medium"),
    baseCommit: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
    sourceDigest: Sha256Hex,
    taskDigest: Sha256Hex,
    acceptanceDigest: Sha256Hex,
    configDigest: Sha256Hex,
    toolId: S.NonEmptyString,
    selectedToolNames: S.Array(S.NonEmptyString),
    requiredYeetLaneIds: S.NonEmptyArray(S.NonEmptyString).check(S.isUnique()),
    requiredTaskCheckIds: S.NonEmptyArray(S.NonEmptyString).check(S.isUnique()),
    requiredCheckSpecs: S.NonEmptyArray(
      S.Struct({
        id: S.NonEmptyString,
        commandTemplate: S.NonEmptyArray(S.NonEmptyString),
        inputBundleDigest: Sha256Hex,
        contractDigest: Sha256Hex,
      })
    ),
    fullYeetCheckSpec: S.optional(
      S.Struct({
        id: S.NonEmptyString,
        commandTemplate: S.NonEmptyArray(S.NonEmptyString),
        inputBundleDigest: Sha256Hex,
        contractDigest: Sha256Hex,
      })
    ),
    sourceRepository: S.NonEmptyString,
    workspaceRoot: S.NonEmptyString,
    receiptRoot: S.NonEmptyString,
    command: S.NonEmptyString,
    commandDigest: Sha256Hex,
    delegation: S.Literals(["disabled", "native-common"]),
    productiveProfile: S.optional(TrialProductiveProfile),
    baseBundle: S.optional(TrialArtifact),
    runtimeClosures: TrialRuntimeClosure.pipe(S.Array, S.optional),
    networkAdmission: S.Literals(["blocked-until-broker", "exact-authority-broker"]),
    args: S.Array(S.String),
    environment: S.Record(S.NonEmptyString, S.String),
    mounts: S.Array(TrialMount),
    promptPath: S.NonEmptyString,
    timeoutMs: S.Int.check(S.isGreaterThan(0)),
    isolationAttestationPath: S.NonEmptyString,
    isolationAttestationDigest: Sha256Hex,
  },
  $I.annote("TrialPlan", {
    description:
      "Protected frozen invocation controls. Decoding does not substitute for attestation, immutable mounts or canary proof.",
  })
) {}
/**
 * Frozen controls that must decode before a disposable attempt can start.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialPlanJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialPlanJson.decodeOption("{}")) // None: required evidence is missing.
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const TrialPlanJson = JsonStringCodec(TrialPlan);

const AttemptTerminal = S.Union([
  S.Struct({ status: S.Literal("awaiting-proof"), finalCommit: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)) }),
  S.Struct({ status: S.Literal("failed"), reason: S.NonEmptyString }),
  S.Struct({ status: S.Literal("aborted"), reason: S.NonEmptyString }),
]).pipe(S.toTaggedUnion("status"));
/**
 * Retained attempt outcome; completion alone cannot establish correctness.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialAttempt } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialAttempt)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialAttempt extends S.Class<TrialAttempt>($I`TrialAttempt`)(
  {
    schemaVersion: S.Literal("agent-trial-attempt/v1"),
    plan: TrialArtifact,
    sourceArchive: TrialArtifact.pipe(S.OptionFromNullOr),
    nativeInvocation: TrialArtifact.pipe(S.OptionFromNullOr),
    nativeSessionIdentity: S.optional(TrialSessionIdentity),
    runId: S.NonEmptyString,
    attemptId: S.NonEmptyString,
    baseCommit: S.String,
    workspace: S.NonEmptyString,
    elapsedMs: S.Natural,
    setupElapsedMs: S.Natural.pipe(S.OptionFromNullOr),
    codingElapsedMs: S.Natural.pipe(S.OptionFromNullOr),
    retentionElapsedMs: S.Natural.pipe(S.OptionFromNullOr),
    exitCode: S.Int.pipe(S.OptionFromNullOr),
    stdout: TrialArtifact,
    stderr: TrialArtifact,
    diff: TrialArtifact,
    bundle: TrialArtifact.pipe(S.OptionFromNullOr),
    indexStates: S.Array(TrialArtifact),
    usage: TrialUsageReport,
    terminal: AttemptTerminal,
  },
  $I.annote("TrialAttempt", {
    description:
      "Immutable attempt receipt; every failed/aborted attempt survives and no coding completion implies proof success.",
  })
) {}
/**
 * Retained attempt outcome; completion alone cannot establish correctness.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialAttemptJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialAttemptJson.decodeOption("{}")) // None: required evidence is missing.
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const TrialAttemptJson = JsonStringCodec(TrialAttempt);

/**
 * Evaluator canary evidence bound to controls and selected tools.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialIsolationAttestation } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialIsolationAttestation)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialIsolationAttestation extends S.Class<TrialIsolationAttestation>($I`TrialIsolationAttestation`)(
  {
    schemaVersion: S.Literal("agent-trial-isolation/v1"),
    configDigest: Sha256Hex,
    deniedPrivatePaths: S.Literal(true),
    deniedOtherArmQueries: S.Literal(true),
    deniedPush: S.Literal(true),
    indexReset: S.Literal(true),
    interruptedCleanup: S.Literal(true),
    delegationDisabled: S.Boolean,
    readWorkspace: S.Literal(true),
    writeWorkspace: S.Literal(true),
    localCommit: S.Literal(true),
    compiler: S.Literal(true),
    dependencyLinksContained: S.Literal(true),
    canonicalIndexRoot: S.Literal("/workspace"),
    exactDiscoveredToolNames: S.Array(S.NonEmptyString),
  },
  $I.annote("TrialIsolationAttestation", {
    description:
      "Digest-bound deterministic capability canaries; missing/false proofs block launch without a host-root fallback.",
  })
) {}

/**
 * Exact-commit required task checks, including required exports.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialAcceptance } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialAcceptance)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialAcceptance extends S.Class<TrialAcceptance>($I`TrialAcceptance`)(
  {
    schemaVersion: S.Literal("agent-trial-acceptance/v1"),
    taskDigest: Sha256Hex,
    acceptanceDigest: Sha256Hex,
    finalCommit: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
    requiredChecks: S.NonEmptyArray(
      S.Struct({
        id: S.NonEmptyString,
        passed: S.Boolean,
        inputBundleDigest: Sha256Hex,
        commandTemplate: S.NonEmptyArray(S.NonEmptyString),
        inputBundle: TrialArtifact,
        evaluatorContract: S.optional(TrialArtifact),
        nativeReport: S.optional(TrialArtifact),
        rootInventory: S.optional(TrialArtifact),
        gitMetadata: S.optional(S.Struct({ beforeDigest: Sha256Hex, afterDigest: Sha256Hex })),
        bindings: S.Struct({ candidate: S.NonEmptyString, sealed: S.NonEmptyString, output: S.NonEmptyString }),
        namespaceBindings: S.optional(
          S.Struct({ candidate: S.Literal("/workspace"), sealed: S.Literal("/sealed"), output: S.Literal("/output") })
        ),
        resolvedArgv: S.NonEmptyArray(S.NonEmptyString),
        cwd: S.NonEmptyString,
        filteredEnvironment: S.Record(S.String, S.String),
        invocationDigest: Sha256Hex,
        headBefore: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
        headAfter: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
        fingerprintBefore: Sha256Hex,
        fingerprintAfter: Sha256Hex,
        exitCode: S.Int,
        stdout: TrialArtifact,
        stderr: TrialArtifact,
        parsedOutcome: TrialArtifact,
        collected: S.Natural,
        passedCount: S.Natural,
        failedCount: S.Natural,
        collectionFailures: S.Natural,
      })
    ),
  },
  $I.annote("TrialAcceptance", {
    description:
      "Evaluator-produced task-oracle outcome. Missing exports fail required checks; they never exclude an attempt.",
  })
) {}
/**
 * Exact-commit required task checks, including required exports.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialAcceptanceJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialAcceptanceJson.decodeOption("{}")) // None: required evidence is missing.
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const TrialAcceptanceJson = JsonStringCodec(TrialAcceptance);
/**
 * Evaluator binding of full Yeet and task acceptance to an attempt.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialProof } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialProof)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialProof extends S.Class<TrialProof>($I`TrialProof`)(
  {
    schemaVersion: S.Literal("agent-trial-proof/v1"),
    attempt: TrialArtifact,
    finalCommit: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
    verdict: TrialArtifact,
    acceptance: TrialArtifact,
    requiredLaneIds: S.NonEmptyArray(S.NonEmptyString).check(S.isUnique()),
    yeetExitCode: S.Int,
    reconstruction: S.optional(TrialArtifact),
    fullYeetCollection: S.optional(TrialArtifact),
  },
  $I.annote("TrialProof", {
    description:
      "Trusted evaluator binding of full Yeet and oracle receipts to an immutable attempt and exact final local commit.",
  })
) {}
/**
 * Evaluator binding of full Yeet and task acceptance to an attempt.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialProofJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialProofJson.decodeOption("{}")) // None: required evidence is missing.
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const TrialProofJson = JsonStringCodec(TrialProof);

/**
 * Final proof outcome with an optional gated BenchmarkRun projection.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialFinalization } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialFinalization)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialFinalization extends S.Class<TrialFinalization>($I`TrialFinalization`)(
  {
    schemaVersion: S.Literal("agent-trial-finalization/v1"),
    attempt: TrialArtifact,
    proof: TrialArtifact,
    status: S.Literals(["passed", "failed", "incomplete"]),
    protocolCompliance: S.Literals(["invocation-pins-verified", "violation", "unknown"]),
    failures: S.Array(S.NonEmptyString),
    benchmark: AiMetricsBenchmarkRunInput.pipe(S.OptionFromNullOr),
  },
  $I.annote("TrialFinalization", {
    description:
      "Gate outcome retained for every finalization; BenchmarkRun projection exists only after all exact-head proof gates pass.",
  })
) {}
/**
 * Final proof outcome with an optional gated BenchmarkRun projection.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialFinalizationJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialFinalizationJson.decodeOption("{}")) // None: required evidence is missing.
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const TrialFinalizationJson = JsonStringCodec(TrialFinalization);

/**
 * Durable denominator admission before any setup or coding process starts.
 *
 * **Example** (Reject an unbound admission)
 * ```ts
 * import { TrialStarted } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialStarted)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialStarted extends S.Class<TrialStarted>($I`TrialStarted`)(
  {
    schemaVersion: S.Literal("agent-trial-started/v1"),
    plan: TrialArtifact,
    runId: S.NonEmptyString,
    attemptId: S.NonEmptyString,
    startedAtEpochMillis: S.Natural,
  },
  $I.annote("TrialStarted", {
    description: "Unfinished admission remains an unknown interrupted attempt, never an excluded denominator row.",
  })
) {}
/**
 * Codec for the durable admission written before setup.
 * **Example** (Reject missing admission evidence)
 * ```ts
 * import { TrialStartedJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialStartedJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialStartedJson = JsonStringCodec(TrialStarted);

/**
 * JSON boundary for evaluator-owned isolation canaries.
 * **Example** (Reject missing canaries)
 * ```ts
 * import { TrialIsolationAttestationJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialIsolationAttestationJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialIsolationAttestationJson = JsonStringCodec(TrialIsolationAttestation);

/**
 * One protected collector request for an immutable retained attempt.
 * **Details**
 * Reconstructs committed source before acceptance and full Yeet; no model process runs.
 * **Example** (Decode a private request)
 * ```ts
 * import { TrialCollectRequestJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialCollectRequestJson.decodeOption("{}")) // None
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialCollectRequest extends S.Class<TrialCollectRequest>($I`TrialCollectRequest`)(
  {
    schemaVersion: S.Literal("agent-trial-collect-request/v1"),
    attempt: TrialArtifact,
    reconstructionRoot: S.NonEmptyString,
    outputRoot: S.NonEmptyString,
    checks: S.NonEmptyArray(TrialEvaluatorCheck),
    yeet: TrialEvaluatorCheck,
    runtime: S.Array(TrialMount),
    projectedRuntime: S.Array(TrialRuntimeClosure),
  },
  $I.annote("TrialCollectRequest", {
    description: "Pinned inputs and fresh owned destinations for trusted offline collection.",
  })
) {}
/**
 * JSON codec for one protected collection request.
 * **Example** (Reject missing request inputs)
 * ```ts
 * import { TrialCollectRequestJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialCollectRequestJson.decodeOption("{}")) // None
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialCollectRequestJson = JsonStringCodec(TrialCollectRequest);
