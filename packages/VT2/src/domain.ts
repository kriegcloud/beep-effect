import { $I as $RootId } from "@beep/identity/packages";
import { FilePath, LiteralKit, NonEmptyTrimmedStr, NonNegativeInt, UUID } from "@beep/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RootId.create("VT2/domain");

/**
 * Canonical first-slice session source.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2SessionSource = LiteralKit(["record", "import"]).annotate(
  $I.annote("Vt2SessionSource", {
    description: "Canonical first-slice session sources supported by the V2T workflow.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2SessionSource = typeof Vt2SessionSource.Type;

/**
 * Canonical session status for the first V2T slice.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2SessionStatus = LiteralKit([
  "draft",
  "capturing",
  "ingesting",
  "transcribing",
  "review-ready",
  "recoverable",
  "composing",
  "exporting",
  "completed",
  "failed",
]).annotate(
  $I.annote("Vt2SessionStatus", {
    description: "High-level lifecycle states for a V2T session.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2SessionStatus = typeof Vt2SessionStatus.Type;

/**
 * Capture-segment durability state owned below the React shell.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2CaptureSegmentStatus = LiteralKit([
  "pending",
  "persisted",
  "ingested",
  "recoverable",
  "discarded",
]).annotate(
  $I.annote("Vt2CaptureSegmentStatus", {
    description: "Durability and intake posture for a capture segment.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2CaptureSegmentStatus = typeof Vt2CaptureSegmentStatus.Type;

/**
 * Recovery resolution choices for interrupted or backpressured capture artifacts.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2RecoveryDisposition = LiteralKit(["pending", "recover", "discard", "resolved"]).annotate(
  $I.annote("Vt2RecoveryDisposition", {
    description: "Disposition for recovery candidates surfaced by the first-slice workflow.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2RecoveryDisposition = typeof Vt2RecoveryDisposition.Type;

/**
 * Explicit recovery actions accepted by the first-slice control plane.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2RecoveryResolution = LiteralKit(["recover", "discard"]).annotate(
  $I.annote("Vt2RecoveryResolution", {
    description: "Concrete recovery actions the native shell can apply to a pending recovery candidate.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2RecoveryResolution = typeof Vt2RecoveryResolution.Type;

/**
 * Transcript processing posture for a session.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2TranscriptStatus = LiteralKit(["pending", "processing", "ready", "failed"]).annotate(
  $I.annote("Vt2TranscriptStatus", {
    description: "Transcript posture for the local-first V2T workflow.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2TranscriptStatus = typeof Vt2TranscriptStatus.Type;

/**
 * Export formats exposed by the first V2T slice.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2ExportFormat = LiteralKit(["json", "markdown", "srt", "txt"]).annotate(
  $I.annote("Vt2ExportFormat", {
    description: "Export formats supported by the current V2T scaffolding.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2ExportFormat = typeof Vt2ExportFormat.Type;

/**
 * Export lifecycle status.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2ExportStatus = LiteralKit(["pending", "rendering", "ready", "failed"]).annotate(
  $I.annote("Vt2ExportStatus", {
    description: "Lifecycle posture for a session export artifact.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2ExportStatus = typeof Vt2ExportStatus.Type;

/**
 * First-slice window surface taxonomy.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2WindowSurface = LiteralKit(["main-workspace", "capture-focus", "recovery-focus"]).annotate(
  $I.annote("Vt2WindowSurface", {
    description: "Window or focused surface classes allowed in the first desktop slice.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2WindowSurface = typeof Vt2WindowSurface.Type;

/**
 * Provider execution mode captured in the scaffold so later phases can swap real adapters without reopening contracts.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2ProviderExecutionMode = LiteralKit(["stub", "local", "remote"]).annotate(
  $I.annote("Vt2ProviderExecutionMode", {
    description: "Execution mode for a provider seam in the V2T workflow.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2ProviderExecutionMode = typeof Vt2ProviderExecutionMode.Type;

/**
 * Composition run lifecycle status.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2CompositionRunStatus = LiteralKit(["prepared", "exported", "failed"]).annotate(
  $I.annote("Vt2CompositionRunStatus", {
    description: "Lifecycle posture for a persisted composition run.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2CompositionRunStatus = typeof Vt2CompositionRunStatus.Type;

/**
 * Project summary tracked by the V2T sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2Project extends S.Class<Vt2Project>($I`Vt2Project`)(
  {
    id: UUID,
    title: NonEmptyTrimmedStr,
    workspaceDirectory: S.OptionFromOptionalKey(FilePath),
    createdAt: S.DateTimeUtcFromMillis,
    updatedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("Vt2Project", {
    description: "Project summary for a local-first V2T workspace.",
  })
) {}

/**
 * Session summary returned across the control plane.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2Session extends S.Class<Vt2Session>($I`Vt2Session`)(
  {
    id: UUID,
    projectId: S.OptionFromOptionalKey(UUID),
    source: Vt2SessionSource,
    status: Vt2SessionStatus,
    title: NonEmptyTrimmedStr,
    workingDirectory: S.OptionFromOptionalKey(FilePath),
    createdAt: S.DateTimeUtcFromMillis,
    updatedAt: S.DateTimeUtcFromMillis,
    transcriptStatus: Vt2TranscriptStatus,
    captureSegmentCount: NonNegativeInt,
    recoveryCandidateCount: NonNegativeInt,
    exportArtifactCount: NonNegativeInt,
  },
  $I.annote("Vt2Session", {
    description: "Canonical session summary shared between the V2T app shell and sidecar.",
  })
) {}

/**
 * Input for creating a first-slice session.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CreateVt2SessionInput extends S.Class<CreateVt2SessionInput>($I`CreateVt2SessionInput`)(
  {
    source: Vt2SessionSource,
    title: NonEmptyTrimmedStr,
    projectId: S.OptionFromOptionalKey(UUID),
    workingDirectory: S.OptionFromOptionalKey(FilePath),
  },
  $I.annote("CreateVt2SessionInput", {
    description: "Client payload for creating a canonical V2T session from record or import.",
  })
) {}

/**
 * Path params for session-specific routes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2SessionIdParams extends S.Class<Vt2SessionIdParams>($I`Vt2SessionIdParams`)(
  {
    sessionId: UUID,
  },
  $I.annote("Vt2SessionIdParams", {
    description: "Route params for session-specific V2T endpoints.",
  })
) {}

/**
 * Route params for recovery-candidate-specific endpoints.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2RecoveryCandidateParams extends S.Class<Vt2RecoveryCandidateParams>($I`Vt2RecoveryCandidateParams`)(
  {
    sessionId: UUID,
    candidateId: UUID,
  },
  $I.annote("Vt2RecoveryCandidateParams", {
    description: "Route params for recovery-candidate-specific V2T endpoints.",
  })
) {}

/**
 * Payload emitted by the native shell when it hands a completed capture segment to the sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CompleteVt2CaptureInput extends S.Class<CompleteVt2CaptureInput>($I`CompleteVt2CaptureInput`)(
  {
    durationMs: NonNegativeInt,
    artifactPath: FilePath,
    interrupted: S.Boolean,
    interruptionReason: S.OptionFromOptionalKey(NonEmptyTrimmedStr),
  },
  $I.annote("CompleteVt2CaptureInput", {
    description: "Payload used by the native shell to commit a durably persisted capture segment into the sidecar.",
  })
) {}

/**
 * Payload for resolving a pending recovery candidate.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResolveVt2RecoveryCandidateInput extends S.Class<ResolveVt2RecoveryCandidateInput>(
  $I`ResolveVt2RecoveryCandidateInput`
)(
  {
    disposition: Vt2RecoveryResolution,
  },
  $I.annote("ResolveVt2RecoveryCandidateInput", {
    description: "Payload used by the native shell to recover or discard a pending recovery candidate.",
  })
) {}

/**
 * Payload for preparing a composition run and its tracked export artifacts.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunVt2CompositionInput extends S.Class<RunVt2CompositionInput>($I`RunVt2CompositionInput`)(
  {
    profileId: UUID,
    targetFormats: S.NonEmptyArray(Vt2ExportFormat),
    destinationDirectory: S.OptionFromOptionalKey(FilePath),
  },
  $I.annote("RunVt2CompositionInput", {
    description: "Payload for creating a composition packet and materialized local export artifacts.",
  })
) {}

/**
 * Persisted capture segment metadata.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2CaptureSegment extends S.Class<Vt2CaptureSegment>($I`Vt2CaptureSegment`)(
  {
    id: UUID,
    sessionId: UUID,
    status: Vt2CaptureSegmentStatus,
    sequence: NonNegativeInt,
    durationMs: NonNegativeInt,
    artifactPath: S.OptionFromOptionalKey(FilePath),
    persistedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
  },
  $I.annote("Vt2CaptureSegment", {
    description: "Canonical capture segment metadata surfaced for recovery and intake workflows.",
  })
) {}

/**
 * Recovery candidate generated from interrupted or backpressured capture.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2RecoveryCandidate extends S.Class<Vt2RecoveryCandidate>($I`Vt2RecoveryCandidate`)(
  {
    id: UUID,
    sessionId: UUID,
    segmentId: UUID,
    reason: NonEmptyTrimmedStr,
    disposition: Vt2RecoveryDisposition,
    discoveredAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("Vt2RecoveryCandidate", {
    description: "Recovery candidate projected from persisted capture state.",
  })
) {}

/**
 * Transcript projection for a session.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2Transcript extends S.Class<Vt2Transcript>($I`Vt2Transcript`)(
  {
    sessionId: UUID,
    status: Vt2TranscriptStatus,
    excerpt: S.OptionFromOptionalKey(NonEmptyTrimmedStr),
    language: S.OptionFromOptionalKey(NonEmptyTrimmedStr),
    wordCount: NonNegativeInt,
  },
  $I.annote("Vt2Transcript", {
    description: "Transcript projection for a V2T session.",
  })
) {}

/**
 * Composition profile captured before handing work to a provider.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2CompositionProfile extends S.Class<Vt2CompositionProfile>($I`Vt2CompositionProfile`)(
  {
    id: UUID,
    label: NonEmptyTrimmedStr,
    includeMemoryContext: S.Boolean,
    preferredProviderMode: Vt2ProviderExecutionMode,
    aspectRatio: NonEmptyTrimmedStr,
    outputTone: NonEmptyTrimmedStr,
  },
  $I.annote("Vt2CompositionProfile", {
    description: "Composition profile used to prepare downstream generation packets.",
  })
) {}

/**
 * Composition packet built before provider execution.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2CompositionPacket extends S.Class<Vt2CompositionPacket>($I`Vt2CompositionPacket`)(
  {
    sessionId: UUID,
    source: Vt2SessionSource,
    transcriptExcerpt: S.OptionFromOptionalKey(NonEmptyTrimmedStr),
    includeMemoryContext: S.Boolean,
    targetFormats: S.NonEmptyArray(Vt2ExportFormat),
  },
  $I.annote("Vt2CompositionPacket", {
    description: "Canonical packet passed through memory and composition adapters before export.",
  })
) {}

/**
 * Memory context packet attached to a composition run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2MemoryContextPacket extends S.Class<Vt2MemoryContextPacket>($I`Vt2MemoryContextPacket`)(
  {
    id: UUID,
    sessionId: UUID,
    providerLabel: NonEmptyTrimmedStr,
    query: NonEmptyTrimmedStr,
    references: S.NonEmptyArray(NonEmptyTrimmedStr),
    createdAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("Vt2MemoryContextPacket", {
    description: "Local-first memory context packet generated before composition and export work.",
  })
) {}

/**
 * Persisted composition run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2CompositionRun extends S.Class<Vt2CompositionRun>($I`Vt2CompositionRun`)(
  {
    id: UUID,
    sessionId: UUID,
    profileId: UUID,
    status: Vt2CompositionRunStatus,
    packet: Vt2CompositionPacket,
    memoryContextPacketId: S.OptionFromOptionalKey(UUID),
    exportArtifactIds: S.Array(UUID),
    createdAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("Vt2CompositionRun", {
    description: "Tracked composition run with packet, optional memory context, and exported artifact ids.",
  })
) {}

/**
 * Export request built for downstream export adapters.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2ExportRequest extends S.Class<Vt2ExportRequest>($I`Vt2ExportRequest`)(
  {
    runId: UUID,
    sessionId: UUID,
    sessionTitle: NonEmptyTrimmedStr,
    format: Vt2ExportFormat,
    packet: Vt2CompositionPacket,
    transcriptExcerpt: S.OptionFromOptionalKey(NonEmptyTrimmedStr),
    memoryContextPacketId: S.OptionFromOptionalKey(UUID),
    destinationPath: S.OptionFromOptionalKey(FilePath),
  },
  $I.annote("Vt2ExportRequest", {
    description: "Canonical request for generating an export artifact.",
  })
) {}

/**
 * Export artifact summary.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2ExportArtifact extends S.Class<Vt2ExportArtifact>($I`Vt2ExportArtifact`)(
  {
    id: UUID,
    sessionId: UUID,
    format: Vt2ExportFormat,
    status: Vt2ExportStatus,
    filePath: S.OptionFromOptionalKey(FilePath),
    createdAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("Vt2ExportArtifact", {
    description: "Tracked export artifact for a V2T session.",
  })
) {}

/**
 * Desktop-level defaults owned outside project artifacts.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2DesktopPreferences extends S.Class<Vt2DesktopPreferences>($I`Vt2DesktopPreferences`)(
  {
    preferredSessionSource: Vt2SessionSource,
    workspaceDirectory: S.OptionFromOptionalKey(FilePath),
    captureSurface: Vt2WindowSurface,
    autoRecoverInterruptions: S.Boolean,
    includeMemoryByDefault: S.Boolean,
    lastOpenedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
  },
  $I.annote("Vt2DesktopPreferences", {
    description: "Desktop defaults persisted separately from projects, sessions, and runs.",
  })
) {}

/**
 * Input for updating desktop preferences.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UpdateVt2DesktopPreferencesInput extends S.Class<UpdateVt2DesktopPreferencesInput>(
  $I`UpdateVt2DesktopPreferencesInput`
)(
  {
    preferredSessionSource: Vt2SessionSource,
    workspaceDirectory: S.OptionFromOptionalKey(FilePath),
    captureSurface: Vt2WindowSurface,
    autoRecoverInterruptions: S.Boolean,
    includeMemoryByDefault: S.Boolean,
    lastOpenedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
  },
  $I.annote("UpdateVt2DesktopPreferencesInput", {
    description: "Payload for updating user-level desktop defaults.",
  })
) {}

/**
 * Provider and ownership seams made explicit in the workspace snapshot.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2WorkspaceSeams extends S.Class<Vt2WorkspaceSeams>($I`Vt2WorkspaceSeams`)(
  {
    nativeCaptureOwner: NonEmptyTrimmedStr,
    sidecarMetadataOwner: NonEmptyTrimmedStr,
    transcriptProvider: Vt2ProviderExecutionMode,
    memoryProvider: Vt2ProviderExecutionMode,
    compositionProvider: Vt2ProviderExecutionMode,
    exportProvider: Vt2ProviderExecutionMode,
    desktopTopology: NonEmptyTrimmedStr,
  },
  $I.annote("Vt2WorkspaceSeams", {
    description: "First-slice ownership and provider seam summary surfaced to the app shell.",
  })
) {}

/**
 * Full session resource used by the first-slice workspace shell.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2SessionResource extends S.Class<Vt2SessionResource>($I`Vt2SessionResource`)(
  {
    session: Vt2Session,
    transcript: Vt2Transcript,
    captureSegments: S.Array(Vt2CaptureSegment),
    recoveryCandidates: S.Array(Vt2RecoveryCandidate),
    memoryContextPackets: S.Array(Vt2MemoryContextPacket),
    compositionProfiles: S.Array(Vt2CompositionProfile),
    compositionRuns: S.Array(Vt2CompositionRun),
    exportArtifacts: S.Array(Vt2ExportArtifact),
  },
  $I.annote("Vt2SessionResource", {
    description: "Detailed session resource returned by the first-slice control plane.",
  })
) {}

/**
 * Workspace snapshot returned to the V2T desktop shell.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2WorkspaceSnapshot extends S.Class<Vt2WorkspaceSnapshot>($I`Vt2WorkspaceSnapshot`)(
  {
    projects: S.Array(Vt2Project),
    sessions: S.Array(Vt2Session),
    recoveryCandidates: S.Array(Vt2RecoveryCandidate),
    preferences: Vt2DesktopPreferences,
    seams: Vt2WorkspaceSeams,
    supportedSessionSources: S.Array(Vt2SessionSource),
  },
  $I.annote("Vt2WorkspaceSnapshot", {
    description: "Workspace projection used by the V2T shell to render the first execution slice.",
  })
) {}

/**
 * Default first-slice workspace seam summary.
 *
 * @since 0.0.0
 * @category Constants
 */
export const defaultVt2WorkspaceSeams = (): Vt2WorkspaceSeams =>
  new Vt2WorkspaceSeams({
    nativeCaptureOwner: NonEmptyTrimmedStr.make("Native shell owns raw direct-capture control and recovery actions."),
    sidecarMetadataOwner: NonEmptyTrimmedStr.make(
      "Sidecar owns canonical session metadata and downstream artifact indexing after intake."
    ),
    transcriptProvider: "local",
    memoryProvider: "local",
    compositionProvider: "local",
    exportProvider: "local",
    desktopTopology: NonEmptyTrimmedStr.make(
      "One main workspace window, native dialogs, and at most one focused capture or recovery surface."
    ),
  });

/**
 * Default desktop preferences for the first slice.
 *
 * @since 0.0.0
 * @category Constants
 */
export const defaultVt2DesktopPreferences = (): Vt2DesktopPreferences =>
  new Vt2DesktopPreferences({
    preferredSessionSource: "record",
    workspaceDirectory: O.none(),
    captureSurface: "main-workspace",
    autoRecoverInterruptions: true,
    includeMemoryByDefault: true,
    lastOpenedAt: O.none(),
  });
