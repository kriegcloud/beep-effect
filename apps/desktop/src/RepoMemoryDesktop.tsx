import { $I } from "@beep/identity/packages";
import {
  makeRepoMemoryClient,
  normalizeSidecarBaseUrl,
  RepoMemoryClientConfig,
  RepoMemoryClientError,
  type RepoMemoryClientShape,
} from "@beep/repo-memory-client";
import { projectRunEvent } from "@beep/repo-memory-model";
import {
  type Citation,
  IndexRepoRunInput,
  InterruptRepoRunRequest,
  QueryRepoRunInput,
  type QueryRun,
  type QueryStage,
  type QueryStageTrace,
  type RepoRegistration,
  RepoRegistrationInput,
  type RepoRun,
  ResumeRepoRunRequest,
  type RetrievalPacket,
  RunCursor,
  RunId,
  type RunStreamEvent,
  renderRetrievalPacketAnswer,
  type SidecarBootstrap,
  StreamRunEventsRequest,
} from "@beep/runtime-protocol";
import { FilePath, TaggedErrorClass } from "@beep/schema";
import { DateTime, Duration, Effect, Fiber, flow, Order, pipe, Result, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as React from "react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  getManagedSidecarState,
  isNativeDesktop,
  type ManagedSidecarState,
  pickRepoDirectory,
  startManagedSidecar,
  stopManagedSidecar,
} from "./native.ts";
import {
  formatOptionalPercent,
  formatQueryStageLabel,
  formatQueryStageStatusTone,
  queryStageEntries,
} from "./queryStages.ts";

const $DesktopId = $I.create("apps/desktop/src/RepoMemoryDesktop");
const defaultBaseUrl = "http://127.0.0.1:8788";
const desktopSessionId = "desktop-shell";
const sidecarBaseUrlKey = "beep.repoMemory.sidecarBaseUrl";
const desktopDevHost = "desktop.localhost";
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunId = S.decodeUnknownSync(RunId);

class MissingManagedSidecarBootstrapError extends TaggedErrorClass<MissingManagedSidecarBootstrapError>(
  $DesktopId`MissingManagedSidecarBootstrapError`
)(
  "MissingManagedSidecarBootstrapError",
  {
    message: S.String,
  },
  $DesktopId.annote("MissingManagedSidecarBootstrapError", {
    description: "Managed sidecar startup completed without a bootstrap payload.",
  })
) {}

const readPersistedSidecarBaseUrl = (): string | null => {
  const runtimeWindow = globalThis.window;

  if (P.isUndefined(runtimeWindow)) {
    return null;
  }

  try {
    return runtimeWindow.localStorage.getItem(sidecarBaseUrlKey);
  } catch {
    return null;
  }
};

const persistSidecarBaseUrl = (baseUrl: string): void => {
  const runtimeWindow = globalThis.window;

  if (P.isUndefined(runtimeWindow)) {
    return;
  }

  try {
    runtimeWindow.localStorage.setItem(sidecarBaseUrlKey, normalizeSidecarBaseUrl(baseUrl));
  } catch {
    return;
  }
};

const browserDevClientBaseUrl = (): string | null => {
  const runtimeWindow = globalThis.window;

  if (!import.meta.env.DEV || P.isUndefined(runtimeWindow)) {
    return null;
  }

  // Raw Vite origins such as 127.0.0.1:* do not provide the desktop /api proxy.
  return runtimeWindow.location.hostname === desktopDevHost ? runtimeWindow.location.origin : null;
};

const managedDevClientBaseUrl = (bootstrap: SidecarBootstrap): string => browserDevClientBaseUrl() ?? bootstrap.baseUrl;

type ConnectionState = "idle" | "connecting" | "connected" | "error";
type ActionState =
  | "idle"
  | "interrupting"
  | "registering"
  | "indexing"
  | "querying"
  | "refreshing"
  | "resuming"
  | "streaming";
type ShellMode = "browser" | "native-managed" | "manual-override";

const repoOrder = Order.mapInput(Order.flip(Order.Number), (repo: RepoRegistration) =>
  DateTime.toEpochMillis(repo.registeredAt)
);
const runOrder = Order.mapInput(Order.flip(Order.Number), (run: RepoRun) => DateTime.toEpochMillis(run.acceptedAt));
const eventOrder = Order.mapInput(Order.Number, (event: RunStreamEvent) => event.sequence);

const sortRepos = (repos: ReadonlyArray<RepoRegistration>): ReadonlyArray<RepoRegistration> => A.sort(repos, repoOrder);
const sortRuns = (runs: ReadonlyArray<RepoRun>): ReadonlyArray<RepoRun> => A.sort(runs, runOrder);

const appendRunEvent = (
  current: ReadonlyArray<RunStreamEvent>,
  nextEvent: RunStreamEvent
): ReadonlyArray<RunStreamEvent> =>
  A.some(current, (event) => event.sequence === nextEvent.sequence)
    ? current
    : pipe(current, A.append(nextEvent), (events) => A.sort(events, eventOrder));

const upsertRun = (runs: ReadonlyArray<RepoRun>, nextRun: RepoRun): ReadonlyArray<RepoRun> =>
  pipe(
    runs,
    A.filter((run) => run.id !== nextRun.id),
    A.append(nextRun),
    sortRuns
  );

const formatDateTime = (value: DateTime.Utc): string =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(DateTime.toEpochMillis(value));

const formatOptionalDateTime = (value: O.Option<DateTime.Utc>): string =>
  O.match(value, {
    onNone: () => "Not yet",
    onSome: formatDateTime,
  });

const formatConnectionLabel = (state: ConnectionState): string => {
  if (state === "connecting") {
    return "connecting";
  }

  if (state === "connected") {
    return "connected";
  }

  if (state === "error") {
    return "error";
  }

  return "idle";
};

const formatRunTitle = (run: RepoRun): string => (run.kind === "query" ? "Query run" : "Index run");

const summarizeRun = (run: RepoRun): string =>
  run.kind === "query"
    ? run.question
    : O.match(run.indexedFileCount, {
        onNone: () => "Index projection pending file count.",
        onSome: (count) => `${count} files indexed`,
      });

const runStatusTone = (status: RepoRun["status"]): string => {
  if (status === "completed") {
    return "status-completed";
  }

  if (status === "failed" || status === "interrupted") {
    return "status-failed";
  }

  if (status === "running") {
    return "status-running";
  }

  return "status-accepted";
};

const isTerminalEvent = (event: RunStreamEvent): boolean =>
  event.kind === "completed" || event.kind === "failed" || event.kind === "interrupted";

const isTerminalRunStatus = (status: RepoRun["status"]): boolean =>
  status === "completed" || status === "failed" || status === "interrupted";

const eventLabel = (event: RunStreamEvent): string => {
  if (event.kind === "progress") {
    return `${event.phase}: ${event.message}`;
  }

  if (event.kind === "answer") {
    return "Grounded answer drafted";
  }

  if (event.kind === "retrieval-packet") {
    return "Retrieval packet materialized";
  }

  if (event.kind === "failed") {
    return event.message;
  }

  return `Run ${event.kind}`;
};

const errorToMessage = (error: unknown): string => {
  if (P.or(S.is(RepoMemoryClientError), S.is(S.instanceOf(Error)))(error)) {
    return error.message;
  }

  if (P.isString(error)) {
    return error;
  }

  if (P.isObject(error) && P.hasProperty(error, "message") && P.isString(error.message)) {
    return error.message;
  }

  return "The desktop shell hit an unexpected error.";
};

const toClientError = (error: unknown): RepoMemoryClientError =>
  S.is(RepoMemoryClientError)(error)
    ? error
    : new RepoMemoryClientError({
        message: errorToMessage(error),
        status: 500,
        cause: O.none(),
      });

const findRepoById = (repos: ReadonlyArray<RepoRegistration>, repoId: string): RepoRegistration | null =>
  pipe(
    repos,
    A.findFirst((repo) => repo.id === repoId),
    O.getOrElse(() => null)
  );

const findRunById = (runs: ReadonlyArray<RepoRun>, runId: string): RepoRun | null =>
  pipe(
    runs,
    A.findFirst((run) => run.id === runId),
    O.getOrElse(() => null)
  );

const projectRunForUi = (runs: ReadonlyArray<RepoRun>, event: RunStreamEvent): ReadonlyArray<RepoRun> => {
  const currentRun = findRunById(runs, event.runId);

  return pipe(
    Effect.result(projectRunEvent(currentRun === null ? O.none() : O.some(currentRun), event)),
    Effect.runSync,
    Result.match({
      onFailure: () => runs,
      onSuccess: (run) => upsertRun(runs, run),
    })
  );
};

