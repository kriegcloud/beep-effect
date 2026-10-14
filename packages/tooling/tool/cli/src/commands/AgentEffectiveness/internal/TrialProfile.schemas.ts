/**
 * Native profile controls and protected evaluator contracts.
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Sha256Hex } from "@beep/schema/Sha256";
import * as S from "effect/Schema";
import { JsonStringCodec } from "../../../internal/schema/JsonCodec.ts";

const $I = $RepoCliId.create("commands/AgentEffectiveness/internal/TrialProfile.schemas");
/**
 * Native provider protocol admitted for a frozen invocation.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialProvider } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialProvider)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const TrialProvider = LiteralKit(["codex", "claude", "grok"]).pipe(
  $I.annoteSchema("TrialProvider", {
    description: "Pinned native CLI event protocols; provider changes create different trials.",
  })
);
/**
 * Native provider protocol admitted for a frozen invocation.
 * @category models
 * @since 0.0.0
 */
export type TrialProvider = typeof TrialProvider.Type;

/**
 * A frozen narrow input with read-only or per-attempt copy semantics.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialMount } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialMount)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialMount extends S.Class<TrialMount>($I`TrialMount`)(
  {
    source: S.NonEmptyString,
    target: S.NonEmptyString,
    digest: Sha256Hex,
    access: S.Literals(["readonly", "resettable"]),
  },
  $I.annote("TrialMount", {
    description: "Explicit immutable filesystem input with attested digest; all other host roots are absent.",
  })
) {}

/**
 * Content-bound private evidence independent of coding state.
 *
 * **Example** (Reject incomplete evidence)
 *
 * ```ts
 * import { TrialArtifact } from "@beep/repo-cli/commands/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialArtifact)({})) // false: required evidence is missing.
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TrialArtifact extends S.Class<TrialArtifact>($I`TrialArtifact`)(
  { path: S.NonEmptyString, digest: Sha256Hex },
  $I.annote("TrialArtifact", {
    description: "Private content-addressed artifact reference retained independently of disposable coding state.",
  })
) {}
/**
 * Actual requested native model controls, separate from provider observations.
 * **Example** (Reject missing controls)
 * ```ts
 * import { TrialNativeInvocation } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialNativeInvocation)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialNativeInvocation extends S.Class<TrialNativeInvocation>($I`TrialNativeInvocation`)(
  {
    schemaVersion: S.Literal("agent-trial-native-invocation/v1"),
    provider: TrialProvider,
    command: S.NonEmptyString,
    commandDigest: Sha256Hex,
    args: S.Array(S.String),
    environment: S.Record(S.String, S.String),
    controlsDigest: Sha256Hex,
    requestedModel: S.NonEmptyString,
    requestedEffort: S.Literal("medium"),
    mechanism: S.Literals(["codex-cli-config", "claude-cli-flags", "grok-cli-flags"]),
    provenance: S.Literal("requested-native-argv-config"),
    configuration: S.Array(TrialArtifact),
  },
  $I.annote("TrialNativeInvocation", {
    description: "Actual requested native model controls, separate from provider observations.",
  })
) {}

/**
 * Codec for protected actual native invocation evidence.
 * **Example** (Reject missing evidence)
 * ```ts
 * import { TrialNativeInvocationJson } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(TrialNativeInvocationJson.decodeOption("{}")) // None
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialNativeInvocationJson = JsonStringCodec(TrialNativeInvocation);

/**
 * Common native children with explicit pin enforcement and coverage limitations.
 * **Example** (Reject missing controls)
 * ```ts
 * import { TrialNativeChildPolicy } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialNativeChildPolicy)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialNativeChildPolicy extends S.Class<TrialNativeChildPolicy>($I`TrialNativeChildPolicy`)(
  {
    capability: S.Literals(["disabled-transport", "native-common"]),
    expectedModel: S.NonEmptyString,
    expectedEffort: S.Literal("medium"),
    enforcement: S.Literals(["forced-env", "instructed-observed", "transport-disabled"]),
    usageCoverage: S.Literals(["host-only-children-unknown", "native-children-collected"]),
    inheritedScope: S.Literal("same-arm-filesystem-network-tools-budget"),
    shellReinvocationCoverage: S.Literal("unknown"),
  },
  $I.annote("TrialNativeChildPolicy", {
    description: "Common native children with explicit pin enforcement and coverage limitations.",
  })
) {}

/**
 * Pinned evaluator-owned exact-authority CONNECT broker without host networking.
 * **Example** (Reject missing controls)
 * ```ts
 * import { TrialBrokerControl } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialBrokerControl)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialBrokerControl extends S.Class<TrialBrokerControl>($I`TrialBrokerControl`)(
  {
    program: TrialArtifact,
    interpreter: TrialArtifact,
    relay: TrialArtifact,
    policy: TrialArtifact,
    canaries: TrialArtifact,
    authorities: S.NonEmptyArray(S.String.check(S.isPattern(/^[a-z0-9.-]+:443$/))).check(S.isUnique()),
    maxSeconds: S.Int.check(S.isGreaterThan(0)),
  },
  $I.annote("TrialBrokerControl", {
    description: "Pinned evaluator-owned exact-authority CONNECT broker without host networking.",
  })
) {}

/**
 * Preserve the mode and ownership needed by native runtime inputs.
 * **Example** (Describe an owned executable)
 * ```ts
 * import { TrialInputMetadata } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(TrialInputMetadata.make({ mode: 0o100755, uid: 1000, gid: 1000 }).uid) // 1000
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialInputMetadata extends S.Class<TrialInputMetadata>($I`TrialInputMetadata`)(
  { mode: S.Int, uid: S.Int, gid: S.Int },
  $I.annote("TrialInputMetadata", { description: "Exact file mode and ownership for a frozen native runtime input." })
) {}

/**
 * Frozen evaluator inputs with explicit canonical namespace link projections.
 * **Example** (Reject missing controls)
 * ```ts
 * import { TrialInputInventory } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialInputInventory)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialInputInventory extends S.Class<TrialInputInventory>($I`TrialInputInventory`)(
  {
    root: S.NonEmptyString,
    digest: Sha256Hex,
    files: S.Record(S.NonEmptyString, Sha256Hex),
    symlinks: S.Record(S.NonEmptyString, S.NonEmptyString),
    directories: S.Array(S.NonEmptyString).check(S.isUnique()).pipe(S.optional),
    metadata: S.optional(S.Record(S.NonEmptyString, TrialInputMetadata)),
  },
  $I.annote("TrialInputInventory", {
    description: "Frozen evaluator inputs with explicit canonical namespace link projections.",
  })
) {}

const TrialBootstrapCapabilityHex = S.NonEmptyString.check(
  S.isPattern(/^(?:[a-f0-9]{24}|[a-f0-9]{40}|[a-f0-9]{48})$/)
).pipe(
  $I.annoteSchema("TrialBootstrapCapabilityHex", { description: "Exact Linux v1, v2 or v3 security.capability bytes." })
);
const TrialBootstrapCapabilityState = S.OptionFromNullOr(TrialBootstrapCapabilityHex);

/**
 * Bind an existing privileged bootstrap file without granting a host directory.
 * **Example** (Reject a missing file fingerprint)
 * ```ts
 * import { TrialBootstrapFile } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialBootstrapFile)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialBootstrapFile extends S.Class<TrialBootstrapFile>($I`TrialBootstrapFile`)(
  { artifact: TrialArtifact, metadata: TrialInputMetadata, capability: S.optional(TrialBootstrapCapabilityState) },
  $I.annote("TrialBootstrapFile", {
    description: "Exact byte, mode and ownership binding for rootless namespace bootstrap.",
  })
) {
  /**
   * Decode raw capability bytes while preserving explicit absence.
   * **Example** (Decode absent capabilities)
   * ```ts
   * import { TrialBootstrapFile } from "@beep/repo-cli/test/AgentEffectiveness"
   * import * as S from "effect/Schema"
   * const absent = S.decodeUnknownEffect(TrialBootstrapFile.Capability)(null)
   * console.log(absent)
   * ```
   * @category models
   * @since 0.0.0
   */
  static readonly Capability = TrialBootstrapCapabilityState;

  /**
   * Require the exact ordered privilege-helper observations.
   * **Example** (Reject an incomplete capability census)
   * ```ts
   * import { TrialBootstrapFile } from "@beep/repo-cli/test/AgentEffectiveness"
   * import * as S from "effect/Schema"
   * console.log(S.is(TrialBootstrapFile.Capabilities)([])) // false
   * ```
   * @category models
   * @since 0.0.0
   */
  static readonly Capabilities = S.Tuple([
    S.Struct({ path: S.Literal("/usr/bin/newuidmap"), capability: TrialBootstrapCapabilityState }),
    S.Struct({ path: S.Literal("/usr/bin/newgidmap"), capability: TrialBootstrapCapabilityState }),
  ]).pipe(
    $I.annoteSchema("TrialBootstrapCapabilities", {
      description: "Ordered exact two-helper capability census; null explicitly encodes absence.",
    })
  );
}

