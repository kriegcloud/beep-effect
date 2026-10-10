/**
 * Outcome-independent retention and original-path source rehydration contracts.
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Sha256Hex } from "@beep/schema/Sha256";
import * as S from "effect/Schema";
import { JsonStringCodec } from "../../internal/schema/JsonCodec.ts";
import { TrialCoverage } from "./AgentEffectiveness.trials.schemas.ts";
import { TrialArtifact, TrialInputInventory, TrialRuntimeClosure } from "./internal/TrialProfile.schemas.ts";

const $I = $RepoCliId.create("commands/AgentEffectiveness/AgentEffectiveness.TrialRetention.schemas");

/** Declared immutable check inputs preserve inventory semantics and standalone byte references.
 * **Example** (No declared checks have an empty input closure)
 * ```ts
 * import { TrialRetentionInputs } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialRetentionInputs.make({ roots: [], inventories: [], artifacts: [] }).roots)
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialRetentionInputs extends S.Class<TrialRetentionInputs>($I`TrialRetentionInputs`)(
  { roots: S.Array(S.NonEmptyString), inventories: S.Array(TrialRuntimeClosure), artifacts: S.Array(TrialArtifact) },
  $I.annote("TrialRetentionInputs", {
    description:
      "Shared Collector census with typed semantic inventories and content-bound frozen assets; rebuilt output caches are excluded.",
  })
) {}

/** Actual committed byte inventory authored from a fresh evaluator reconstruction.
 * **Example** (An empty committed tree has no tracked bytes)
 * ```ts
 * import { TrialTrackedBytes } from "@beep/repo-cli/commands/AgentEffectiveness"
 * const tree = TrialTrackedBytes.make({ files: {}, symlinks: {}, executable: {} })
 * console.log(tree.files)
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialTrackedBytes extends S.Class<TrialTrackedBytes>($I`TrialTrackedBytes`)(
  {
    files: S.Record(S.NonEmptyString, Sha256Hex),
    symlinks: S.Record(S.NonEmptyString, S.NonEmptyString),
    executable: S.Record(S.NonEmptyString, S.Boolean),
  },
  $I.annote("TrialTrackedBytes", {
    description:
      "Relative committed byte hashes, literal link targets and executable modes independent of model-authored index flags.",
  })
) {}
/** Committed byte inventory codec.
 * **Example** (Reject an absent inventory)
 * ```ts
 * import { TrialTrackedBytesJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialTrackedBytesJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialTrackedBytesJson = JsonStringCodec(TrialTrackedBytes);

/** Evaluator spool completion independent of model token/provenance coverage.
 * **Example** (Require complete captured bytes)
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrialRetentionCapture } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(S.is(TrialRetentionCapture)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialRetentionCapture extends S.Class<TrialRetentionCapture>($I`TrialRetentionCapture`)(
  {
    schemaVersion: S.Literal("agent-trial-retention-capture/v1"),
    plan: TrialArtifact,
    stdout: TrialArtifact,
    stderr: TrialArtifact,
    stdoutBytes: S.Natural,
    stderrBytes: S.Natural,
    state: S.Literals(["drained", "truncated"]),
  },
  $I.annote("TrialRetentionCapture", {
    description:
      "Evaluator-authored exact stream bytes after process capture drains; unknown token counts do not invalidate retained bytes.",
  })
) {}
/** Captured-byte completion codec.
 * **Example** (Reject missing stream evidence)
 * ```ts
 * import { TrialRetentionCaptureJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialRetentionCaptureJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialRetentionCaptureJson = JsonStringCodec(TrialRetentionCapture);

/** Terminal outcome remains independent of safe source retention.
 * **Example** (Failure is still a terminal outcome)
 * ```ts
 * import { TrialRetentionOutcome } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialRetentionOutcome.literals) // passed, failed, aborted
 * ```
 * @category models
 * @since 0.0.0
 */
export const TrialRetentionOutcome = LiteralKit(["passed", "failed", "aborted"]).pipe(
  $I.annoteSchema("TrialRetentionOutcome", {
    description: "Terminal outcome; failure never implies incomplete retention.",
  })
);
/** Decoded terminal outcome vocabulary.
 * **Example** (Derive the runtime type from the literal domain)
 * ```ts
 * import { TrialRetentionOutcome } from "@beep/repo-cli/commands/AgentEffectiveness"
 * const outcome: TrialRetentionOutcome = "failed"
 * console.log(outcome)
 * ```
 * @category models
 * @since 0.0.0
 */