const findLatestAnswerEvent: (
  events: ReadonlyArray<RunStreamEvent>
) => O.Option<Extract<RunStreamEvent, { readonly kind: "answer" }>> = flow(
  A.filter((event): event is Extract<RunStreamEvent, { readonly kind: "answer" }> => event.kind === "answer"),
  A.last
);

const findLatestPacketEvent: (
  events: ReadonlyArray<RunStreamEvent>
) => O.Option<Extract<RunStreamEvent, { readonly kind: "retrieval-packet" }>> = flow(
  A.filter(
    (event): event is Extract<RunStreamEvent, { readonly kind: "retrieval-packet" }> =>
      event.kind === "retrieval-packet"
  ),
  A.last
);

const formatPacketEntity = (
  value:
    | { readonly kind: "file"; readonly filePath: string }
    | { readonly kind: "module"; readonly moduleSpecifier: string }
    | { readonly kind: "symbol"; readonly symbolName: string; readonly symbolKind: string; readonly filePath: string }
    | {
        readonly kind: "parameter";
        readonly name: string;
        readonly type: O.Option<string>;
        readonly description: O.Option<string>;
      }
    | { readonly kind: "return" | "throw"; readonly type: O.Option<string>; readonly description: O.Option<string> }
): string => {
  if (value.kind === "file") {
    return value.filePath;
  }

  if (value.kind === "module") {
    return value.moduleSpecifier;
  }

  if (value.kind === "symbol") {
    return `${value.symbolName} (${value.symbolKind}) in ${value.filePath}`;
  }

  const header =
    value.kind === "parameter"
      ? pipe(
          value.type,
          O.match({
            onNone: () => value.name,
            onSome: (type) => `${value.name}: ${type}`,
          })
        )
      : pipe(
          value.type,
          O.getOrElse(() => "unspecified")
        );

  return pipe(
    value.description,
    O.match({
      onNone: () => header,
      onSome: (description) => `${header} - ${description}`,
    })
  );
};

const packetPayloadLines = (packet: RetrievalPacket): ReadonlyArray<string> =>
  pipe(
    packet.payload,
    O.match({
      onNone: () => [],
      onSome: (payload) => {
        if (payload.family === "count") {
          return [`target: ${payload.target}`, `count: ${payload.count}`];
        }

        if (payload.family === "subject-detail") {
          return [
            `subject: ${formatPacketEntity(payload.subject)}`,
            `aspect: ${payload.aspect}`,
            `facets: ${
              pipe(
                payload.facets,
                A.map((facet) => facet.kind),
                A.join(", ")
              ) || "none"
            }`,
          ];
        }

        if (payload.family === "relation-list") {
          return [
            `relation: ${payload.relation}`,
            `subject: ${formatPacketEntity(payload.subject)}`,
            `items: ${pipe(payload.items, A.map(formatPacketEntity), A.join("; ")) || "none"}`,
          ];
        }

        return [
          `query: ${payload.query}`,
          `items: ${pipe(payload.items, A.map(formatPacketEntity), A.join("; ")) || "none"}`,
        ];
      },
    })
  );

const packetIssueLines = (packet: RetrievalPacket): ReadonlyArray<string> =>
  pipe(
    packet.issue,
    O.match({
      onNone: () => [],
      onSome: (issue) => {
        if (issue.kind === "no-match") {
          return [`requested: ${issue.requested.value}`, `note: ${issue.note}`];
        }

        if (issue.kind === "ambiguous") {
          return [
            `requested: ${issue.requested.value}`,
            `candidates: ${pipe(
              issue.candidates,
              A.map((candidate) => formatPacketEntity(candidate.subject)),
              A.join("; ")
            )}`,
          ];
        }

        return [`requested: ${issue.requested.value}`, `reason: ${issue.reason}`];
      },
    })
  );

const answerFromRun = (run: QueryRun, events: ReadonlyArray<RunStreamEvent>): string =>
  pipe(
    retrievalPacketFromRun(run, events),
    O.map(renderRetrievalPacketAnswer),
    O.orElse(() => run.answer),
    O.orElse(() =>
      pipe(
        findLatestAnswerEvent(events),
        O.map((event) => event.answer)
      )
    ),
    O.getOrElse(() => "No grounded answer has been materialized yet.")
  );

const citationsFromRun = (run: QueryRun, events: ReadonlyArray<RunStreamEvent>): ReadonlyArray<Citation> =>
  run.citations.length > 0
    ? run.citations
    : pipe(
        findLatestAnswerEvent(events),
        O.map((event) => event.citations),
        O.getOrElse(() => [] as const)
      );

const retrievalPacketFromRun = (run: QueryRun, events: ReadonlyArray<RunStreamEvent>): O.Option<RetrievalPacket> =>
  pipe(
    run.retrievalPacket,
    O.orElse(() =>
      pipe(
        findLatestPacketEvent(events),
        O.map((event) => event.packet)
      )
    )
  );

const latestKnownRunCursor = (run: RepoRun, events: ReadonlyArray<RunStreamEvent>): O.Option<RunCursor> =>
  pipe(
    events,
    A.last,
    O.map((event) => event.sequence),
    O.map((sequence) => Math.max(sequence, run.lastEventSequence)),
    O.orElse(() => O.some(run.lastEventSequence)),
    O.map(decodeRunCursor)
  );

const formatCitationSpan = (citation: Citation): string => {
  const columnSuffix = pipe(
    citation.span.startColumn,
    O.map((startColumn) =>
      pipe(
        citation.span.endColumn,
        O.map((endColumn) => `:${startColumn}-${endColumn}`),
        O.getOrElse(() => `:${startColumn}`)
      )
    ),
    O.getOrElse(() => "")
  );

  return `${citation.span.filePath}:${citation.span.startLine}-${citation.span.endLine}${columnSuffix}`;
};

const optionToNullable = <A,>(option: O.Option<A>): A | null => O.getOrNull(option);

type DirectSidecarConnectionTargetInput = {
  readonly shellMode: ShellMode;
  readonly baseUrlInput: string;
};

type DirectSidecarConnectionTarget = {
  readonly baseUrl: string;
  readonly persistBaseUrl: boolean;
  readonly statusMessage: O.Option<string>;
};

const directSidecarConnectionTarget = ({
  shellMode,
  baseUrlInput,
}: DirectSidecarConnectionTargetInput): DirectSidecarConnectionTarget => {
  const browserBaseUrl = browserDevClientBaseUrl();

  if (shellMode === "browser" && browserBaseUrl !== null) {
    return {
      baseUrl: browserBaseUrl,
      persistBaseUrl: false,
      statusMessage: O.some("Connecting to the repo-memory sidecar through the desktop proxy."),
    };
  }

  return {
    baseUrl: baseUrlInput,
    persistBaseUrl: true,
    statusMessage:
      shellMode === "browser"
        ? O.some("Raw Vite origin detected. Connecting to the saved direct sidecar URL.")
        : O.none(),
  };
};

const managedConnectionStatusMessage = (options?: { readonly restart?: boolean }): string =>
  options?.restart === true ? "Restarting the managed local sidecar." : "Launching the managed local sidecar.";

type ConnectionSummaryTextInput = {
  readonly bootstrap: SidecarBootstrap | null;
  readonly managedState: ManagedSidecarState | null;
  readonly nativeAvailable: boolean;
  readonly shellMode: ShellMode;
};

const connectionSummaryText = ({
  bootstrap,
  managedState,
  nativeAvailable,
  shellMode,
}: ConnectionSummaryTextInput): string => {
  if (bootstrap !== null) {
    return bootstrap.status;
  }

  if (!nativeAvailable || shellMode !== "native-managed") {
    return "Waiting for a sidecar.";
  }

  if (managedState === null) {
    return "Managed sidecar booting.";
  }

  return `${managedState.mode} ${managedState.status}`;
};

const repoSummaryText = (repoCount: number): string =>
  repoCount === 0 ? "No repo registered yet." : "Control plane registry loaded.";

const runSummaryText = (runCount: number): string =>
  runCount === 0 ? "No durable runs yet." : "Workflow projections ready for inspection.";

const streamSummaryValue = (activeStreamRunId: string | null): string =>
  activeStreamRunId === null ? "inactive" : "live";

const streamSummaryText = (activeStreamRunId: string | null): string =>
  activeStreamRunId === null ? "Select a run to replay." : activeStreamRunId;

