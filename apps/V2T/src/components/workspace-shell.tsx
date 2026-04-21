/**
 * Workspace shell for the V2T desktop and browser control plane.
 *
 * @module
 * @since 0.0.0
 */
import { FilePath, NonEmptyTrimmedStr } from "@beep/schema";
import {
  CreateVt2SessionInput,
  defaultVt2DesktopPreferences,
  makeVt2Client,
  normalizeVt2BaseUrl,
  RunVt2CompositionInput,
  UpdateVt2DesktopPreferencesInput,
  Vt2ClientConfig,
  Vt2ClientError,
  type Vt2ClientShape,
  type Vt2Session,
  type Vt2SessionResource,
  type Vt2WorkspaceSnapshot,
} from "@beep/v2t-sidecar";
import { DateTime, Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as React from "react";
import { startTransition, useEffect, useState } from "react";
import {
  createV2tSessionResource,
  discardV2tRecoveryCandidate,
  getV2tCaptureState,
  getV2tSessionResource,
  getV2tSidecarState,
  getV2tWorkspaceSnapshot,
  interruptV2tCapture,
  isNativeDesktop,
  observeV2tCaptureState,
  observeV2tSidecarState,
  pickWorkspaceDirectory,
  probeV2tSidecar,
  recoverV2tRecoveryCandidate,
  retryV2tSessionTranscript,
  runV2tSessionComposition,
  saveV2tDesktopPreferences,
  startV2tCapture,
  startV2tSidecar,
  stopV2tCapture,
  stopV2tSidecar,
  type Vt2ManagedCaptureState,
  type Vt2ManagedSidecarState,
  Vt2NativeError,
} from "../native.ts";

const appSessionId = "v2t-shell";

type LoadState = "idle" | "loading" | "ready" | "error";
type ActionState =
  | "idle"
  | "starting-sidecar"
  | "stopping-sidecar"
  | "starting-capture"
  | "stopping-capture"
  | "interrupting-capture"
  | "recovering-capture"
  | "discarding-capture"
  | "refreshing"
  | "creating-record"
  | "creating-import"
  | "retrying-transcript"
  | "running-composition"
  | "saving-preferences";

type StatusTone = "status-healthy" | "status-failed" | "status-starting";
type TranscriptStatus = Vt2SessionResource["transcript"]["status"];
type TranscriptRuntimeStatus = Vt2WorkspaceSnapshot["transcriptRuntime"]["status"];

type CaptureStatusToneInput = {
  readonly isActive: boolean;
  readonly hasRecovery: boolean;
};

const formatDateTime = (value: DateTime.Utc): string =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(DateTime.toEpochMillis(value));

const browserBaseUrl = (): O.Option<string> => {
  const runtimeWindow = globalThis.window;
  return P.isUndefined(runtimeWindow) ? O.none() : O.some(normalizeVt2BaseUrl(runtimeWindow.location.origin));
};

const resolveManagedBaseUrl = (state: Vt2ManagedSidecarState | null): O.Option<string> =>
  O.fromNullishOr(state).pipe(
    O.flatMap((managedState) =>
      managedState.bootstrap.pipe(O.map((bootstrap) => normalizeVt2BaseUrl(bootstrap.baseUrl)))
    )
  );

const resolveControlPlaneBaseUrl = (
  managedState: Vt2ManagedSidecarState | null,
  baseUrl: string | null
): O.Option<string> =>
  pipe(
    O.fromNullishOr(baseUrl),
    O.orElse(() => resolveManagedBaseUrl(managedState)),
    O.orElse(() => (isNativeDesktop() ? O.none() : browserBaseUrl()))
  );

const toDisplayError = (cause: unknown): string => {
  if (S.is(Vt2NativeError)(cause) || S.is(Vt2ClientError)(cause)) {
    return cause.message;
  }

  if (P.isError(cause)) {
    return cause.message;
  }

  return "The V2T scaffolding hit an unexpected error.";
};

const makeWorkspaceShellError = (message: string): Vt2NativeError =>
  new Vt2NativeError({
    message,
    status: 400,
    cause: O.none(),
  });

const makeClientConfig = (baseUrl: string): Vt2ClientConfig =>
  new Vt2ClientConfig({
    baseUrl,
    sessionId: appSessionId,
  });

async function withClient<A>(
  baseUrl: string,
  run: (client: Vt2ClientShape) => Effect.Effect<A, Vt2ClientError>
): Promise<A> {
  const client = await Effect.runPromise(makeVt2Client(makeClientConfig(baseUrl)));

  return await Effect.runPromise(run(client));
}

const loadWorkspaceSnapshot = async (baseUrl: string): Promise<Vt2WorkspaceSnapshot> =>
  isNativeDesktop()
    ? await Effect.runPromise(getV2tWorkspaceSnapshot())
    : await withClient(baseUrl, (client) => client.getWorkspace);

const loadSessionResource = async (baseUrl: string, sessionId: string): Promise<Vt2SessionResource> =>
  isNativeDesktop()
    ? await Effect.runPromise(getV2tSessionResource(sessionId))
    : await withClient(baseUrl, (client) => client.getSession(sessionId));

const createSessionResource = async (baseUrl: string, input: CreateVt2SessionInput): Promise<Vt2SessionResource> =>
  isNativeDesktop()
    ? await Effect.runPromise(createV2tSessionResource(input))
    : await withClient(baseUrl, (client) => client.createSession(input));

const saveDesktopPreferences = async (baseUrl: string, input: UpdateVt2DesktopPreferencesInput) =>
  isNativeDesktop()
    ? await Effect.runPromise(saveV2tDesktopPreferences(input))
    : await withClient(baseUrl, (client) => client.savePreferences(input));

const runSessionComposition = async (
  baseUrl: string,
  sessionId: string,
  input: RunVt2CompositionInput
): Promise<Vt2SessionResource> =>
  isNativeDesktop()
    ? await Effect.runPromise(runV2tSessionComposition(sessionId, input))
    : await withClient(baseUrl, (client) => client.runComposition(sessionId, input));

const retrySessionTranscript = async (baseUrl: string, sessionId: string): Promise<Vt2SessionResource> =>
  isNativeDesktop()
    ? await Effect.runPromise(retryV2tSessionTranscript(sessionId))
    : await withClient(baseUrl, (client) => client.retryTranscript(sessionId));

const sessionLabel = (session: Vt2Session): string =>
  session.source === "record" ? "Record session" : "Import session";

const failedSessionStatuses: ReadonlyArray<Vt2Session["status"]> = ["failed", "recoverable"];

const activeSessionStatuses: ReadonlyArray<Vt2Session["status"]> = ["transcribing", "composing", "exporting"];

const sessionStatusTone = (status: Vt2Session["status"]): StatusTone => {
  if (pipe(failedSessionStatuses, A.contains(status))) {
    return "status-failed";
  }

  if (pipe(activeSessionStatuses, A.contains(status))) {
    return "status-starting";
  }

  return "status-healthy";
};

const captureStatusTone = ({ isActive, hasRecovery }: CaptureStatusToneInput): StatusTone => {
  if (isActive) {
    return "status-starting";
  }

  if (hasRecovery) {
    return "status-failed";
  }

  return "status-healthy";
};

const transcriptRuntimeStatusTone = (status: TranscriptRuntimeStatus): StatusTone => {
  if (status === "ready") {
    return "status-healthy";
  }

  return "status-failed";
};

const nonHealthyManagedErrorMessage = (state: Vt2ManagedSidecarState | null): O.Option<string> => {
  if (state === null || state.status === "healthy") {
    return O.none();
  }

  return state.errorMessage;
};

const workingDirectoryCopy = (workingDirectory: Vt2Session["workingDirectory"]): string =>
  O.match(workingDirectory, {
    onNone: () => "Not set",
    onSome: (path) => path,
  });

const transcriptLanguageCopy = (language: Vt2SessionResource["transcript"]["language"]): string =>
  O.match(language, {
    onNone: () => "Language not detected yet.",
    onSome: (language) => `Detected language: ${language}`,
  });

const transcriptExcerptCopy = (excerpt: Vt2SessionResource["transcript"]["excerpt"]): string =>
  O.match(excerpt, {
    onNone: () => "No excerpt recorded yet.",
    onSome: (excerpt) => excerpt,
  });

const transcriptStatusFallback = (status: TranscriptStatus): string => {
  if (status === "processing") {
    return "Transcription is running now.";
  }

  if (status === "failed") {
    return "The latest transcription attempt failed. Retry after checking the provider runtime below.";
  }

  return "No transcript text has been materialized yet. Capture or import media, then retry transcription if needed.";
};

const transcriptBodyCopy = (session: Vt2SessionResource): string =>
  pipe(
    session.transcript.text,
    O.orElse(() => session.transcript.excerpt),
    O.getOrElse(() => transcriptStatusFallback(session.transcript.status))
  );

const captureDraftPathCopy = (state: Vt2ManagedCaptureState | null): string => {
  if (state === null) {
    return "The native shell has not reported capture state yet.";
  }

  return O.match(state.draftPath, {
    onNone: () => "No active capture artifact path.",
    onSome: (path) => path,
  });
};

const managedSidecarSummary = (state: Vt2ManagedSidecarState | null): string => {
  if (state === null) {
    return "The Tauri bridge is optional in browser dev.";
  }

  const bootstrapBaseUrl = pipe(
    state.bootstrap,
    O.map((bootstrap) => bootstrap.baseUrl)
  );

  return pipe(
    state.errorMessage,
    O.orElse(() => bootstrapBaseUrl),
    O.getOrElse(() => "No bootstrap payload yet.")
  );
};

const managedCaptureSummary = (state: Vt2ManagedCaptureState | null): string => {
  if (state === null) {
    return "The native capture bridge is optional in browser dev.";
  }

  const activeCaptureSummary = pipe(
    state.activeCaptureId,
    O.map((captureId) => `Active capture ${captureId}`)
  );

  return pipe(
    state.recoveryCandidateId,
    O.map((candidateId) => `Pending recovery candidate ${candidateId}`),
    O.orElse(() => activeCaptureSummary),
    O.getOrElse(() => "No active capture artifact or recovery item.")
  );
};

const renderTranscriptFailureDetail = (
  failureReason: Vt2SessionResource["transcript"]["failureReason"]
): React.ReactNode =>
  O.match(failureReason, {
    onNone: () => null,
    onSome: (message) => (
      <div className="backlink-item">
        <strong>Failure detail</strong>
        <span>{message}</span>
      </div>
    ),
  });

const renderCaptureErrorMessage = (state: Vt2ManagedCaptureState | null): React.ReactNode => {
  if (state === null) {
    return null;
  }

  return O.match(state.errorMessage, {
    onNone: () => null,
    onSome: (message) => <span className="muted">{message}</span>,
  });
};

const selectedSessionId = (session: Vt2SessionResource | null): string | null =>
  session === null ? null : session.session.id;

const optionMatches = (value: O.Option<string>, expected: string): boolean =>
  O.match(value, {
    onNone: () => false,
    onSome: (present) => present === expected,
  });

/**
 * Render the interactive V2T workspace shell.
 *
 * @example
 * ```tsx
 * import { V2TWorkspaceShell } from "@beep/v2t"
 *
 * const App = () => <V2TWorkspaceShell />
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const V2TWorkspaceShell: React.FC = () => {
  const [managedState, setManagedState] = useState<Vt2ManagedSidecarState | null>(null);
  const [captureState, setCaptureState] = useState<Vt2ManagedCaptureState | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<Vt2WorkspaceSnapshot | null>(null);
  const [currentSession, setCurrentSession] = useState<Vt2SessionResource | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyManagedState = (nextState: Vt2ManagedSidecarState | null): void => {
    startTransition(() => {
      setManagedState(nextState);
      setBaseUrl(nextState === null ? null : pipe(resolveManagedBaseUrl(nextState), O.getOrNull));

      if (nextState === null || nextState.status !== "healthy") {
        setWorkspace(null);
        setCurrentSession(null);
      }
    });
  };

  const loadWorkspace = async (targetBaseUrl: string, preferredSessionId?: string | null): Promise<void> => {
    startTransition(() => {
      setLoadState("loading");
    });

    try {
      const snapshot = await loadWorkspaceSnapshot(targetBaseUrl);
      const nextSessionId =
        preferredSessionId ??
        A.head(snapshot.sessions).pipe(
          O.match({
            onNone: () => null,
            onSome: (session) => session.id,
          })
        );
      const nextSession = nextSessionId === null ? null : await loadSessionResource(targetBaseUrl, nextSessionId);

      startTransition(() => {
        setBaseUrl(targetBaseUrl);
        setWorkspace(snapshot);
        setCurrentSession(nextSession);
        setLoadState("ready");
        setErrorMessage(null);
      });
    } catch (cause) {
      startTransition(() => {
        setLoadState("error");
        setErrorMessage(toDisplayError(cause));
      });
    }
  };

  const syncManagedState = async (): Promise<Vt2ManagedSidecarState | null> => {
    if (!isNativeDesktop()) {
      return null;
    }

    try {
      const nextState = await Effect.runPromise(getV2tSidecarState());
      applyManagedState(nextState);

      return nextState;
    } catch (cause) {
      startTransition(() => {
        setErrorMessage(toDisplayError(cause));
      });

      return null;
    }
  };

  const probeManagedState = async (): Promise<Vt2ManagedSidecarState | null> => {
    if (!isNativeDesktop()) {
      return null;
    }

    const nextState = await Effect.runPromise(probeV2tSidecar());
    applyManagedState(nextState);

    return nextState;
  };

  const ensureControlPlaneBaseUrl = async (fallbackMessage: string): Promise<string> => {
    const effectiveManagedState = isNativeDesktop() ? await probeManagedState() : managedState;

    if (isNativeDesktop() && effectiveManagedState !== null && effectiveManagedState.status !== "healthy") {
      throw makeWorkspaceShellError(
        pipe(
          effectiveManagedState.errorMessage,
          O.getOrElse(() => fallbackMessage)
        )
      );
    }

    const targetBaseUrl = pipe(resolveControlPlaneBaseUrl(effectiveManagedState, baseUrl), O.getOrNull);

    if (targetBaseUrl === null) {
      throw makeWorkspaceShellError(fallbackMessage);
    }

    return targetBaseUrl;
  };

  const resolveNativeActionErrorMessage = async (): Promise<O.Option<string>> => {
    if (!isNativeDesktop()) {
      return O.none();
    }

    try {
      return nonHealthyManagedErrorMessage(await probeManagedState());
    } catch {
      return O.none();
    }
  };

  const resolveActionError = async (cause: unknown): Promise<string> => {
    const nativeActionErrorMessage = await resolveNativeActionErrorMessage();

    return pipe(
      nativeActionErrorMessage,
      O.getOrElse(() => toDisplayError(cause))
    );
  };

  const presentActionError = async (cause: unknown): Promise<void> => {
    const nextMessage = await resolveActionError(cause);

    startTransition(() => {
      setErrorMessage(nextMessage);
    });
  };

  const syncCaptureState = async (): Promise<Vt2ManagedCaptureState | null> => {
    if (!isNativeDesktop()) {
      return null;
    }

    try {
      const nextState = await Effect.runPromise(getV2tCaptureState());

      startTransition(() => {
        setCaptureState(nextState);
      });

      return nextState;
    } catch (cause) {
      startTransition(() => {
        setErrorMessage(toDisplayError(cause));
      });

      return null;
    }
  };

  useEffect(() => {
    void (async () => {
      const [nextManagedState] = await Promise.all([syncManagedState(), syncCaptureState()]);
      const initialBaseUrl = resolveControlPlaneBaseUrl(nextManagedState, null);

      await O.match(initialBaseUrl, {
        onNone: () => Promise.resolve(),
        onSome: loadWorkspace,
      });
    })();
  }, []);

  useEffect(() => {
    if (!isNativeDesktop()) {
      return;
    }

    let unsubscribe: null | (() => void) = null;

    void (async () => {
      try {
        unsubscribe = await Effect.runPromise(
          observeV2tSidecarState((nextState) => {
            applyManagedState(nextState);
          })
        );
      } catch (cause) {
        startTransition(() => {
          setErrorMessage(toDisplayError(cause));
        });
      }
    })();

    return () => {
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!isNativeDesktop()) {
      return;
    }

    let unsubscribe: null | (() => void) = null;

    void (async () => {
      try {
        unsubscribe = await Effect.runPromise(
          observeV2tCaptureState((nextState) => {
            startTransition(() => {
              setCaptureState(nextState);
            });
          })
        );
      } catch (cause) {
        startTransition(() => {
          setErrorMessage(toDisplayError(cause));
        });
      }
    })();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const handleRefresh = async (): Promise<void> => {
    setActionState("refreshing");

    try {
      const effectiveManagedState = isNativeDesktop() ? await probeManagedState() : managedState;
      const targetBaseUrl = resolveControlPlaneBaseUrl(effectiveManagedState, baseUrl);

      await O.match(targetBaseUrl, {
        onNone: () => Promise.resolve(),
        onSome: (resolvedBaseUrl) => loadWorkspace(resolvedBaseUrl, selectedSessionId(currentSession)),
      });
      await Promise.all([syncManagedState(), syncCaptureState()]);
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handleSelectSession = async (sessionId: string): Promise<void> => {
    await O.match(O.fromNullishOr(baseUrl), {
      onNone: () => Promise.resolve(),
      onSome: async (resolvedBaseUrl) => {
        const nextSession = await loadSessionResource(resolvedBaseUrl, sessionId);

        startTransition(() => {
          setCurrentSession(nextSession);
        });
      },
    });
  };

  const handleStartSidecar = async (): Promise<void> => {
    setActionState("starting-sidecar");

    try {
      const bootstrap = await Effect.runPromise(startV2tSidecar());

      await syncManagedState();
      await loadWorkspace(normalizeVt2BaseUrl(bootstrap.baseUrl));
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handleStopSidecar = async (): Promise<void> => {
    setActionState("stopping-sidecar");

    try {
      await Effect.runPromise(stopV2tSidecar());
      await syncManagedState();

      startTransition(() => {
        setBaseUrl(null);
        setWorkspace(null);
        setCurrentSession(null);
        setCaptureState(null);
      });
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handleStartCapture = async (): Promise<void> => {
    setActionState("starting-capture");

    try {
      const resolvedBaseUrl = await ensureControlPlaneBaseUrl("Start the sidecar before starting native capture.");

      if (currentSession === null) {
        throw makeWorkspaceShellError("Select a record session before starting native capture.");
      }

      await Effect.runPromise(startV2tCapture(currentSession.session.id));
      await loadWorkspace(resolvedBaseUrl, currentSession.session.id);
      await syncCaptureState();
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handleStopCapture = async (): Promise<void> => {
    setActionState("stopping-capture");

    try {
      const resolvedBaseUrl = await ensureControlPlaneBaseUrl("Start the sidecar before stopping native capture.");

      if (currentSession === null) {
        throw makeWorkspaceShellError("Select a record session before stopping native capture.");
      }

      await Effect.runPromise(stopV2tCapture(currentSession.session.id));
      await loadWorkspace(resolvedBaseUrl, currentSession.session.id);
      await syncCaptureState();
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handleInterruptCapture = async (): Promise<void> => {
    setActionState("interrupting-capture");

    try {
      const resolvedBaseUrl = await ensureControlPlaneBaseUrl("Start the sidecar before interrupting native capture.");

      if (currentSession === null) {
        throw makeWorkspaceShellError("Select a record session before interrupting native capture.");
      }

      await Effect.runPromise(interruptV2tCapture(currentSession.session.id));
      await loadWorkspace(resolvedBaseUrl, currentSession.session.id);
      await syncCaptureState();
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handleResolveRecoveryCandidate = async (
    candidateId: string,
    disposition: "recover" | "discard"
  ): Promise<void> => {
    setActionState(disposition === "recover" ? "recovering-capture" : "discarding-capture");

    try {
      const resolvedBaseUrl = await ensureControlPlaneBaseUrl(
        "Start the sidecar before resolving recovery candidates."
      );

      if (currentSession === null) {
        throw makeWorkspaceShellError("Select a session before resolving recovery candidates.");
      }

      await Effect.runPromise(
        disposition === "recover"
          ? recoverV2tRecoveryCandidate(currentSession.session.id, candidateId)
          : discardV2tRecoveryCandidate(currentSession.session.id, candidateId)
      );
      await loadWorkspace(resolvedBaseUrl, currentSession.session.id);
      await syncCaptureState();
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handleRetryTranscript = async (): Promise<void> => {
    setActionState("retrying-transcript");

    try {
      const resolvedBaseUrl = await ensureControlPlaneBaseUrl("Start the sidecar before retrying transcription.");

      if (currentSession === null) {
        throw makeWorkspaceShellError("Select a session before retrying transcription.");
      }

      const nextResource = await retrySessionTranscript(resolvedBaseUrl, currentSession.session.id);

      startTransition(() => {
        setCurrentSession(nextResource);
      });

      await loadWorkspace(resolvedBaseUrl, nextResource.session.id);
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handleRunComposition = async (profileId: RunVt2CompositionInput["profileId"]): Promise<void> => {
    setActionState("running-composition");

    try {
      const resolvedBaseUrl = await ensureControlPlaneBaseUrl("Start the sidecar before running composition.");

      if (currentSession === null) {
        throw makeWorkspaceShellError("Select a session before running composition.");
      }

      const nextResource = await runSessionComposition(
        resolvedBaseUrl,
        currentSession.session.id,
        new RunVt2CompositionInput({
          profileId,
          targetFormats: ["markdown", "json"] as const,
          destinationDirectory: currentSession.session.workingDirectory,
        })
      );

      startTransition(() => {
        setCurrentSession(nextResource);
      });

      await loadWorkspace(resolvedBaseUrl, nextResource.session.id);
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handleCreateSession = async (source: "record" | "import"): Promise<void> => {
    setActionState(source === "record" ? "creating-record" : "creating-import");

    try {
      const resolvedBaseUrl = await ensureControlPlaneBaseUrl("Start the sidecar before creating a session.");
      const nextResource = await createSessionResource(
        resolvedBaseUrl,
        new CreateVt2SessionInput({
          source,
          title: NonEmptyTrimmedStr.make(source === "record" ? "Recorded conversation" : "Imported conversation"),
          projectId: O.none(),
          workingDirectory: workspace === null ? O.none() : workspace.preferences.workspaceDirectory,
        })
      );

      await loadWorkspace(resolvedBaseUrl, nextResource.session.id);
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const handlePickWorkspace = async (): Promise<void> => {
    const currentPreferences = workspace === null ? defaultVt2DesktopPreferences() : workspace.preferences;

    setActionState("saving-preferences");

    try {
      const pickedPath = await Effect.runPromise(pickWorkspaceDirectory());

      await O.match(pickedPath, {
        onNone: () => Promise.resolve(),
        onSome: async (path) => {
          const resolvedBaseUrl = await ensureControlPlaneBaseUrl(
            "Start the sidecar before saving desktop preferences."
          );

          await saveDesktopPreferences(
            resolvedBaseUrl,
            new UpdateVt2DesktopPreferencesInput({
              preferredSessionSource: currentPreferences.preferredSessionSource,
              workspaceDirectory: O.some(FilePath.make(path)),
              captureSurface: currentPreferences.captureSurface,
              autoRecoverInterruptions: currentPreferences.autoRecoverInterruptions,
              includeMemoryByDefault: currentPreferences.includeMemoryByDefault,
              lastOpenedAt: currentPreferences.lastOpenedAt,
            })
          );

          await loadWorkspace(resolvedBaseUrl, selectedSessionId(currentSession));
        },
      });
    } catch (cause) {
      await presentActionError(cause);
    } finally {
      startTransition(() => {
        setActionState("idle");
      });
    }
  };

  const canDriveNativeCapture =
    isNativeDesktop() && currentSession !== null && currentSession.session.source === "record";
  const currentSessionCaptureActive =
    currentSession !== null &&
    captureState !== null &&
    optionMatches(captureState.activeSessionId, currentSession.session.id);
  const currentSessionRecoveryActive =
    currentSession !== null &&
    captureState !== null &&
    optionMatches(captureState.recoverySessionId, currentSession.session.id);
  const currentSessionHasPendingRecovery =
    currentSession !== null &&
    A.some(currentSession.recoveryCandidates, (candidate) => candidate.disposition === "pending");
  const currentSessionHasIngestedCapture =
    currentSession !== null && A.some(currentSession.captureSegments, (segment) => segment.status === "ingested");
  const currentSessionCanCompose = currentSession !== null && currentSession.transcript.status === "ready";
  const currentSessionCanRetryTranscript =
    currentSession !== null &&
    currentSession.transcript.status !== "processing" &&
    currentSessionHasIngestedCapture &&
    !currentSessionHasPendingRecovery;
  const currentCaptureStatusTone = captureStatusTone({
    isActive: currentSessionCaptureActive,
    hasRecovery: currentSessionRecoveryActive,
  });
  const isActivelyRecording = captureState !== null && captureState.status === "capturing";

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Local-First Execution Slice</p>
          <h1>V2T workspace shell</h1>
          <p className="lede">
            Typed desktop scaffolding for record and import sessions, managed sidecar lifecycle, and first-slice
            preferences that live outside project artifacts.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="button primary"
            disabled={actionState !== "idle"}
            onClick={() => {
              void handleCreateSession("record");
            }}
            type="button"
          >
            New record session
          </button>
          <button
            className="button"
            disabled={actionState !== "idle"}
            onClick={() => {
              void handleCreateSession("import");
            }}
            type="button"
          >
            New import session
          </button>
          <button
            className="button ghost"
            disabled={!isNativeDesktop() || actionState !== "idle"}
            onClick={() => {
              void handlePickWorkspace();
            }}
            type="button"
          >
            Pick workspace
          </button>
          <button
            className="button ghost"
            disabled={actionState !== "idle"}
            onClick={() => {
              void handleRefresh();
            }}
            type="button"
          >
            Refresh
          </button>
          {isNativeDesktop() ? (
            <button
              className="button ghost"
              disabled={actionState !== "idle"}
              onClick={() => {
                void handleStartSidecar();
              }}
              type="button"
            >
              Start sidecar
            </button>
          ) : null}
          {isNativeDesktop() ? (
            <button
              className="button ghost"
              disabled={actionState !== "idle" || isActivelyRecording}
              onClick={() => {
                void handleStopSidecar();
              }}
              type="button"
            >
              Stop sidecar
            </button>
          ) : null}
        </div>
      </section>

      {errorMessage === null ? null : (
        <section className="error-banner">
          <strong>V2T notice.</strong> {errorMessage}
        </section>
      )}

      <section className="workspace-grid">
        <aside className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Sessions</p>
              <h2>Record and import parity</h2>
            </div>
            <span className={`status-pill ${loadState === "error" ? "status-failed" : "status-healthy"}`}>
              {loadState}
            </span>
          </div>
          <div className="page-list">
            {workspace === null || workspace.sessions.length === 0 ? (
              <div className="empty-state">
                <p className="muted">Create a record or import session to seed the first-slice scaffolding.</p>
              </div>
            ) : (
              A.map(workspace.sessions, (session) => (
                <button
                  className={`page-card ${selectedSessionId(currentSession) === session.id ? "page-card-active" : ""}`}
                  key={session.id}
                  onClick={() => {
                    void handleSelectSession(session.id);
                  }}
                  type="button"
                >
                  <strong>{session.title}</strong>
                  <span>{sessionLabel(session)}</span>
                  <span className={`status-pill ${sessionStatusTone(session.status)}`}>{session.status}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Session</p>
              <h2>Canonical metadata</h2>
            </div>
            <span className="status-pill status-healthy">
              {currentSession === null ? "no session" : currentSession.session.source}
            </span>
          </div>
          {currentSession === null ? (
            <div className="empty-state">
              <p className="muted">
                The sidecar now speaks in sessions, transcripts, recovery candidates, composition profiles, and export
                artifacts instead of the old placeholder document model.
              </p>
            </div>
          ) : (
            <div className="stack">
              <div className="metric-grid">
                <article className="metric-card">
                  <p className="panel-label">Created</p>
                  <strong>{formatDateTime(currentSession.session.createdAt)}</strong>
                </article>
                <article className="metric-card">
                  <p className="panel-label">Transcript</p>
                  <strong>{currentSession.transcript.status}</strong>
                </article>
                <article className="metric-card">
                  <p className="panel-label">Recovery</p>
                  <strong>{currentSession.recoveryCandidates.length}</strong>
                </article>
                <article className="metric-card">
                  <p className="panel-label">Exports</p>
                  <strong>{currentSession.exportArtifacts.length}</strong>
                </article>
              </div>

              <div className="session-detail-grid">
                <article className="metric-card">
                  <p className="panel-label">Working directory</p>
                  <strong>{workingDirectoryCopy(currentSession.session.workingDirectory)}</strong>
                </article>
                <article className="metric-card">
                  <p className="panel-label">Transcript words</p>
                  <strong>{currentSession.transcript.wordCount}</strong>
                  <span className="muted">{transcriptLanguageCopy(currentSession.transcript.language)}</span>
                </article>
              </div>

              <article className="metric-card">
                <div className="panel-heading panel-heading-compact">
                  <div>
                    <p className="panel-label">Transcript artifact</p>
                    <h3>Full text and retry posture</h3>
                  </div>
                  <span className={`status-pill ${sessionStatusTone(currentSession.session.status)}`}>
                    {currentSession.transcript.status}
                  </span>
                </div>
                <div className="hero-actions">
                  <button
                    className="button"
                    disabled={actionState !== "idle" || !currentSessionCanRetryTranscript}
                    onClick={() => {
                      void handleRetryTranscript();
                    }}
                    type="button"
                  >
                    {currentSession.transcript.status === "failed" ? "Retry transcription" : "Re-run transcription"}
                  </button>
                </div>
                <div className="backlinks">
                  <div className="backlink-item">
                    <strong>Excerpt</strong>
                    <span>{transcriptExcerptCopy(currentSession.transcript.excerpt)}</span>
                  </div>
                  {renderTranscriptFailureDetail(currentSession.transcript.failureReason)}
                </div>
                <div className="transcript-surface">
                  <p className="transcript-body">{transcriptBodyCopy(currentSession)}</p>
                </div>
                {currentSessionCanRetryTranscript ? null : (
                  <p className="muted">
                    Resolve pending recovery work and make sure ingested capture media exists before retrying
                    transcription.
                  </p>
                )}
              </article>

              {canDriveNativeCapture ? (
                <article className="metric-card">
                  <div className="panel-heading panel-heading-compact">
                    <div>
                      <p className="panel-label">Native capture</p>
                      <h3>Direct-capture control</h3>
                    </div>
                    <span className={`status-pill ${currentCaptureStatusTone}`}>
                      {captureState === null ? "not loaded" : captureState.status}
                    </span>
                  </div>
                  <div className="hero-actions">
                    <button
                      className="button primary"
                      disabled={actionState !== "idle" || currentSessionCaptureActive}
                      onClick={() => {
                        void handleStartCapture();
                      }}
                      type="button"
                    >
                      Start capture
                    </button>
                    <button
                      className="button"
                      disabled={actionState !== "idle" || !currentSessionCaptureActive}
                      onClick={() => {
                        void handleStopCapture();
                      }}
                      type="button"
                    >
                      Stop capture
                    </button>
                    <button
                      className="button ghost"
                      disabled={actionState !== "idle" || !currentSessionCaptureActive}
                      onClick={() => {
                        void handleInterruptCapture();
                      }}
                      type="button"
                    >
                      Interrupt capture
                    </button>
                  </div>
                  <div className="native-state-grid">
                    <span className="muted">{captureDraftPathCopy(captureState)}</span>
                    {renderCaptureErrorMessage(captureState)}
                  </div>
                </article>
              ) : null}

              <div className="stack">
                <div>
                  <p className="panel-label">Composition profiles</p>
                  <div className="backlinks">
                    {A.map(currentSession.compositionProfiles, (profile) => (
                      <div className="backlink-item" key={profile.id}>
                        <strong>{profile.label}</strong>
                        <span>
                          {profile.aspectRatio} · {profile.outputTone} · {profile.preferredProviderMode}
                        </span>
                        <div className="hero-actions">
                          <button
                            className="button"
                            disabled={actionState !== "idle" || !currentSessionCanCompose}
                            onClick={() => {
                              void handleRunComposition(profile.id);
                            }}
                            type="button"
                          >
                            Compose exports
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {currentSessionCanCompose ? null : (
                    <p className="muted">
                      Capture recovery must be resolved and a transcript must be ready before composition can run.
                    </p>
                  )}
                </div>
                <div>
                  <p className="panel-label">Composition runs</p>
                  {currentSession.compositionRuns.length === 0 ? (
                    <p className="muted">
                      No composition runs yet. Running a profile will persist the packet, optional memory context, and
                      local export artifact records.
                    </p>
                  ) : (
                    <div className="backlinks">
                      {A.map(currentSession.compositionRuns, (run) => (
                        <div className="backlink-item" key={run.id}>
                          <strong>{run.status}</strong>
                          <span>
                            {run.packet.targetFormats.join(", ")} · memory{" "}
                            {O.match(run.memoryContextPacketId, {
                              onNone: () => "omitted",
                              onSome: () => "attached",
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="panel-label">Memory context</p>
                  {currentSession.memoryContextPackets.length === 0 ? (
                    <p className="muted">
                      No memory packets yet. The local-first seam only fetches memory when the selected composition
                      profile asks for it and desktop defaults allow it.
                    </p>
                  ) : (
                    <div className="backlinks">
                      {A.map(currentSession.memoryContextPackets, (packet) => (
                        <div className="backlink-item" key={packet.id}>
                          <strong>{packet.providerLabel}</strong>
                          <span>{packet.query}</span>
                          <span>{packet.references.join(" | ")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="panel-label">Export artifacts</p>
                  {currentSession.exportArtifacts.length === 0 ? (
                    <p className="muted">No export artifacts have been materialized yet.</p>
                  ) : (
                    <div className="backlinks">
                      {A.map(currentSession.exportArtifacts, (artifact) => (
                        <div className="backlink-item" key={artifact.id}>
                          <strong>
                            {artifact.format} · {artifact.status}
                          </strong>
                          <span>
                            {O.match(artifact.filePath, {
                              onNone: () => "No file path recorded yet.",
                              onSome: (filePath) => filePath,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="panel-label">Recovery posture</p>
                  {currentSession.recoveryCandidates.length === 0 ? (
                    <p className="muted">
                      No recovery candidates yet. The schema, persistence seam, and native bridge are now ready for
                      interrupted capture flows.
                    </p>
                  ) : (
                    <div className="backlinks">
                      {A.map(currentSession.recoveryCandidates, (candidate) => (
                        <div className="backlink-item" key={candidate.id}>
                          <strong>{candidate.reason}</strong>
                          <span>{candidate.disposition}</span>
                          {candidate.disposition === "pending" && isNativeDesktop() ? (
                            <div className="hero-actions">
                              <button
                                className="button"
                                disabled={actionState !== "idle"}
                                onClick={() => {
                                  void handleResolveRecoveryCandidate(candidate.id, "recover");
                                }}
                                type="button"
                              >
                                Recover
                              </button>
                              <button
                                className="button ghost"
                                disabled={actionState !== "idle"}
                                onClick={() => {
                                  void handleResolveRecoveryCandidate(candidate.id, "discard");
                                }}
                                type="button"
                              >
                                Discard
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Desktop Seams</p>
              <h2>Typed ownership</h2>
            </div>
            <span className="status-pill status-starting">{actionState}</span>
          </div>
          <div className="stack">
            <article className="metric-card">
              <p className="panel-label">Shell mode</p>
              <strong>{isNativeDesktop() ? "native shell" : "browser proxy"}</strong>
            </article>
            <article className="metric-card">
              <p className="panel-label">Managed sidecar</p>
              <strong>{managedState === null ? "not loaded" : managedState.status}</strong>
              <span className="muted">{managedSidecarSummary(managedState)}</span>
            </article>
            <article className="metric-card">
              <p className="panel-label">Managed capture</p>
              <strong>{captureState === null ? "not loaded" : captureState.status}</strong>
              <span className="muted">{managedCaptureSummary(captureState)}</span>
            </article>
            <article className="metric-card">
              <p className="panel-label">Workspace directory</p>
              <strong>
                {workspace === null ? "Not loaded" : workingDirectoryCopy(workspace.preferences.workspaceDirectory)}
              </strong>
            </article>
            {workspace === null ? null : (
              <div className="stack">
                <article className="metric-card">
                  <p className="panel-label">Native ownership</p>
                  <strong>{workspace.seams.nativeCaptureOwner}</strong>
                </article>
                <article className="metric-card">
                  <p className="panel-label">Sidecar ownership</p>
                  <strong>{workspace.seams.sidecarMetadataOwner}</strong>
                </article>
                <article className="metric-card">
                  <p className="panel-label">Desktop topology</p>
                  <strong>{workspace.seams.desktopTopology}</strong>
                </article>
                <article className="metric-card">
                  <div className="panel-heading panel-heading-compact">
                    <div>
                      <p className="panel-label">Transcript runtime</p>
                      <h3>Provider health</h3>
                    </div>
                    <span className={`status-pill ${transcriptRuntimeStatusTone(workspace.transcriptRuntime.status)}`}>
                      {workspace.transcriptRuntime.status}
                    </span>
                  </div>
                  <div className="backlinks">
                    <div className="backlink-item">
                      <strong>Command</strong>
                      <span>{workspace.transcriptRuntime.resolvedCommand}</span>
                    </div>
                    <div className="backlink-item">
                      <strong>Model</strong>
                      <span>{workspace.transcriptRuntime.whisperModel}</span>
                    </div>
                    <div className="backlink-item">
                      <strong>Command source</strong>
                      <span>{workspace.transcriptRuntime.commandSource}</span>
                    </div>
                  </div>
                  <p className="muted">{workspace.transcriptRuntime.detail}</p>
                </article>
                <article className="metric-card">
                  <p className="panel-label">Provider modes</p>
                  <div className="backlinks">
                    <div className="backlink-item">
                      <strong>Transcript</strong>
                      <span>{workspace.seams.transcriptProvider}</span>
                    </div>
                    <div className="backlink-item">
                      <strong>Memory</strong>
                      <span>{workspace.seams.memoryProvider}</span>
                    </div>
                    <div className="backlink-item">
                      <strong>Composition</strong>
                      <span>{workspace.seams.compositionProvider}</span>
                    </div>
                    <div className="backlink-item">
                      <strong>Export</strong>
                      <span>{workspace.seams.exportProvider}</span>
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
};
