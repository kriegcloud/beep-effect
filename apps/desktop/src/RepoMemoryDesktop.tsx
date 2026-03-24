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
  type RepoRegistration,
  RepoRegistrationInput,
  type RepoRun,
  ResumeRepoRunRequest,
  type RetrievalPacket,
  RunCursor,
  RunId,
  type RunStreamEvent,
  type SidecarBootstrap,
  StreamRunEventsRequest,
} from "@beep/runtime-protocol";
import { FilePath } from "@beep/schema";
import { DateTime, Duration, Effect, Fiber, Order, pipe, Result, Stream } from "effect";
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

const defaultBaseUrl = "http://127.0.0.1:8788";
const desktopSessionId = "desktop-shell";
const sidecarBaseUrlKey = "beep.repoMemory.sidecarBaseUrl";
const desktopDevHost = "desktop.localhost";
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunId = S.decodeUnknownSync(RunId);

const readPersistedSidecarBaseUrl = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(sidecarBaseUrlKey);
  } catch {
    return null;
  }
};

const persistSidecarBaseUrl = (baseUrl: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(sidecarBaseUrlKey, normalizeSidecarBaseUrl(baseUrl));
  } catch {
    return;
  }
};

const browserDevClientBaseUrl = (): string | null => {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return null;
  }

  // Raw Vite origins such as 127.0.0.1:* do not provide the desktop /api proxy.
  return window.location.hostname === desktopDevHost ? window.location.origin : null;
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

const findLatestAnswerEvent = (
  events: ReadonlyArray<RunStreamEvent>
): O.Option<Extract<RunStreamEvent, { readonly kind: "answer" }>> =>
  pipe(
    events,
    A.filter((event): event is Extract<RunStreamEvent, { readonly kind: "answer" }> => event.kind === "answer"),
    A.last
  );

const findLatestPacketEvent = (
  events: ReadonlyArray<RunStreamEvent>
): O.Option<Extract<RunStreamEvent, { readonly kind: "retrieval-packet" }>> =>
  pipe(
    events,
    A.filter(
      (event): event is Extract<RunStreamEvent, { readonly kind: "retrieval-packet" }> =>
        event.kind === "retrieval-packet"
    ),
    A.last
  );

const answerFromRun = (run: QueryRun, events: ReadonlyArray<RunStreamEvent>): string =>
  pipe(
    run.answer,
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
    O.match({
      onNone: () => "",
      onSome: (startColumn) =>
        pipe(
          citation.span.endColumn,
          O.match({
            onNone: () => `:${startColumn}`,
            onSome: (endColumn) => `:${startColumn}-${endColumn}`,
          })
        ),
    })
  );

  return `${citation.span.filePath}:${citation.span.startLine}-${citation.span.endLine}${columnSuffix}`;
};