const browserConnectionNote = (): string =>
  browserDevClientBaseUrl() === null
    ? "Raw Vite dev does not include the desktop proxy. Use the saved direct sidecar URL here, or switch back to the default portless desktop flow."
    : "Browser dev uses the HTTPS desktop proxy and the portless sidecar route. Use manual override only when you need to inspect a different runtime.";

const formatIndexProjectionText = (indexedFileCount: O.Option<number>): string =>
  O.match(indexedFileCount, {
    onNone: () => "The index run has not published a final file count yet.",
    onSome: (count) => `Indexed ${count} files in the latest durable snapshot.`,
  });

const formatArtifactAvailability = (artifactAvailable: O.Option<boolean>): string =>
  O.match(artifactAvailable, {
    onNone: () => "Not yet",
    onSome: (available) => (available ? "Available" : "Not yet"),
  });

type SummaryCardProps = {
  readonly label: string;
  readonly value: React.ReactNode;
  readonly description: React.ReactNode;
};

const SummaryCard = ({ label, value, description }: SummaryCardProps) => (
  <article className="summary-card">
    <span className="summary-label">{label}</span>
    <strong>{value}</strong>
    <p>{description}</p>
  </article>
);

type ConnectionControlsProps = {
  readonly nativeAvailable: boolean;
  readonly shellMode: ShellMode;
  readonly baseUrlInput: string;
  readonly connectionState: ConnectionState;
  readonly client: RepoMemoryClientShape | null;
  readonly onBaseUrlInputChange: (value: string) => void;
  readonly onNormalizeBaseUrlInput: () => void;
  readonly onConnect: () => void;
  readonly onConnectManagedRestart: () => void;
  readonly onDisconnect: () => void;
  readonly onEnableManualOverride: () => void;
  readonly onRefresh: () => void;
  readonly onShellModeChange: (mode: ShellMode) => void;
  readonly onStopManagedConnection: () => void;
};

const ConnectionControls = (props: ConnectionControlsProps) => {
  if (props.nativeAvailable && props.shellMode === "native-managed") {
    return <ManagedConnectionControls {...props} />;
  }

  if (props.shellMode === "manual-override") {
    return <ManualConnectionForm {...props} />;
  }

  return <BrowserConnectionControls {...props} />;
};

type ManagedConnectionControlsProps = Pick<
  ConnectionControlsProps,
  | "client"
  | "connectionState"
  | "onConnectManagedRestart"
  | "onEnableManualOverride"
  | "onRefresh"
  | "onStopManagedConnection"
>;

const ManagedConnectionControls = ({
  client,
  connectionState,
  onConnectManagedRestart,
  onEnableManualOverride,
  onRefresh,
  onStopManagedConnection,
}: ManagedConnectionControlsProps) => (
  <div className="stack">
    <p className="field-note">
      The native shell owns sidecar launch, bootstrap discovery, and health checks before the client connects.
    </p>
    <div className="button-row">
      <button type="button" disabled={connectionState === "connecting"} onClick={onConnectManagedRestart}>
        {connectionState === "connecting" ? "Starting..." : "Restart sidecar"}
      </button>
      <button type="button" className="button-secondary" disabled={client === null} onClick={onRefresh}>
        Refresh
      </button>
      <button
        type="button"
        className="button-secondary"
        disabled={connectionState === "connecting"}
        onClick={onStopManagedConnection}
      >
        Stop sidecar
      </button>
    </div>
    <details className="debug-panel">
      <summary>Debug override</summary>
      <div className="stack">
        <p className="field-note">
          Stop the managed sidecar and switch back to the old manual URL flow only when you need to inspect a different
          runtime.
        </p>
        <button type="button" className="button-secondary" onClick={onEnableManualOverride}>
          Use manual URL override
        </button>
      </div>
    </details>
  </div>
);

type ManualConnectionFormProps = Pick<
  ConnectionControlsProps,
  | "baseUrlInput"
  | "client"
  | "connectionState"
  | "nativeAvailable"
  | "onBaseUrlInputChange"
  | "onConnect"
  | "onDisconnect"
  | "onNormalizeBaseUrlInput"
  | "onRefresh"
  | "onShellModeChange"
>;

const ManualConnectionForm = ({
  baseUrlInput,
  client,
  connectionState,
  nativeAvailable,
  onBaseUrlInputChange,
  onConnect,
  onDisconnect,
  onNormalizeBaseUrlInput,
  onRefresh,
  onShellModeChange,
}: ManualConnectionFormProps) => (
  <form
    className="stack"
    onSubmit={(event) => {
      event.preventDefault();
      onConnect();
    }}
  >
    <label className="field">
      <span>Sidecar base URL</span>
      <input
        value={baseUrlInput}
        onChange={(event) => onBaseUrlInputChange(event.target.value)}
        onBlur={onNormalizeBaseUrlInput}
        placeholder={defaultBaseUrl}
      />
    </label>
    <p className="field-note">Use the root sidecar URL. Legacy `/api/v0` input is normalized automatically.</p>
    <div className="button-row">
      <button type="submit" disabled={connectionState === "connecting"}>
        {connectionState === "connecting" ? "Connecting..." : "Connect"}
      </button>
      <button type="button" className="button-secondary" disabled={client === null} onClick={onRefresh}>
        Refresh
      </button>
      <button type="button" className="button-secondary" disabled={client === null} onClick={onDisconnect}>
        Disconnect
      </button>
      <ManualModeSwitcher
        connectionState={connectionState}
        nativeAvailable={nativeAvailable}
        onShellModeChange={onShellModeChange}
      />
    </div>
  </form>
);

type ManualModeSwitcherProps = {
  readonly connectionState: ConnectionState;
  readonly nativeAvailable: boolean;
  readonly onShellModeChange: (mode: ShellMode) => void;
};

const ManualModeSwitcher = ({ connectionState, nativeAvailable, onShellModeChange }: ManualModeSwitcherProps) => {
  const nextMode = nativeAvailable ? "native-managed" : "browser";
  const label = nativeAvailable ? "Resume managed sidecar" : "Use desktop proxy";

  return (
    <button
      type="button"
      className="button-secondary"
      disabled={connectionState === "connecting"}
      onClick={() => onShellModeChange(nextMode)}
    >
      {label}
    </button>
  );
};

type BrowserConnectionControlsProps = Pick<
  ConnectionControlsProps,
  "client" | "connectionState" | "onConnect" | "onDisconnect" | "onRefresh" | "onShellModeChange"
>;

const BrowserConnectionControls = ({
  client,
  connectionState,
  onConnect,
  onDisconnect,
  onRefresh,
  onShellModeChange,
}: BrowserConnectionControlsProps) => (
  <div className="stack">
    <p className="field-note">{browserConnectionNote()}</p>
    <div className="button-row">
      <button type="button" disabled={connectionState === "connecting"} onClick={onConnect}>
        {connectionState === "connecting" ? "Connecting..." : "Connect"}
      </button>
      <button type="button" className="button-secondary" disabled={client === null} onClick={onRefresh}>
        Refresh
      </button>
      <button type="button" className="button-secondary" disabled={client === null} onClick={onDisconnect}>
        Disconnect
      </button>
    </div>
    <details className="debug-panel">
      <summary>Debug override</summary>
      <div className="stack">
        <p className="field-note">
          Use a direct sidecar URL only when you need to inspect a different runtime or bypass the desktop proxy.
        </p>
        <button type="button" className="button-secondary" onClick={() => onShellModeChange("manual-override")}>
          Use manual URL override
        </button>
      </div>
    </details>
  </div>
);

type ConnectionDiagnosticsProps = {
  readonly bootstrap: SidecarBootstrap | null;
  readonly errorMessage: string | null;
  readonly managedState: ManagedSidecarState | null;
};

const ConnectionDiagnostics = ({ bootstrap, errorMessage, managedState }: ConnectionDiagnosticsProps) => (
  <>
    {errorMessage === null ? null : <p className="notice notice-error">{errorMessage}</p>}
    {managedState === null ? null : (
      <p className="notice">
        Native state: <code>{managedState.mode}</code> {managedState.status}
      </p>
    )}
    {managedState !== null && managedState.stderrTail.length > 0 ? (
      <div className="notice">
        <strong>Sidecar stderr</strong>
        <pre className="mono-block">{managedState.stderrTail.join("\n")}</pre>
      </div>
    ) : null}
    {bootstrap === null ? null : <BootstrapMetaGrid bootstrap={bootstrap} managedState={managedState} />}
  </>
);