/**
 * Declare the owned native Yeet capabilities separately from coding tools.
 * **Details**
 * The Nix store and database are minimal snapshots. OCI state is copied into
 * an owned step and projected at its original path. No host daemon or broad
 * system directory is an admitted runtime input.
 * **Example** (Reject incomplete native runtime controls)
 * ```ts
 * import { TrialNativeYeetRuntime } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialNativeYeetRuntime)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialNativeYeetRuntime extends S.Class<TrialNativeYeetRuntime>($I`TrialNativeYeetRuntime`)(
  {
    schemaVersion: S.Literal("agent-trial-native-yeet-runtime/v1"),
    system: TrialInputInventory,
    nix: TrialInputInventory,
    nixStorePaths: S.NonEmptyArray(S.NonEmptyString).check(S.isUnique()),
    oci: TrialInputInventory,
    image: S.NonEmptyString.check(S.isPattern(/^ghcr\.io\/google\/osv-scanner-action@sha256:[a-f0-9]{64}$/)),
    crun: TrialInputInventory,
    broker: TrialBrokerControl,
    certificateBundle: TrialArtifact,
    bootstrap: S.NonEmptyArray(TrialBootstrapFile),
    bunInstallCache: S.optional(TrialInputInventory),
  },
  $I.annote("TrialNativeYeetRuntime", {
    description: "Digest-bound evaluator-only system, Nix, OCI and restricted advisory capabilities.",
  })
) {}

/**
 * Retain the guards observed by the native evaluator outside coding.
 * **Example** (Reject missing preservation evidence)
 * ```ts
 * import { TrialNativeRuntimeEvidence } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialNativeRuntimeEvidence)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialNativeRuntimeEvidence extends S.Class<TrialNativeRuntimeEvidence>($I`TrialNativeRuntimeEvidence`)(
  {
    schemaVersion: S.Literal("agent-trial-native-runtime-evidence/v1"),
    runtimeDigest: Sha256Hex,
    manifestBefore: Sha256Hex,
    manifestAfter: Sha256Hex,
    preserved: S.Boolean,
    systemDigest: Sha256Hex,
    nixDigest: Sha256Hex,
    ociDigest: Sha256Hex,
    image: S.NonEmptyString,
    bunCacheSeedDigest: S.optional(Sha256Hex),
    bunCacheBefore: S.optional(TrialArtifact),
    bunCacheAfter: S.optional(TrialArtifact),
    bunCacheTarget: S.optional(S.Literal("/output/bun-cache")),
    bootstrapCapabilitiesBefore: S.optional(TrialBootstrapFile.Capabilities),
    bootstrapCapabilitiesAfter: S.optional(TrialBootstrapFile.Capabilities),
  },
  $I.annote("TrialNativeRuntimeEvidence", {
    description: "Immutable native capability and source-overlay guards required by passing finalization.",
  })
) {}

/**
 * Frozen command and native reporter contract for one required evaluator gate.
 * **Example** (Reject missing controls)
 * ```ts
 * import { TrialEvaluatorCheck } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialEvaluatorCheck)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialEvaluatorCheck extends S.Class<TrialEvaluatorCheck>($I`TrialEvaluatorCheck`)(
  {
    id: S.NonEmptyString,
    kind: S.Literals(["framework", "public-exports", "vitest", "typecheck", "package-verify", "yeet"]),
    commandTemplate: S.NonEmptyArray(S.NonEmptyString),
    environmentTemplate: S.Record(S.String, S.String),
    input: TrialInputInventory,
    expectedCases: S.Array(S.NonEmptyString).check(S.isUnique()),
    expectedPackage: S.NonEmptyString.pipe(S.OptionFromNullOr),
    reportRelativePath: S.NonEmptyString.pipe(S.OptionFromNullOr),
    writableCacheTargets: S.Array(S.NonEmptyString),
    compilerOverlay: TrialArtifact.pipe(S.OptionFromNullOr),
    timeoutMs: S.Int.check(S.isGreaterThan(0)),
    rootWritePolicy: S.optional(S.Literals(["readonly", "native-temp-only"])),
    nativeRuntime: S.optional(TrialNativeYeetRuntime),
    sparseSystem: S.optional(TrialInputInventory),
    runtimeControlsDigest: S.optional(Sha256Hex),
  },
  $I.annote("TrialEvaluatorCheck", {
    description: "Frozen command and native reporter contract for one required evaluator gate.",
  })
) {}

/**
 * Native mount protection phase with independent complete query evidence.
 * **Example** (Validate the phase before constructing query inputs)
 * ```ts
 * import { TrialMountGuardPhase } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialMountGuardPhase)("vendor")) // true
 * ```
 * @category models
 * @since 0.0.0
 */