const optionToNullable = <A,>(option: O.Option<A>): A | null => O.getOrNull(option);

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
  const queryRun = selectedRun?.kind === "query" ? selectedRun : null;
  const visibleAnswer = queryRun === null ? null : answerFromRun(queryRun, selectedRunEvents);
  const visibleCitations = queryRun === null ? [] : citationsFromRun(queryRun, selectedRunEvents);
  const visiblePacket =
    queryRun === null ? O.none<RetrievalPacket>() : retrievalPacketFromRun(queryRun, selectedRunEvents);

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
      const browserBaseUrl = browserDevClientBaseUrl();
      if (shellMode === "browser" && browserBaseUrl !== null) {
        setStatusMessage("Connecting to the repo-memory sidecar through the desktop proxy.");
        await connectToBaseUrl(browserBaseUrl, {
          persistBaseUrl: false,
        });
        if (ac.signal.aborted) return;
        return;
      }

      if (shellMode === "browser") {
        setStatusMessage("Raw Vite origin detected. Connecting to the saved direct sidecar URL.");
      }

      await connectToBaseUrl(baseUrlInput);
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
    setStatusMessage(
      P.isNotNullish(options) && P.isNotNullish(options.restart) && options.restart
        ? "Restarting the managed" + " local" + " sidecar."
        : "Launching" + " the managed local sidecar."
    );

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
        throw new Error("Managed sidecar did not report a bootstrap payload.");
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
    if (
      client === null ||
      selectedRun === null ||
      isTerminalRunStatus(selectedRun.status) ||
      typeof window === "undefined"
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void refreshRun(client, selectedRun.id).catch((error) => {
        startTransition(() => {
          setErrorMessage(errorToMessage(error));
        });
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
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
        <article className="summary-card">
          <span className="summary-label">Connection</span>
          <strong>{formatConnectionLabel(connectionState)}</strong>
          <p>
            {bootstrap === null
              ? nativeAvailable && shellMode === "native-managed"
                ? managedState === null
                  ? "Managed sidecar booting."
                  : `${managedState.mode} ${managedState.status}`
                : "Waiting for a sidecar."
              : bootstrap.status}
          </p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Repos</span>
          <strong>{repos.length}</strong>
          <p>{repos.length === 0 ? "No repo registered yet." : "Control plane registry loaded."}</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Runs</span>
          <strong>{runs.length}</strong>
          <p>{runs.length === 0 ? "No durable runs yet." : "Workflow projections ready for inspection."}</p>
        </article>
        <article className="summary-card">
          <span className="summary-label">Stream</span>
          <strong>{activeStreamRunId === null ? "inactive" : "live"}</strong>
          <p>{activeStreamRunId === null ? "Select a run to replay." : activeStreamRunId}</p>
        </article>
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
          {nativeAvailable && shellMode === "native-managed" ? (
            <div className="stack">
              <p className="field-note">
                The native shell owns sidecar launch, bootstrap discovery, and health checks before the client connects.
              </p>
              <div className="button-row">
                <button
                  type="button"
                  disabled={connectionState === "connecting"}
                  onClick={() => void connectManaged({ restart: true })}
                >
                  {connectionState === "connecting" ? "Starting..." : "Restart sidecar"}
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  disabled={client === null}
                  onClick={() => void refresh()}
                >
                  Refresh
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  disabled={connectionState === "connecting"}
                  onClick={() => void stopManagedConnection()}
                >
                  Stop sidecar
                </button>
              </div>
              <details className="debug-panel">
                <summary>Debug override</summary>
                <div className="stack">
                  <p className="field-note">
                    Stop the managed sidecar and switch back to the old manual URL flow only when you need to inspect a
                    different runtime.
                  </p>
                  <button type="button" className="button-secondary" onClick={() => void enableManualOverride()}>
                    Use manual URL override
                  </button>
                </div>
              </details>
            </div>
          ) : shellMode === "manual-override" ? (
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                void connect();
              }}
            >
              <label className="field">
                <span>Sidecar base URL</span>
                <input
                  value={baseUrlInput}
                  onChange={(nextEvent) => setBaseUrlInput(nextEvent.target.value)}
                  onBlur={() => setBaseUrlInput((current) => normalizeSidecarBaseUrl(current))}
                  placeholder={defaultBaseUrl}
                />
              </label>
              <p className="field-note">
                Use the root sidecar URL. Legacy `/api/v0` input is normalized automatically.
              </p>
              <div className="button-row">
                <button type="submit" disabled={connectionState === "connecting"}>
                  {connectionState === "connecting" ? "Connecting..." : "Connect"}
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  disabled={client === null}
                  onClick={() => void refresh()}
                >
                  Refresh
                </button>
                <button type="button" className="button-secondary" disabled={client === null} onClick={disconnect}>
                  Disconnect
                </button>
                {nativeAvailable ? (
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={connectionState === "connecting"}
                    onClick={() => setShellMode("native-managed")}
                  >
                    Resume managed sidecar
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={connectionState === "connecting"}
                    onClick={() => setShellMode("browser")}
                  >
                    Use desktop proxy
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="stack">
              <p className="field-note">
                {browserDevClientBaseUrl() === null
                  ? "Raw Vite dev does not include the desktop proxy. Use the saved direct sidecar URL here, or switch back to the default portless desktop flow."
                  : "Browser dev uses the HTTPS desktop proxy and the portless sidecar route. Use manual override only when you need to inspect a different runtime."}
              </p>
              <div className="button-row">
                <button type="button" disabled={connectionState === "connecting"} onClick={() => void connect()}>
                  {connectionState === "connecting" ? "Connecting..." : "Connect"}
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  disabled={client === null}
                  onClick={() => void refresh()}
                >
                  Refresh
                </button>
                <button type="button" className="button-secondary" disabled={client === null} onClick={disconnect}>
                  Disconnect
                </button>
              </div>
              <details className="debug-panel">
                <summary>Debug override</summary>
                <div className="stack">
                  <p className="field-note">
                    Use a direct sidecar URL only when you need to inspect a different runtime or bypass the desktop
                    proxy.
                  </p>
                  <button type="button" className="button-secondary" onClick={() => setShellMode("manual-override")}>
                    Use manual URL override
                  </button>
                </div>
              </details>
            </div>
          )}
          <p className="status-line">{statusMessage}</p>
          {errorMessage === null ? null : <p className="notice notice-error">{errorMessage}</p>}
          {managedState !== null ? (
            <p className="notice">
              Native state: <code>{managedState.mode}</code> {managedState.status}
            </p>
          ) : null}
          {managedState !== null && managedState.stderrTail.length > 0 ? (
            <div className="notice">
              <strong>Sidecar stderr</strong>
              <pre className="mono-block">{managedState.stderrTail.join("\n")}</pre>
            </div>
          ) : null}
          {bootstrap === null ? null : (
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
              {managedState === null ? null : (
                <div>
                  <dt>Launch mode</dt>
                  <dd>{managedState.mode}</dd>
                </div>
              )}
              {managedState === null ? null : (
                <div>
                  <dt>Native state</dt>
                  <dd>{managedState.status}</dd>
                </div>
              )}
            </dl>
          )}
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

        <section className="panel panel-detail">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Inspection</p>
              <h2>Selected run detail</h2>
            </div>
            {selectedRun === null ? null : (
              <div className="detail-status">
                <span className={`status-pill ${runStatusTone(selectedRun.status)}`}>{selectedRun.status}</span>
                {activeStreamRunId === selectedRun.id ? (
                  <span className="status-pill status-running">live stream</span>
                ) : null}
              </div>
            )}
          </div>
          {selectedRun === null ? (
            <p className="empty-state">
              Select a run to inspect its answer, citations, retrieval packet, and event feed.
            </p>
          ) : (
            <div className="detail-stack">
              <section className="detail-card">
                <div className="detail-card-top">
                  <h3>{formatRunTitle(selectedRun)}</h3>
                  <div className="button-row">
                    {selectedRun.status === "accepted" || selectedRun.status === "running" ? (
                      <button
                        type="button"
                        disabled={client === null || actionState !== "idle"}
                        onClick={() => void interruptSelectedRun()}
                      >
                        Interrupt run
                      </button>
                    ) : null}
                    {selectedRun.status === "interrupted" ? (
                      <button
                        type="button"
                        disabled={client === null || actionState !== "idle"}
                        onClick={() => void resumeSelectedRun()}
                      >
                        Resume run
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={client === null}
                      onClick={() => void streamSelectedRun()}
                    >
                      Replay stream
                    </button>
                  </div>
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

              {selectedRun.kind === "index" ? (
                <section className="detail-card">
                  <h3>Index projection</h3>
                  <p className="answer-copy">
                    {O.match(selectedRun.indexedFileCount, {
                      onNone: () => "The index run has not published a final file count yet.",
                      onSome: (count) => `Indexed ${count} files in the latest durable snapshot.`,
                    })}
                  </p>
                </section>
              ) : (
                <>
                  <section className="detail-card">
                    <h3>Grounded answer</h3>
                    <p className="answer-copy">{visibleAnswer}</p>
                  </section>

                  <section className="detail-card">
                    <h3>Retrieval packet</h3>
                    {pipe(
                      visiblePacket,
                      O.match({
                        onNone: () => <p className="empty-state">No retrieval packet materialized yet.</p>,
                        onSome: (packet) => (
                          <div className="packet-shell">
                            <p className="packet-summary">{packet.summary}</p>
                            <dl className="meta-grid">
                              <div>
                                <dt>Query</dt>
                                <dd>{packet.query}</dd>
                              </div>
                              <div>
                                <dt>Retrieved</dt>
                                <dd>{formatDateTime(packet.retrievedAt)}</dd>
                              </div>
                              <div>
                                <dt>Snapshot</dt>
                                <dd>
                                  {pipe(
                                    packet.sourceSnapshotId,
                                    O.getOrElse(() => "none")
                                  )}
                                </dd>
                              </div>
                              <div>
                                <dt>Citations</dt>
                                <dd>{packet.citations.length}</dd>
                              </div>
                            </dl>
                            {packet.notes.length === 0 ? null : (
                              <ul className="note-list">
                                {packet.notes.map((note) => (
                                  <li key={note}>{note}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ),
                      })
                    )}
                  </section>

                  <section className="detail-card">
                    <h3>Citations</h3>
                    {visibleCitations.length === 0 ? (
                      <p className="empty-state">No citations are available for this run yet.</p>
                    ) : (
                      <div className="citation-list">
                        {visibleCitations.map((citation) => (
                          <article key={citation.id} className="citation-card">
                            <div className="citation-top">
                              <strong>{citation.label}</strong>
                              <span>
                                {pipe(
                                  citation.span.symbolName,
                                  O.getOrElse(() => "source span")
                                )}
                              </span>
                            </div>
                            <p>{citation.rationale}</p>
                            <code>{formatCitationSpan(citation)}</code>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {O.isSome(selectedRun.errorMessage) ? (
                <section className="detail-card">
                  <h3>Run error</h3>
                  <p className="notice notice-error">{selectedRun.errorMessage.value}</p>
                </section>
              ) : null}

              <section className="detail-card">
                <h3>Event feed</h3>
                {selectedRunEvents.length === 0 ? (
                  <p className="empty-state">
                    No stream events have been replayed for this run in the current shell session.
                  </p>
                ) : (
                  <ol className="event-list">
                    {selectedRunEvents.map((event) => (
                      <li key={`${event.kind}-${event.sequence}`} className="event-card">
                        <div className="event-card-top">
                          <strong>{event.kind}</strong>
                          <span>#{event.sequence}</span>
                        </div>
                        <p>{eventLabel(event)}</p>
                        <small>{formatDateTime(event.emittedAt)}</small>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