type BootstrapMetaGridProps = {
  readonly bootstrap: SidecarBootstrap;
  readonly managedState: ManagedSidecarState | null;
};

const BootstrapMetaGrid = ({ bootstrap, managedState }: BootstrapMetaGridProps) => (
  <dl className="meta-grid">
    <div>
      <dt>Host</dt>
      <dd>
        {bootstrap.host}:{bootstrap.port}
      </dd>
    </div>
    <div>
      <dt>Version</dt>
      <dd>{bootstrap.version}</dd>
    </div>
    <div>
      <dt>PID</dt>
      <dd>{bootstrap.pid}</dd>
    </div>
    <div>
      <dt>Started</dt>
      <dd>{formatDateTime(bootstrap.startedAt)}</dd>
    </div>
    <ManagedBootstrapMetaRows managedState={managedState} />
  </dl>
);

const ManagedBootstrapMetaRows = ({ managedState }: { readonly managedState: ManagedSidecarState | null }) => {
  if (managedState === null) {
    return null;
  }

  return (
    <>
      <div>
        <dt>Launch mode</dt>
        <dd>{managedState.mode}</dd>
      </div>
      <div>
        <dt>Native state</dt>
        <dd>{managedState.status}</dd>
      </div>
    </>
  );
};

type SelectedRunDetailPanelProps = {
  readonly actionState: ActionState;
  readonly activeStreamRunId: string | null;
  readonly client: RepoMemoryClientShape | null;
  readonly onInterruptRun: () => void;
  readonly onResumeRun: () => void;
  readonly onStreamRun: () => void;
  readonly repos: ReadonlyArray<RepoRegistration>;
  readonly selectedRun: RepoRun | null;
  readonly selectedRunEvents: ReadonlyArray<RunStreamEvent>;
};

const SelectedRunDetailPanel = ({
  actionState,
  activeStreamRunId,
  client,
  onInterruptRun,
  onResumeRun,
  onStreamRun,
  repos,
  selectedRun,
  selectedRunEvents,
}: SelectedRunDetailPanelProps) => (
  <section className="panel panel-detail">
    <div className="panel-heading">
      <div>
        <p className="panel-kicker">Inspection</p>
        <h2>Selected run detail</h2>
      </div>
      <SelectedRunDetailStatus activeStreamRunId={activeStreamRunId} selectedRun={selectedRun} />
    </div>
    <SelectedRunDetailBody
      actionState={actionState}
      client={client}
      onInterruptRun={onInterruptRun}
      onResumeRun={onResumeRun}
      onStreamRun={onStreamRun}
      repos={repos}
      selectedRun={selectedRun}
      selectedRunEvents={selectedRunEvents}
    />
  </section>
);

type SelectedRunDetailStatusProps = {
  readonly activeStreamRunId: string | null;
  readonly selectedRun: RepoRun | null;
};

const SelectedRunDetailStatus = ({ activeStreamRunId, selectedRun }: SelectedRunDetailStatusProps) => {
  if (selectedRun === null) {
    return null;
  }

  return (
    <div className="detail-status">
      <span className={`status-pill ${runStatusTone(selectedRun.status)}`}>{selectedRun.status}</span>
      <LiveStreamPill isLive={activeStreamRunId === selectedRun.id} />
    </div>
  );
};

const LiveStreamPill = ({ isLive }: { readonly isLive: boolean }) =>
  isLive ? <span className="status-pill status-running">live stream</span> : null;

type SelectedRunDetailBodyProps = {
  readonly actionState: ActionState;
  readonly client: RepoMemoryClientShape | null;
  readonly onInterruptRun: () => void;
  readonly onResumeRun: () => void;
  readonly onStreamRun: () => void;
  readonly repos: ReadonlyArray<RepoRegistration>;
  readonly selectedRun: RepoRun | null;
  readonly selectedRunEvents: ReadonlyArray<RunStreamEvent>;
};

const SelectedRunDetailBody = ({
  actionState,
  client,
  onInterruptRun,
  onResumeRun,
  onStreamRun,
  repos,
  selectedRun,
  selectedRunEvents,
}: SelectedRunDetailBodyProps) => {
  if (selectedRun === null) {
    return (
      <p className="empty-state">Select a run to inspect its answer, citations, retrieval packet, and event feed.</p>
    );
  }

  return (
    <div className="detail-stack">
      <RunOverviewCard
        actionState={actionState}
        client={client}
        onInterruptRun={onInterruptRun}
        onResumeRun={onResumeRun}
        onStreamRun={onStreamRun}
        repos={repos}
        selectedRun={selectedRun}
      />
      <RunProjectionDetail selectedRun={selectedRun} selectedRunEvents={selectedRunEvents} />
      <RunErrorCard errorMessage={selectedRun.errorMessage} />
      <EventFeedCard selectedRunEvents={selectedRunEvents} />
    </div>
  );
};

type RunOverviewCardProps = {
  readonly actionState: ActionState;
  readonly client: RepoMemoryClientShape | null;
  readonly onInterruptRun: () => void;
  readonly onResumeRun: () => void;
  readonly onStreamRun: () => void;
  readonly repos: ReadonlyArray<RepoRegistration>;
  readonly selectedRun: RepoRun;
};

const RunOverviewCard = ({
  actionState,
  client,
  onInterruptRun,
  onResumeRun,
  onStreamRun,
  repos,
  selectedRun,
}: RunOverviewCardProps) => (
  <section className="detail-card">
    <div className="detail-card-top">
      <h3>{formatRunTitle(selectedRun)}</h3>
      <RunActionButtons
        actionState={actionState}
        client={client}
        onInterruptRun={onInterruptRun}
        onResumeRun={onResumeRun}
        onStreamRun={onStreamRun}
        selectedRun={selectedRun}
      />
    </div>
    <dl className="meta-grid">
      <div>
        <dt>Run ID</dt>
        <dd>{selectedRun.id}</dd>
      </div>
      <div>
        <dt>Repo</dt>
        <dd>{findRepoById(repos, selectedRun.repoId)?.displayName ?? selectedRun.repoId}</dd>
      </div>
      <div>
        <dt>Accepted</dt>
        <dd>{formatDateTime(selectedRun.acceptedAt)}</dd>
      </div>
      <div>
        <dt>Started</dt>
        <dd>{formatOptionalDateTime(selectedRun.startedAt)}</dd>
      </div>
      <div>
        <dt>Completed</dt>
        <dd>{formatOptionalDateTime(selectedRun.completedAt)}</dd>
      </div>
      <div>
        <dt>Last sequence</dt>
        <dd>{selectedRun.lastEventSequence}</dd>
      </div>
    </dl>
  </section>
);

type RunActionButtonsProps = {
  readonly actionState: ActionState;
  readonly client: RepoMemoryClientShape | null;
  readonly onInterruptRun: () => void;
  readonly onResumeRun: () => void;
  readonly onStreamRun: () => void;
  readonly selectedRun: RepoRun;
};

const RunActionButtons = ({
  actionState,
  client,
  onInterruptRun,
  onResumeRun,
  onStreamRun,
  selectedRun,
}: RunActionButtonsProps) => (
  <div className="button-row">
    <InterruptRunButton
      actionState={actionState}
      client={client}
      onInterruptRun={onInterruptRun}
      selectedRun={selectedRun}
    />
    <ResumeRunButton actionState={actionState} client={client} onResumeRun={onResumeRun} selectedRun={selectedRun} />
    <button type="button" className="button-secondary" disabled={client === null} onClick={onStreamRun}>
      Replay stream
    </button>
  </div>
);

type InterruptRunButtonProps = {
  readonly actionState: ActionState;
  readonly client: RepoMemoryClientShape | null;
  readonly onInterruptRun: () => void;
  readonly selectedRun: RepoRun;
};

const InterruptRunButton = ({ actionState, client, onInterruptRun, selectedRun }: InterruptRunButtonProps) => {
  if (selectedRun.status !== "accepted" && selectedRun.status !== "running") {
    return null;
  }

  return (
    <button type="button" disabled={client === null || actionState !== "idle"} onClick={onInterruptRun}>
      Interrupt run
    </button>
  );
};

type ResumeRunButtonProps = {
  readonly actionState: ActionState;
  readonly client: RepoMemoryClientShape | null;
  readonly onResumeRun: () => void;
  readonly selectedRun: RepoRun;
};

const ResumeRunButton = ({ actionState, client, onResumeRun, selectedRun }: ResumeRunButtonProps) => {
  if (selectedRun.status !== "interrupted") {
    return null;
  }

  return (
    <button type="button" disabled={client === null || actionState !== "idle"} onClick={onResumeRun}>
      Resume run
    </button>
  );
};