export type TrialRetentionOutcome = typeof TrialRetentionOutcome.Type;

/** Evaluator-authored ownership initialized before coding starts and excluded from its namespace.
 * **Example** (Require a frozen-plan binding)
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrialRetentionOwnership } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(S.is(TrialRetentionOwnership)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialRetentionOwnership extends S.Class<TrialRetentionOwnership>($I`TrialRetentionOwnership`)(
  {
    schemaVersion: S.Literal("agent-trial-retention-ownership/v1"),
    plan: TrialArtifact,
    ownerRoot: S.NonEmptyString,
    runId: S.NonEmptyString,
    attemptId: S.NonEmptyString,
  },
  $I.annote("TrialRetentionOwnership", {
    description: "Evaluator-authored root identity bound to the immutable pre-run plan.",
  })
) {}
/** Pre-run ownership codec.
 * **Example** (Reject an unbound marker)
 * ```ts
 * import { TrialRetentionOwnershipJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialRetentionOwnershipJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialRetentionOwnershipJson = JsonStringCodec(TrialRetentionOwnership);

/** Terminal evidence classification supplied by the evaluator, never a coding agent.
 * **Example** (Incomplete evidence is explicit)
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrialRetentionClassification } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(S.is(TrialRetentionClassification)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialRetentionClassification extends S.Class<TrialRetentionClassification>(
  $I`TrialRetentionClassification`
)(
  {
    schemaVersion: S.Literal("agent-trial-retention-classification/v1"),
    attempt: TrialArtifact,
    outcome: TrialRetentionOutcome,
    completeness: S.Literals(["complete", "incomplete"]),
    evidence: S.NonEmptyArray(TrialArtifact),
    terminalEvidence: TrialArtifact,
    reasons: S.Array(S.NonEmptyString),
  },
  $I.annote("TrialRetentionClassification", {
    description: "Evaluator terminal classification bound to original attempt and complete evidence closure.",
  })
) {}
/** Immutable classification JSON boundary.
 * **Example** (Reject an absent classification)
 * ```ts
 * import { TrialRetentionClassificationJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialRetentionClassificationJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialRetentionClassificationJson = JsonStringCodec(TrialRetentionClassification);

/** Existing scoring collection binds the immutable source root to its attempt.
 * **Example** (Require both source and collection receipts)
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrialCollectedRetentionSource } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(S.is(TrialCollectedRetentionSource)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialCollectedRetentionSource extends S.Class<TrialCollectedRetentionSource>(
  $I`TrialCollectedRetentionSource`
)(
  { kind: S.Literal("collected"), committedSource: TrialArtifact, collection: TrialArtifact },
  $I.annote("TrialCollectedRetentionSource", {
    description: "Existing collection source is retained without weakening scoring admission.",
  })
) {}

/** A complete failed coding attempt can reconstruct source without entering scoring.
 * **Example** (Request an explicitly unscored retained commit)
 * ```ts
 * import { TrialUnscoredRetentionSource } from "@beep/repo-cli/commands/AgentEffectiveness"
 * const source = TrialUnscoredRetentionSource.make({ kind: "source-only", finalCommit: "0000000000000000000000000000000000000000" })
 * console.log(source.kind) // source-only; existence is checked against retained bundle
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialUnscoredRetentionSource extends S.Class<TrialUnscoredRetentionSource>(
  $I`TrialUnscoredRetentionSource`
)(
  { kind: S.Literal("source-only"), finalCommit: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)) },
  $I.annote("TrialUnscoredRetentionSource", {
    description:
      "Candidate commit is reconstructed from retained bundles; this source-only path makes no experimental acceptance claim.",
  })
) {}

/** Source admission distinguishes scored collection from outcome-independent storage.
 * **Example** (Reject an absent source admission)
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrialRetentionSource } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(S.is(TrialRetentionSource)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export const TrialRetentionSource = S.Union([TrialCollectedRetentionSource, TrialUnscoredRetentionSource]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("TrialRetentionSource", {
    description: "Explicit source admission; source-only storage cannot masquerade as scoring collection.",
  })
);
/** Decoded source admission domain.
 * @category models
 * @since 0.0.0
 */
export type TrialRetentionSource = typeof TrialRetentionSource.Type;