export const TrialMountGuardPhase = LiteralKit(["vendor", "writable"]).pipe(
  $I.annoteSchema("TrialMountGuardPhase", {
    description: "Ordered evaluator dependency and writable-output guard phases.",
  })
);
/** Native protection phase. @category models @since 0.0.0 */
export type TrialMountGuardPhase = typeof TrialMountGuardPhase.Type;

/**
 * Complete ordered mount guard census and private native Git query receipts.
 * **Details**
 * Duplicate targets keep their original ordinals. Empty phases issue no queries;
 * nonempty phases require both drained query captures and complete ignore records.
 * **Example** (Reject missing native query evidence)
 * ```ts
 * import { TrialMountGuardEvidence } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialMountGuardEvidence)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialMountGuardEvidence extends S.Class<TrialMountGuardEvidence>($I`TrialMountGuardEvidence`)(
  {
    schemaVersion: S.Literal("agent-trial-mount-guard/v1"),
    phase: TrialMountGuardPhase,
    targets: S.Array(S.String),
    probePaths: S.Array(S.String),
    input: TrialArtifact,
    trackedStdout: TrialArtifact,
    trackedStderr: TrialArtifact,
    ignoredStdout: TrialArtifact,
    ignoredStderr: TrialArtifact,
    queriesIssued: S.Literals([0, 2]),
    trackedExitCode: S.Int,
    ignoredExitCode: S.Int,
    passed: S.Boolean,
    systemDigest: S.optional(Sha256Hex),
    systemRoot: S.optional(S.String),
  },
  $I.annote("TrialMountGuardEvidence", {
    description: "Artifact-bound complete native protection of every declared mount target.",
  })
) {}

/**
 * Fresh offline committed source bound to the retained candidate bundle.
 * **Example** (Reject missing controls)
 * ```ts
 * import { TrialReconstruction } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialReconstruction)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialReconstruction extends S.Class<TrialReconstruction>($I`TrialReconstruction`)(
  {
    schemaVersion: S.Literal("agent-trial-reconstruction/v1"),
    workspace: S.NonEmptyString,
    finalCommit: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
    tree: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
    bundle: TrialArtifact,
    baseBundle: TrialArtifact.pipe(S.OptionFromNullOr),
    sourceArchive: TrialArtifact,
    ignoredInventory: TrialArtifact,
    framework: TrialArtifact,
  },
  $I.annote("TrialReconstruction", {
    description: "Fresh offline committed source bound to the retained candidate bundle.",
  })
) {}

/**
 * Exact evaluator-owned Git controls inspected outside the check namespace.
 * **Example** (Reject absent ref custody)
 * ```ts
 * import { TrialGitRefState } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialGitRefState)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialGitRefState extends S.Class<TrialGitRefState>($I`TrialGitRefState`)(
  {
    baseCommit: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
    refsDigest: Sha256Hex,
    packedRefsDigest: Sha256Hex,
    configDigest: Sha256Hex,
  },
  $I.annote("TrialGitRefState", { description: "Direct and unambiguous origin/main BASE plus ref backend bytes." })
) {}

/**
 * Custody receipt for the immutable Git ref view used throughout native proof.
 * **Example** (Reject missing continuous protection evidence)
 * ```ts
 * import { TrialGitRefGuard } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialGitRefGuard)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialGitRefGuard extends S.Class<TrialGitRefGuard>($I`TrialGitRefGuard`)(
  {
    schemaVersion: S.Literal("agent-trial-git-ref-guard/v1"),
    policy: S.Literal("owned-base-refs-readonly/v1"),
    protectedTargets: S.Tuple([
      S.Literal("/workspace/.git/refs"),
      S.Literal("/workspace/.git/packed-refs"),
      S.Literal("/workspace/.git/config"),
    ]),
    before: TrialGitRefState,
    after: TrialGitRefState,
  },
  $I.annote("TrialGitRefGuard", { description: "BASE custody before and after a readonly native Git control view." })
) {}

/**
 * Reproducible archive of a fresh evaluator-owned retained commit.
 * **Example** (Reject incomplete source evidence)
 * ```ts
 * import { TrialCommittedSource } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialCommittedSource)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialCommittedSource extends S.Class<TrialCommittedSource>($I`TrialCommittedSource`)(
  {
    schemaVersion: S.Literal("agent-trial-committed-source/v2"),
    baseCommit: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
    gitRefPolicy: S.Literal("owned-base-refs-readonly/v1"),
    workspace: S.NonEmptyString,
    finalCommit: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
    tree: S.String.check(S.isPattern(/^[a-f0-9]{40}$/)),
    bundle: TrialArtifact,
    baseBundle: TrialArtifact.pipe(S.OptionFromNullOr),
    sourceArchive: TrialArtifact,
  },
  $I.annote("TrialCommittedSource", {
    description: "Evaluator-owned reconstruction containing only a retained Git tree and frozen runtime additions.",
  })
) {}
/**
 * Codec for retained committed source evidence.
 * **Example** (Reject absent reconstruction)
 * ```ts
 * import { TrialCommittedSourceJson } from "@beep/repo-cli/test/AgentEffectiveness"
 * console.log(TrialCommittedSourceJson.decodeOption("{}")) // None
 * ```
 * @category codecs
 * @since 0.0.0
 */
