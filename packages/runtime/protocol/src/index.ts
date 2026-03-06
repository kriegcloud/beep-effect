import { $RuntimeProtocolId } from "@beep/identity/packages";
import { Citation, RepoId, RepoRunKind, RepoRunStatus, RetrievalPacket, RunId } from "@beep/repo-memory-domain";
import { FilePath, LiteralKit, NonNegativeInt } from "@beep/schema";
import { Tuple } from "effect";
import * as S from "effect/Schema";

const $I = $RuntimeProtocolId.create("index");

export const SidecarHealthStatus = LiteralKit(["starting", "healthy", "degraded", "stopping"] as const).annotate(
  $I.annote("SidecarHealthStatus", {
    description: "Health posture reported by the local sidecar.",
  })
);

export type SidecarHealthStatus = typeof SidecarHealthStatus.Type;

export class SidecarBootstrap extends S.Class<SidecarBootstrap>($I`SidecarBootstrap`)(
  {
    sessionId: S.String,
    host: S.String,
    port: NonNegativeInt,
    baseUrl: S.String,
    pid: NonNegativeInt,
    version: S.String,
    status: SidecarHealthStatus,
    startedAt: S.Number,
  },
  $I.annote("SidecarBootstrap", {
    description: "Bootstrap payload emitted by the sidecar so the shell can discover and health-check it.",
  })
) {}

export class RepoRegistrationInput extends S.Class<RepoRegistrationInput>($I`RepoRegistrationInput`)(
  {
    repoPath: FilePath,
    displayName: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("RepoRegistrationInput", {
    description: "Request payload used to register a local repository with the sidecar.",
  })
) {}

export class RepoRegistration extends S.Class<RepoRegistration>($I`RepoRegistration`)(
  {
    id: RepoId,
    repoPath: FilePath,
    displayName: S.String,
    language: S.Literal("typescript"),
    registeredAt: S.Number,
  },
  $I.annote("RepoRegistration", {
    description: "Local repository registration known to the repo-memory runtime.",
  })
) {}

export class IndexRun extends S.Class<IndexRun>($I`IndexRun`)(
  {
    kind: S.tag("index"),
    id: RunId,
    repoId: RepoId,
    status: RepoRunStatus,
    startedAt: S.Number,
    completedAt: S.OptionFromOptionalKey(S.Number),
    indexedFileCount: NonNegativeInt,
    errorMessage: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("IndexRun", {
    description: "Metadata for a deterministic indexing run against a tracked repository.",
  })
) {}

export class QueryRunInput extends S.Class<QueryRunInput>($I`QueryRunInput`)(
  {
    repoId: RepoId,
    question: S.String,
  },
  $I.annote("QueryRunInput", {
    description: "Request payload used to start a repo-memory query run.",
  })
) {}

export class QueryRun extends S.Class<QueryRun>($I`QueryRun`)(
  {
    kind: S.tag("query"),
    id: RunId,
    repoId: RepoId,
    question: S.String,
    status: RepoRunStatus,
    answer: S.OptionFromOptionalKey(S.String),
    startedAt: S.Number,
    completedAt: S.OptionFromOptionalKey(S.Number),
    citations: S.Array(Citation),
    retrievalPacket: S.OptionFromOptionalKey(RetrievalPacket),
    errorMessage: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("QueryRun", {
    description: "Metadata and final grounded-answer payload for a repo-memory query run.",
  })
) {}

export const RepoRun = RepoRunKind.mapMembers(Tuple.evolve([() => IndexRun, () => QueryRun]))
  .annotate(
    $I.annote("RepoRun", {
      description: "Union of all persisted run shapes tracked by the repo-memory sidecar.",
    })
  )
  .pipe(S.toTaggedUnion("kind"));

export type RepoRun = typeof RepoRun.Type;

export class RunProgressEvent extends S.Class<RunProgressEvent>($I`RunProgressEvent`)(
  {
    _tag: S.tag("progress"),
    runId: RunId,
    phase: S.String,
    message: S.String,
    percent: S.OptionFromOptionalKey(NonNegativeInt),
    emittedAt: S.Number,
  },
  $I.annote("RunProgressEvent", {
    description: "Incremental progress event emitted while a run is still executing.",
  })
) {}

export class RunRetrievalPacketEvent extends S.Class<RunRetrievalPacketEvent>($I`RunRetrievalPacketEvent`)(
  {
    _tag: S.tag("retrieval-packet"),
    runId: RunId,
    packet: RetrievalPacket,
    emittedAt: S.Number,
  },
  $I.annote("RunRetrievalPacketEvent", {
    description: "Event emitted when the bounded retrieval packet is ready for inspection.",
  })
) {}

export class RunAnswerEvent extends S.Class<RunAnswerEvent>($I`RunAnswerEvent`)(
  {
    _tag: S.tag("answer"),
    runId: RunId,
    answer: S.String,
    citations: S.Array(Citation),
    emittedAt: S.Number,
  },
  $I.annote("RunAnswerEvent", {
    description: "Final grounded answer event emitted after retrieval and synthesis complete.",
  })
) {}

export class RunErrorEvent extends S.Class<RunErrorEvent>($I`RunErrorEvent`)(
  {
    _tag: S.tag("error"),
    runId: RunId,
    message: S.String,
    emittedAt: S.Number,
  },
  $I.annote("RunErrorEvent", {
    description: "Error event emitted when a run fails before producing a final grounded answer.",
  })
) {}

export class RunCompletedEvent extends S.Class<RunCompletedEvent>($I`RunCompletedEvent`)(
  {
    _tag: S.tag("completed"),
    runId: RunId,
    status: RepoRunStatus,
    emittedAt: S.Number,
  },
  $I.annote("RunCompletedEvent", {
    description: "Terminal event emitted when a run completes or fails.",
  })
) {}

const RunStreamEventTag = LiteralKit(["progress", "retrieval-packet", "answer", "error", "completed"] as const);

export const RunStreamEvent = RunStreamEventTag.mapMembers(
  Tuple.evolve([
    () => RunProgressEvent,
    () => RunRetrievalPacketEvent,
    () => RunAnswerEvent,
    () => RunErrorEvent,
    () => RunCompletedEvent,
  ])
)
  .annotate(
    $I.annote("RunStreamEvent", {
      description: "Streaming event union used by the desktop shell to observe long-running sidecar work.",
    })
  )
  .pipe(S.toTaggedUnion("_tag"));

export type RunStreamEvent = typeof RunStreamEvent.Type;