/** Qualification creates a plan without removing source directories.
 * **Example** (Require ownership and declared runtime)
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrialRetainRequest } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(S.is(TrialRetainRequest)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialRetainRequest extends S.Class<TrialRetainRequest>($I`TrialRetainRequest`)(
  {
    schemaVersion: S.Literal("agent-trial-retain-request/v1"),
    attempt: TrialArtifact,
    classification: TrialArtifact,
    source: TrialRetentionSource,
    receiptInventory: TrialArtifact,
    capture: TrialArtifact,
    ownerRoot: S.NonEmptyString,
    ownership: TrialArtifact,
    outputRoot: S.NonEmptyString,
    system: TrialInputInventory,
  },
  $I.annote("TrialRetainRequest", {
    description: "Digest-bound evaluator request for source-only eligibility with fresh reconstruction witness.",
  })
) {}
/** Retain request codec.
 * **Example** (Require a full request)
 * ```ts
 * import { TrialRetainRequestJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialRetainRequestJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialRetainRequestJson = JsonStringCodec(TrialRetainRequest);

/** Immutable source-only eligibility record; this never authorizes evidence removal.
 * **Example** (Require a source witness)
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrialRetention } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(S.is(TrialRetention)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialRetention extends S.Class<TrialRetention>($I`TrialRetention`)(
  {
    schemaVersion: S.Literal("agent-trial-retention/v1"),
    request: TrialArtifact,
    attempt: TrialArtifact,
    classification: TrialArtifact,
    committedSource: TrialArtifact,
    source: TrialRetentionSource,
    ownerRoot: S.NonEmptyString,
    ownership: TrialArtifact,
    outcome: TrialRetentionOutcome,
    usageCoverage: TrialCoverage,
    dependencies: S.NonEmptyArray(TrialArtifact),
    witness: TrialArtifact,
    trackedBytes: TrialArtifact,
    declaredInputs: TrialRetentionInputs,
    codingEligibleDirectories: S.NonEmptyArray(S.NonEmptyString),
    collectorWorkspace: S.NonEmptyString,
  },
  $I.annote("TrialRetention", {
    description: "No-delete eligible source plan preserving complete evidence and original terminal outcome.",
  })
) {}
/** Retention artifact codec.
 * **Example** (Reject missing dependencies)
 * ```ts
 * import { TrialRetentionJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialRetentionJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialRetentionJson = JsonStringCodec(TrialRetention);

/** Original-path restore consumes an eligible record and immutable source artifact.
 * **Example** (Require the original retained source)
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrialRehydrateRequest } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(S.is(TrialRehydrateRequest)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialRehydrateRequest extends S.Class<TrialRehydrateRequest>($I`TrialRehydrateRequest`)(
  {
    schemaVersion: S.Literal("agent-trial-rehydrate-request/v1"),
    retention: TrialArtifact,
    outputRoot: S.NonEmptyString,
    system: TrialInputInventory,
  },
  $I.annote("TrialRehydrateRequest", {
    description: "Owned original-path restoration with declared runtime and retained interrupted witness.",
  })
) {}
/** Restore request codec.
 * **Example** (Reject an incomplete request)
 * ```ts
 * import { TrialRehydrateRequestJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialRehydrateRequestJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialRehydrateRequestJson = JsonStringCodec(TrialRehydrateRequest);

/** A persistent interrupted-operation binding, separate from candidate outcome.
 * **Example** (Reject an unbound partial restore)
 * ```ts
 * import * as S from "effect/Schema"
 * import { TrialRehydration } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(S.is(TrialRehydration)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialRehydration extends S.Class<TrialRehydration>($I`TrialRehydration`)(
  {
    schemaVersion: S.Literal("agent-trial-rehydration/v1"),
    request: TrialArtifact,
    retention: TrialArtifact,
    committedSource: TrialArtifact,
    originalWorkspace: S.NonEmptyString,
    witnessRoot: S.NonEmptyString,
    phase: S.Literals(["started", "verified"]),
    outcome: TrialRetentionOutcome,
    recoveryRoots: S.Array(S.NonEmptyString),
    operationPid: S.Natural,
    operationStart: S.NonEmptyString,
  },
  $I.annote("TrialRehydration", {
    description: "Original-path witness and interrupted recovery roots without rewriting immutable evidence.",
  })
) {}
/** Original-path checkpoint and result codec.
 * **Example** (Require immutable bindings)
 * ```ts
 * import { TrialRehydrationJson } from "@beep/repo-cli/commands/AgentEffectiveness"
 * console.log(TrialRehydrationJson.decodeOption("{}"))
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialRehydrationJson = JsonStringCodec(TrialRehydration);