type RunProjectionDetailProps = {
  readonly selectedRun: RepoRun;
  readonly selectedRunEvents: ReadonlyArray<RunStreamEvent>;
};

const RunProjectionDetail = ({ selectedRun, selectedRunEvents }: RunProjectionDetailProps) => {
  if (selectedRun.kind === "index") {
    return <IndexProjectionCard selectedRun={selectedRun} />;
  }

  return <QueryProjectionCards selectedRun={selectedRun} selectedRunEvents={selectedRunEvents} />;
};

const IndexProjectionCard = ({
  selectedRun,
}: {
  readonly selectedRun: Extract<RepoRun, { readonly kind: "index" }>;
}) => (
  <section className="detail-card">
    <h3>Index projection</h3>
    <p className="answer-copy">{formatIndexProjectionText(selectedRun.indexedFileCount)}</p>
  </section>
);

type QueryProjectionCardsProps = {
  readonly selectedRun: QueryRun;
  readonly selectedRunEvents: ReadonlyArray<RunStreamEvent>;
};

const QueryProjectionCards = ({ selectedRun, selectedRunEvents }: QueryProjectionCardsProps) => (
  <>
    <GroundedAnswerCard answer={answerFromRun(selectedRun, selectedRunEvents)} />
    <QueryStagesCard queryStages={selectedRun.queryStages} />
    <RetrievalPacketCard packet={retrievalPacketFromRun(selectedRun, selectedRunEvents)} />
    <CitationsCard citations={citationsFromRun(selectedRun, selectedRunEvents)} />
  </>
);

const GroundedAnswerCard = ({ answer }: { readonly answer: string }) => (
  <section className="detail-card">
    <h3>Grounded answer</h3>
    <p className="answer-copy">{answer}</p>
  </section>
);

const QueryStagesCard = ({ queryStages }: { readonly queryStages: O.Option<QueryStageTrace> }) => {
  const content = O.match(queryStages, {
    onNone: () => <p className="empty-state">No projected query stages are available yet.</p>,
    onSome: (trace) => {
      const stageCards = pipe(
        queryStageEntries(trace),
        A.map((stage) => <QueryStageCard key={stage.phase} stage={stage} />)
      );

      return <div className="query-stage-grid">{stageCards}</div>;
    },
  });

  return (
    <section className="detail-card">
      <h3>Query stages</h3>
      {content}
    </section>
  );
};

const QueryStageCard = ({ stage }: { readonly stage: QueryStage }) => (
  <article className="query-stage-card">
    <div className="query-stage-top">
      <strong>{formatQueryStageLabel(stage.phase)}</strong>
      <span className={`metric-chip ${formatQueryStageStatusTone(stage.status)}`}>{stage.status}</span>
    </div>
    <p className="field-note">{O.getOrElse(stage.latestMessage, () => "No stage message has been projected yet.")}</p>
    <dl className="meta-grid query-stage-meta">
      <div>
        <dt>Started</dt>
        <dd>{formatOptionalDateTime(stage.startedAt)}</dd>
      </div>
      <div>
        <dt>Completed</dt>
        <dd>{formatOptionalDateTime(stage.completedAt)}</dd>
      </div>
      <div>
        <dt>Percent</dt>
        <dd>{formatOptionalPercent(stage.percent)}</dd>
      </div>
      <StageArtifactMeta stage={stage} />
    </dl>
  </article>
);

const StageArtifactMeta = ({ stage }: { readonly stage: QueryStage }) => {
  if (stage.phase !== "packet" && stage.phase !== "answer") {
    return null;
  }

  return (
    <div>
      <dt>Artifact</dt>
      <dd>{formatArtifactAvailability(stage.artifactAvailable)}</dd>
    </div>
  );
};

const RetrievalPacketCard = ({ packet }: { readonly packet: O.Option<RetrievalPacket> }) => {
  const content = O.match(packet, {
    onNone: () => <p className="empty-state">No retrieval packet materialized yet.</p>,
    onSome: (retrievalPacket) => <RetrievalPacketDetail packet={retrievalPacket} />,
  });

  return (
    <section className="detail-card">
      <h3>Retrieval packet</h3>
      {content}
    </section>
  );
};

const RetrievalPacketDetail = ({ packet }: { readonly packet: RetrievalPacket }) => (
  <div className="packet-shell">
    <p className="packet-summary">{packet.summary}</p>
    <dl className="meta-grid">
      <div>
        <dt>Query</dt>
        <dd>{packet.query}</dd>
      </div>
      <div>
        <dt>Normalized</dt>
        <dd>{packet.normalizedQuery}</dd>
      </div>
      <div>
        <dt>Query kind</dt>
        <dd>{packet.queryKind}</dd>
      </div>
      <div>
        <dt>Outcome</dt>
        <dd>{packet.outcome}</dd>
      </div>
      <div>
        <dt>Retrieved</dt>
        <dd>{formatDateTime(packet.retrievedAt)}</dd>
      </div>
      <div>
        <dt>Snapshot</dt>
        <dd>{O.getOrElse(packet.sourceSnapshotId, () => "none")}</dd>
      </div>
      <div>
        <dt>Citations</dt>
        <dd>{packet.citations.length}</dd>
      </div>
    </dl>
    <PacketLineSection lines={packetPayloadLines(packet)} title="Payload" />
    <PacketLineSection lines={packetIssueLines(packet)} title="Issue" />
    <PacketNotes notes={packet.notes} />
  </div>
);

type PacketLineSectionProps = {
  readonly lines: ReadonlyArray<string>;
  readonly title: string;
};

const PacketLineSection = ({ lines, title }: PacketLineSectionProps) =>
  A.match(lines, {
    onEmpty: () => null,
    onNonEmpty: (nonEmptyLines) => {
      const lineItems = pipe(
        nonEmptyLines,
        A.map((line) => <li key={line}>{line}</li>)
      );

      return (
        <>
          <h4>{title}</h4>
          <ul className="note-list">{lineItems}</ul>
        </>
      );
    },
  });

const PacketNotes = ({ notes }: { readonly notes: ReadonlyArray<string> }) =>
  A.match(notes, {
    onEmpty: () => null,
    onNonEmpty: (nonEmptyNotes) => {
      const noteItems = pipe(
        nonEmptyNotes,
        A.map((note) => <li key={note}>{note}</li>)
      );

      return <ul className="note-list">{noteItems}</ul>;
    },
  });

const CitationsCard = ({ citations }: { readonly citations: ReadonlyArray<Citation> }) => {
  const content = A.match(citations, {
    onEmpty: () => <p className="empty-state">No citations are available for this run yet.</p>,
    onNonEmpty: (nonEmptyCitations) => {
      const citationCards = pipe(
        nonEmptyCitations,
        A.map((citation) => <CitationCard citation={citation} key={citation.id} />)
      );

      return <div className="citation-list">{citationCards}</div>;
    },
  });

  return (
    <section className="detail-card">
      <h3>Citations</h3>
      {content}
    </section>
  );
};

const CitationCard = ({ citation }: { readonly citation: Citation }) => (
  <article className="citation-card">
    <div className="citation-top">
      <strong>{citation.label}</strong>
      <span>{O.getOrElse(citation.span.symbolName, () => "source span")}</span>
    </div>
    <p>{citation.rationale}</p>
    <code>{formatCitationSpan(citation)}</code>
  </article>
);

const RunErrorCard = ({ errorMessage }: { readonly errorMessage: O.Option<string> }) =>
  O.match(errorMessage, {
    onNone: () => null,
    onSome: (message) => (
      <section className="detail-card">
        <h3>Run error</h3>
        <p className="notice notice-error">{message}</p>
      </section>
    ),
  });

const EventFeedCard = ({ selectedRunEvents }: { readonly selectedRunEvents: ReadonlyArray<RunStreamEvent> }) => {
  const content = A.match(selectedRunEvents, {
    onEmpty: () => (
      <p className="empty-state">No stream events have been replayed for this run in the current shell session.</p>
    ),
    onNonEmpty: (events) => {
      const eventItems = pipe(
        events,
        A.map((event) => (
          <li key={`${event.kind}-${event.sequence}`} className="event-card">
            <div className="event-card-top">
              <strong>{event.kind}</strong>
              <span>#{event.sequence}</span>
            </div>
            <p>{eventLabel(event)}</p>
            <small>{formatDateTime(event.emittedAt)}</small>
          </li>
        ))
      );

      return <ol className="event-list">{eventItems}</ol>;
    },
  });

  return (
    <section className="detail-card">
      <h3>Event feed</h3>
      {content}
    </section>
  );
};