export const TrialCommittedSourceJson = JsonStringCodec(TrialCommittedSource);

/**
 * Productive native profile evidence and exact endpoint lifecycle controls.
 * **Example** (Reject absent admission controls)
 * ```ts
 * import { TrialProductiveProfile } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialProductiveProfile)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialProductiveProfile extends S.Class<TrialProductiveProfile>($I`TrialProductiveProfile`)(
  {
    schemaVersion: S.Literal("agent-trial-productive-profile/v1"),
    broker: TrialBrokerControl,
    childPolicy: TrialNativeChildPolicy,
    nativeSurface: TrialArtifact,
    profileCanaries: TrialArtifact,
    allowedNativeToolNames: S.NonEmptyArray(S.NonEmptyString).check(S.isUnique()),
    commonGuidance: S.NonEmptyArray(TrialArtifact),
    referenceInputs: S.NonEmptyArray(TrialArtifact),
    assignedHooks: S.Literals(["native-official", "native-unavailable", "none"]),
    authentication: S.Literals(["readonly-owned-subscription", "memfd-oauth-only"]),
    authLauncher: TrialArtifact.pipe(S.OptionFromNullOr),
    authSource: TrialArtifact.pipe(S.OptionFromNullOr),
  },
  $I.annote("TrialProductiveProfile", {
    description:
      "Explicit observed native surface and common child controls, plus pinned broker/auth lifecycle without host network access.",
  })
) {}

/**
 * Source-bound productive canaries for the complete runner invocation controls.
 * **Example** (Reject unstated observations)
 * ```ts
 * import { TrialProductiveCanaries } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialProductiveCanaries)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialProductiveCanaries extends S.Class<TrialProductiveCanaries>($I`TrialProductiveCanaries`)(
  {
    schemaVersion: S.Literal("agent-trial-productive-canaries/v1"),
    controlsDigest: Sha256Hex,
    observations: S.NonEmptyArray(
      S.Struct({
        id: S.NonEmptyString,
        outcome: S.Literals(["passed", "failed", "unknown"]),
        invocation: TrialArtifact,
        stdout: TrialArtifact,
        stderr: TrialArtifact,
      })
    ),
  },
  $I.annote("TrialProductiveCanaries", {
    description:
      "Observed command receipts for complete controls; fixture-only profile digests do not admit scored trials.",
  })
) {}

/**
 * Frozen runtime input whose literal symlinks resolve in the canonical namespace.
 * **Example** (Reject unprojected runtime evidence)
 * ```ts
 * import { TrialRuntimeClosure } from "@beep/repo-cli/test/AgentEffectiveness"
 * import * as S from "effect/Schema"
 * console.log(S.is(TrialRuntimeClosure)({})) // false
 * ```
 * @category models
 * @since 0.0.0
 */
export class TrialRuntimeClosure extends S.Class<TrialRuntimeClosure>($I`TrialRuntimeClosure`)(
  { target: S.NonEmptyString, inventory: TrialInputInventory },
  $I.annote("TrialRuntimeClosure", {
    description:
      "A complete vendor runtime inventory with explicit canonical workspace link projection, never donor workspace source.",
  })
) {}