export function RepoMemoryDesktop() {
  const [nativeAvailable] = useState(() => isNativeDesktop());
  const [shellMode, setShellMode] = useState<ShellMode>(() => (isNativeDesktop() ? "native-managed" : "browser"));
  const [baseUrlInput, setBaseUrlInput] = useState(() => readPersistedSidecarBaseUrl() ?? defaultBaseUrl);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [statusMessage, setStatusMessage] = useState(
    isNativeDesktop()
      ? "Launching the managed local sidecar."
      : "Point the shell at a local sidecar and inspect its public protocol."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [client, setClient] = useState<RepoMemoryClientShape | null>(null);
  const [bootstrap, setBootstrap] = useState<SidecarBootstrap | null>(null);
  const [managedState, setManagedState] = useState<ManagedSidecarState | null>(null);
  const [repos, setRepos] = useState<ReadonlyArray<RepoRegistration>>([]);
  const [runs, setRuns] = useState<ReadonlyArray<RepoRun>>([]);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [selectedRunId, setSelectedRunId] = useState("");
  const [repoPathInput, setRepoPathInput] = useState("");
  const [repoDisplayNameInput, setRepoDisplayNameInput] = useState("");
  const [questionInput, setQuestionInput] = useState("describe symbol `RunId`");
  const [eventsByRunId, setEventsByRunId] = useState<Record<string, ReadonlyArray<RunStreamEvent>>>({});
  const [activeStreamRunId, setActiveStreamRunId] = useState<string | null>(null);
  const streamFiberRef = useRef<Fiber.Fiber<void> | null>(null);
  const connectAbortRef = useRef<AbortController | null>(null);

  const selectedRepo = useMemo(() => findRepoById(repos, selectedRepoId), [repos, selectedRepoId]);
  const selectedRun = useMemo(() => findRunById(runs, selectedRunId), [runs, selectedRunId]);
  const selectedRunEvents = selectedRunId === "" ? [] : (eventsByRunId[selectedRunId] ?? []);

  useEffect(() => {
    persistSidecarBaseUrl(baseUrlInput);
  }, [baseUrlInput]);

  useEffect(
    () => () => {
      connectAbortRef.current?.abort();
      if (streamFiberRef.current !== null) {
        Effect.runFork(Fiber.interrupt(streamFiberRef.current).pipe(Effect.ignore));
      }
    },
    []
  );

  const stopStreaming = () => {
    if (streamFiberRef.current !== null) {
      Effect.runFork(Fiber.interrupt(streamFiberRef.current).pipe(Effect.ignore));
      streamFiberRef.current = null;
    }

    startTransition(() => {
      setActiveStreamRunId(null);
    });
  };

  const clearClientState = (
    nextStatusMessage: string,
    nextConnectionState: ConnectionState,
    nextErrorMessage: string | null = null
  ) => {
    stopStreaming();

    startTransition(() => {
      setClient(null);
      setBootstrap(null);
      setRepos([]);
      setRuns([]);
      setSelectedRepoId("");
      setSelectedRunId("");
      setEventsByRunId({});
      setConnectionState(nextConnectionState);
      setActionState("idle");
      setErrorMessage(nextErrorMessage);
      setStatusMessage(nextStatusMessage);
    });
  };

  const syncManagedSidecar = async (): Promise<ManagedSidecarState | null> => {
    if (!nativeAvailable) {
      return null;
    }

    try {
      const nextState = await Effect.runPromise(getManagedSidecarState());
      startTransition(() => {
        setManagedState(nextState);
      });
      return nextState;
    } catch {
      startTransition(() => {
        setManagedState(null);
      });
      return null;
    }
  };

  const syncSnapshot = async (
    nextClient: RepoMemoryClientShape,
    options?: {
      readonly preferredRepoId?: string;
      readonly preferredRunId?: string;
    }
  ) => {
    const snapshot = await Effect.runPromise(
      Effect.all({
        repos: nextClient.listRepos,
        runs: nextClient.listRuns,
      })
    );

    const nextRepos = sortRepos(snapshot.repos);
    const nextRuns = sortRuns(snapshot.runs);
    const preferredRepoId = options?.preferredRepoId ?? selectedRepoId;
    const preferredRunId = options?.preferredRunId ?? selectedRunId;

    startTransition(() => {
      setRepos(nextRepos);
      setRuns(nextRuns);
      setSelectedRepoId(findRepoById(nextRepos, preferredRepoId) === null ? (nextRepos[0]?.id ?? "") : preferredRepoId);
      setSelectedRunId(findRunById(nextRuns, preferredRunId) === null ? (nextRuns[0]?.id ?? "") : preferredRunId);
    });
  };

  const refreshRun = async (nextClient: RepoMemoryClientShape, runId: RepoRun["id"]) => {
    const refreshedRun = await Effect.runPromise(nextClient.getRun(runId));

    startTransition(() => {
      setRuns((current) => upsertRun(current, refreshedRun));
      setSelectedRepoId(refreshedRun.repoId);
      setSelectedRunId(refreshedRun.id);
    });
  };

  const connectToBaseUrl = async (
    rawBaseUrl: string,
    options?: {
      readonly persistBaseUrl?: boolean;
    }
  ) => {
    const normalizedBaseUrl = normalizeSidecarBaseUrl(rawBaseUrl);
    const nextClient = await Effect.runPromise(
      makeRepoMemoryClient(
        new RepoMemoryClientConfig({
          baseUrl: normalizedBaseUrl,
          sessionId: desktopSessionId,
        })
      )
    );
    const nextBootstrap = await Effect.runPromise(nextClient.bootstrap.pipe(Effect.timeout(Duration.seconds(12))));

    stopStreaming();
    await syncSnapshot(nextClient);

    startTransition(() => {
      if (options?.persistBaseUrl !== false) {
        setBaseUrlInput(normalizedBaseUrl);
      }
      setClient(nextClient);
      setBootstrap(nextBootstrap);
      setConnectionState("connected");
      setErrorMessage(null);
      setStatusMessage(`Connected to sidecar ${nextBootstrap.baseUrl}.`);
    });

    return nextClient;
  };

  const connect = async () => {
    const ac = new AbortController();
    connectAbortRef.current = ac;

    setConnectionState("connecting");
    setActionState("refreshing");
    setErrorMessage(null);
    setStatusMessage(
      shellMode === "manual-override"
        ? "Connecting to a manual sidecar override."
        : "Connecting to the repo-memory sidecar."
    );

    try {
      const connectionTarget = directSidecarConnectionTarget({ baseUrlInput, shellMode });

      O.match(connectionTarget.statusMessage, {
        onNone: () => undefined,
        onSome: setStatusMessage,
      });

      await connectToBaseUrl(connectionTarget.baseUrl, {
        persistBaseUrl: connectionTarget.persistBaseUrl,
      });
      if (ac.signal.aborted) return;
    } catch (error) {
      if (ac.signal.aborted) return;
      clearClientState("The shell could not reach the repo-memory sidecar.", "error", errorToMessage(error));
    } finally {
      if (!ac.signal.aborted) {
        startTransition(() => {
          setActionState("idle");
        });
      }
    }
  };

  const connectManaged = async (options?: { readonly restart?: boolean }) => {
    if (!nativeAvailable) {
      return;
    }

    const ac = new AbortController();
    connectAbortRef.current = ac;

    setConnectionState("connecting");
    setActionState("refreshing");
    setErrorMessage(null);
    setStatusMessage(managedConnectionStatusMessage(options));

    try {
      if (options?.restart === true) {
        await Effect.runPromise(stopManagedSidecar());
      }

      let nextManagedState: ManagedSidecarState | null = await syncManagedSidecar();
      let nextBootstrap: SidecarBootstrap | null =
        nextManagedState === null ? null : optionToNullable(nextManagedState.bootstrap);

      if (nextManagedState?.status !== "healthy" || nextBootstrap === null) {
        nextBootstrap = await Effect.runPromise(startManagedSidecar());
        nextManagedState = await syncManagedSidecar();
      }

      if (nextBootstrap === null) {
        throw new MissingManagedSidecarBootstrapError({
          message: "Managed sidecar did not report a bootstrap payload.",
        });
      }

      await connectToBaseUrl(managedDevClientBaseUrl(nextBootstrap), {
        persistBaseUrl: false,
      });

      if (ac.signal.aborted) return;

      if (nextManagedState !== null) {
        startTransition(() => {
          setManagedState(nextManagedState);
        });
      }
    } catch (error) {
      if (ac.signal.aborted) return;
      await syncManagedSidecar();
      clearClientState(
        "The native shell could not launch the managed repo-memory sidecar.",
        "error",
        errorToMessage(error)
      );
    } finally {
      if (!ac.signal.aborted) {
        startTransition(() => {
          setActionState("idle");
        });
      }
    }
  };

  const disconnect = () => {
    connectAbortRef.current?.abort();
    clearClientState("Disconnected from the sidecar.", "idle");
  };

  const stopManagedConnection = async () => {
    if (!nativeAvailable) {
      disconnect();
      return;
    }

    connectAbortRef.current?.abort();

    try {
      await Effect.runPromise(stopManagedSidecar());
    } catch (error) {
      setErrorMessage(errorToMessage(error));
    } finally {
      await syncManagedSidecar();
      clearClientState("Stopped the managed local sidecar.", "idle");
    }
  };

  const enableManualOverride = async () => {
    if (nativeAvailable) {
      try {
        await Effect.runPromise(stopManagedSidecar());
      } catch (error) {
        setErrorMessage(errorToMessage(error));
      } finally {
        await syncManagedSidecar();
      }
    }

    setShellMode(nativeAvailable ? "manual-override" : "browser");
    clearClientState("Manual URL override enabled. The native shell is no longer managing a sidecar.", "idle");
  };

  const chooseRepoDirectory = async () => {
    if (!nativeAvailable) {
      return;
    }

    try {
      const nextPath = await Effect.runPromise(pickRepoDirectory());
      O.match(nextPath, {
        onNone: () => undefined,
        onSome: (pickedPath) =>
          startTransition(() => {
            setRepoPathInput(pickedPath);
          }),
      });
    } catch (error) {
      setErrorMessage(errorToMessage(error));
    }
  };

  useEffect(() => {
    if (nativeAvailable && shellMode === "native-managed") {
      void connectManaged();
    }
  }, [nativeAvailable, shellMode]);

  useEffect(() => {
    const runtimeWindow = globalThis.window;

    if (
      client === null ||
      selectedRun === null ||
      isTerminalRunStatus(selectedRun.status) ||
      P.isUndefined(runtimeWindow)
    ) {
      return;
    }

    const intervalId = runtimeWindow.setInterval(() => {
      void refreshRun(client, selectedRun.id).catch((error) => {
        startTransition(() => {
          setErrorMessage(errorToMessage(error));
        });
      });
    }, 1000);

    return () => runtimeWindow.clearInterval(intervalId);
  }, [client, selectedRun?.id, selectedRun?.status]);

  useEffect(() => {
    if (selectedRun === null || !isTerminalRunStatus(selectedRun.status)) {
      return;
    }

    if (activeStreamRunId === selectedRun.id) {
      stopStreaming();
    }

    if (actionState !== "idle") {
      startTransition(() => {
        setActionState("idle");
        setStatusMessage(`Run ${selectedRun.id} reached terminal state: ${selectedRun.status}.`);
      });
    }
  }, [selectedRun?.id, selectedRun?.status, activeStreamRunId, actionState]);

  const refresh = async () => {
    if (client === null) {
      return;
    }

    setActionState("refreshing");
    setErrorMessage(null);

    try {
      if (nativeAvailable && shellMode === "native-managed") {
        await syncManagedSidecar();
      }

      await syncSnapshot(client);

      if (selectedRunId !== "") {
        await refreshRun(client, decodeRunId(selectedRunId));
      }

      setStatusMessage("Reloaded repos and durable runs from the sidecar.");
    } catch (error) {
      setErrorMessage(errorToMessage(error));
    } finally {
      setActionState("idle");
    }
  };

  const handleRunEvent = async (nextClient: RepoMemoryClientShape, runId: RepoRun["id"], event: RunStreamEvent) => {
    startTransition(() => {
      setEventsByRunId((current) => ({
        ...current,
        [runId]: appendRunEvent(current[runId] ?? [], event),
      }));
      setRuns((current) => projectRunForUi(current, event));
    });

    if (event.kind === "answer" || event.kind === "retrieval-packet" || isTerminalEvent(event)) {
      await refreshRun(nextClient, runId);
    }

    if (isTerminalEvent(event)) {
      await syncSnapshot(nextClient, {
        preferredRepoId: selectedRepoId,
        preferredRunId: runId,
      });

      startTransition(() => {
        setActionState("idle");
        setStatusMessage(`Run ${runId} reached terminal state: ${event.kind}.`);
      });
    }
  };

  const streamRun = async (
    nextClient: RepoMemoryClientShape,
    runId: RepoRun["id"],
    cursor: O.Option<RunCursor> = O.none()
  ) => {
    stopStreaming();

    startTransition(() => {
      setActiveStreamRunId(runId);
      setActionState("streaming");
      setStatusMessage(`Streaming replayable events for run ${runId}.`);
      setEventsByRunId((current) => ({
        ...current,
        [runId]: current[runId] ?? [],
      }));
    });

    streamFiberRef.current = Effect.runFork(
      Stream.runForEach(
        nextClient.streamRunEvents(
          new StreamRunEventsRequest({
            runId,
            cursor,
          })
        ),
        (event) => Effect.promise(() => handleRunEvent(nextClient, runId, event)).pipe(Effect.mapError(toClientError))
      ).pipe(
        Effect.catch((error) =>
          Effect.sync(() => {
            setActionState("idle");
            setErrorMessage(error.message);
            setStatusMessage(`Streaming failed for run ${runId}.`);
          })
        ),
        Effect.ensuring(
          Effect.sync(() => {
            setActiveStreamRunId((current) => (current === runId ? null : current));
          })
        )
      )
    );
  };

  const registerRepo = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (client === null || repoPathInput.trim() === "") {
      return;
    }

    setActionState("registering");
    setErrorMessage(null);

    try {
      const registration = await Effect.runPromise(
        client.registerRepo(
          new RepoRegistrationInput({
            repoPath: decodeFilePath(repoPathInput.trim()),
            displayName: repoDisplayNameInput.trim() === "" ? O.none() : O.some(repoDisplayNameInput.trim()),
          })
        )
      );

      await syncSnapshot(client, {
        preferredRepoId: registration.id,
      });

      startTransition(() => {
        setRepoPathInput("");
        setRepoDisplayNameInput("");
        setStatusMessage(`Registered repo ${registration.displayName}.`);
      });
    } catch (error) {
      setErrorMessage(errorToMessage(error));
    } finally {
      setActionState("idle");
    }
  };

  const startIndexRun = async () => {
    if (client === null || selectedRepo === null) {
      return;
    }

    setActionState("indexing");
    setErrorMessage(null);
    setStatusMessage(`Starting index run for ${selectedRepo.displayName}.`);

    try {
      const ack = await Effect.runPromise(
        client.startIndexRun(
          new IndexRepoRunInput({
            repoId: selectedRepo.id,
            sourceFingerprint: O.none(),
          })
        )
      );

      await syncSnapshot(client, {
        preferredRepoId: selectedRepo.id,
        preferredRunId: ack.runId,
      });
      await streamRun(client, ack.runId);
    } catch (error) {
      setActionState("idle");
      setErrorMessage(errorToMessage(error));
    }
  };

  const startQueryRun = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (client === null || selectedRepo === null || questionInput.trim() === "") {
      return;
    }

    setActionState("querying");
    setErrorMessage(null);
    setStatusMessage(`Starting grounded query for ${selectedRepo.displayName}.`);

    try {
      const ack = await Effect.runPromise(
        client.startQueryRun(
          new QueryRepoRunInput({
            repoId: selectedRepo.id,
            question: questionInput.trim(),
            questionFingerprint: O.none(),
          })
        )
      );

      await syncSnapshot(client, {
        preferredRepoId: selectedRepo.id,
        preferredRunId: ack.runId,
      });
      await streamRun(client, ack.runId);
    } catch (error) {
      setActionState("idle");
      setErrorMessage(errorToMessage(error));
    }
  };

  const selectRun = async (runId: RepoRun["id"]) => {
    const nextRun = findRunById(runs, runId);

    startTransition(() => {
      setSelectedRunId(runId);
      setSelectedRepoId(nextRun?.repoId ?? selectedRepoId);
    });

    if (client !== null) {
      try {
        await refreshRun(client, runId);
      } catch (error) {
        setErrorMessage(errorToMessage(error));
      }
    }
  };

  const streamSelectedRun = async () => {
    if (client === null || selectedRun === null) {
      return;
    }

    setErrorMessage(null);

    try {
      await streamRun(client, selectedRun.id);
    } catch (error) {
      setActionState("idle");
      setErrorMessage(errorToMessage(error));
    }
  };

  const interruptSelectedRun = async () => {
    if (client === null || selectedRun === null) {
      return;
    }

    setActionState("interrupting");
    setErrorMessage(null);
    setStatusMessage(`Interrupting run ${selectedRun.id}.`);

    try {
      const latestCursor = latestKnownRunCursor(selectedRun, selectedRunEvents);

      await Effect.runPromise(
        client.interruptRun(
          new InterruptRepoRunRequest({
            runId: selectedRun.id,
          })
        )
      );

      if (activeStreamRunId !== selectedRun.id) {
        await streamRun(client, selectedRun.id, latestCursor);
      }
    } catch (error) {
      setActionState("idle");
      setErrorMessage(errorToMessage(error));
    }
  };

  const resumeSelectedRun = async () => {
    if (client === null || selectedRun === null) {
      return;
    }

    setActionState("resuming");
    setErrorMessage(null);
    setStatusMessage(`Resuming run ${selectedRun.id}.`);

    try {
      const latestCursor = latestKnownRunCursor(selectedRun, selectedRunEvents);
      const ack = await Effect.runPromise(
        client.resumeRun(
          new ResumeRepoRunRequest({
            runId: selectedRun.id,
          })
        )
      );

      await streamRun(client, ack.runId, latestCursor);
    } catch (error) {
      setActionState("idle");
      setErrorMessage(errorToMessage(error));
    }
  };

  return (
    <section className="workspace">
      <div className="summary-strip">
        <SummaryCard
          description={connectionSummaryText({ bootstrap, managedState, nativeAvailable, shellMode })}
          label="Connection"
          value={formatConnectionLabel(connectionState)}
        />
        <SummaryCard description={repoSummaryText(repos.length)} label="Repos" value={repos.length} />
        <SummaryCard description={runSummaryText(runs.length)} label="Runs" value={runs.length} />
        <SummaryCard
          description={streamSummaryText(activeStreamRunId)}
          label="Stream"
          value={streamSummaryValue(activeStreamRunId)}
        />
      </div>

      <div className="workspace-grid">
        <section className="panel panel-connection">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Connection</p>
              <h2>Sidecar control plane</h2>
            </div>
            <span className={`status-pill status-pill-${connectionState}`}>
              {formatConnectionLabel(connectionState)}
            </span>
          </div>
          <ConnectionControls
            baseUrlInput={baseUrlInput}
            client={client}
            connectionState={connectionState}
            nativeAvailable={nativeAvailable}
            onBaseUrlInputChange={setBaseUrlInput}
            onConnect={() => void connect()}
            onConnectManagedRestart={() => void connectManaged({ restart: true })}
            onDisconnect={disconnect}
            onEnableManualOverride={() => void enableManualOverride()}
            onNormalizeBaseUrlInput={() => setBaseUrlInput((current) => normalizeSidecarBaseUrl(current))}
            onRefresh={() => void refresh()}
            onShellModeChange={setShellMode}
            onStopManagedConnection={() => void stopManagedConnection()}
            shellMode={shellMode}
          />
          <p className="status-line">{statusMessage}</p>
          <ConnectionDiagnostics bootstrap={bootstrap} errorMessage={errorMessage} managedState={managedState} />
        </section>

        <section className="panel panel-register">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Registry</p>
              <h2>Register repository</h2>
            </div>
            <span className="status-pill status-pill-neutral">{repos.length} repos</span>
          </div>
          <form className="stack" onSubmit={(event) => void registerRepo(event)}>
            <label className="field">
              <span>Repo path</span>
              <div className="field-row">
                <input
                  value={repoPathInput}
                  onChange={(nextEvent) => setRepoPathInput(nextEvent.target.value)}
                  placeholder="/absolute/path/to/repo"
                  disabled={client === null}
                />
                {nativeAvailable ? (
                  <button
                    type="button"
                    className="button-secondary button-compact"
                    disabled={actionState === "registering"}
                    onClick={() => void chooseRepoDirectory()}
                  >
                    Choose folder
                  </button>
                ) : null}
              </div>
            </label>
            <label className="field">
              <span>Display name</span>
              <input
                value={repoDisplayNameInput}
                onChange={(nextEvent) => setRepoDisplayNameInput(nextEvent.target.value)}
                placeholder="Optional label"
                disabled={client === null}
              />
            </label>
            <button type="submit" disabled={client === null || actionState === "registering"}>
              {actionState === "registering" ? "Registering..." : "Register repo"}
            </button>
          </form>
          <div className="list-shell">
            {repos.length === 0 ? (
              <p className="empty-state">No repositories registered yet.</p>
            ) : (
              repos.map((repo) => (
                <button
                  key={repo.id}
                  type="button"
                  className={repo.id === selectedRepoId ? "list-item list-item-active" : "list-item"}
                  onClick={() => setSelectedRepoId(repo.id)}
                >
                  <div className="list-item-top">
                    <strong>{repo.displayName}</strong>
                    <span className="metric-chip">{repo.language}</span>
                  </div>
                  <p>{repo.repoPath}</p>
                  <small>registered {formatDateTime(repo.registeredAt)}</small>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="panel panel-actions">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Execution</p>
              <h2>Start workflow runs</h2>
            </div>
            <span className="status-pill status-pill-neutral">{actionState}</span>
          </div>
          <div className="stack">
            <label className="field">
              <span>Selected repo</span>
              <select
                value={selectedRepoId}
                onChange={(nextEvent) => setSelectedRepoId(nextEvent.target.value)}
                disabled={client === null || repos.length === 0}
              >
                <option value="">Choose a registered repo</option>
                {repos.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.displayName}
                  </option>
                ))}
              </select>
            </label>
            <div className="button-row">
              <button
                type="button"
                disabled={selectedRepo === null || actionState !== "idle"}
                onClick={() => void startIndexRun()}
              >
                Start index run
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={selectedRun === null || client === null}
                onClick={() => void streamSelectedRun()}
              >
                Stream selected run
              </button>
            </div>
            <form className="stack" onSubmit={(event) => void startQueryRun(event)}>
              <label className="field">
                <span>Grounded question</span>
                <textarea
                  value={questionInput}
                  onChange={(nextEvent) => setQuestionInput(nextEvent.target.value)}
                  rows={4}
                  disabled={selectedRepo === null || actionState === "querying"}
                />
              </label>
              <button type="submit" disabled={selectedRepo === null || actionState !== "idle"}>
                Start query run
              </button>
            </form>
          </div>
          <ul className="note-list">
            <li>Runs are started over the public RPC surface and acknowledged with a `runId`.</li>
            <li>
              The shell replays stream events from the public execution plane and reads durable projections from the
              control plane.
            </li>
            <li>Query answers stay inspectable through persisted citations and retrieval packets.</li>
          </ul>
        </section>

        <section className="panel panel-runs">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Run ledger</p>
              <h2>Durable projections</h2>
            </div>
            <span className="status-pill status-pill-neutral">{runs.length} runs</span>
          </div>
          <div className="list-shell list-shell-runs">
            {runs.length === 0 ? (
              <p className="empty-state">No runs yet. Register a repo and start an index run.</p>
            ) : (
              runs.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  className={run.id === selectedRunId ? "list-item list-item-active" : "list-item"}
                  onClick={() => void selectRun(run.id)}
                >
                  <div className="list-item-top">
                    <strong>{formatRunTitle(run)}</strong>
                    <span className={`status-pill ${runStatusTone(run.status)}`}>{run.status}</span>
                  </div>
                  <p>{summarizeRun(run)}</p>
                  <div className="list-item-bottom">
                    <small>{findRepoById(repos, run.repoId)?.displayName ?? run.repoId}</small>
                    <small>accepted {formatDateTime(run.acceptedAt)}</small>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <SelectedRunDetailPanel
          actionState={actionState}
          activeStreamRunId={activeStreamRunId}
          client={client}
          onInterruptRun={() => void interruptSelectedRun()}
          onResumeRun={() => void resumeSelectedRun()}
          onStreamRun={() => void streamSelectedRun()}
          repos={repos}
          selectedRun={selectedRun}
          selectedRunEvents={selectedRunEvents}
        />
      </div>
    </section>
  );
}
