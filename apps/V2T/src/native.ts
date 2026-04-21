import { $V2TId } from "@beep/identity";
import { LiteralKit, OptionFromNullableStr, StatusCauseTaggedErrorClass, UUID } from "@beep/schema";
import {
  CreateVt2SessionInput,
  RunVt2CompositionInput,
  SidecarBootstrap as SidecarBootstrapSchema,
  UpdateVt2DesktopPreferencesInput,
  Vt2DesktopPreferences,
  Vt2SessionResource,
  Vt2WorkspaceSnapshot,
} from "@beep/v2t-sidecar";
import { Effect, pipe } from "effect";
import type * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $V2TId.create("native");
type SidecarBootstrap = typeof SidecarBootstrapSchema.Type;
const encodeCreateSessionInput = S.encodeSync(CreateVt2SessionInput);
const encodePreferencesInput = S.encodeSync(UpdateVt2DesktopPreferencesInput);
const encodeCompositionInput = S.encodeSync(RunVt2CompositionInput);

/**
 * Managed V2T sidecar lifecycle status.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2SidecarStatus = LiteralKit(["stopped", "starting", "healthy", "failed"]).annotate(
  $I.annote("Vt2SidecarStatus", {
    description: "Lifecycle status reported by the managed V2T native sidecar bridge.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2SidecarStatus = typeof Vt2SidecarStatus.Type;

/**
 * Managed V2T sidecar launch mode.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2SidecarMode = LiteralKit(["managed-dev-portless", "managed-packaged"]).annotate(
  $I.annote("Vt2SidecarMode", {
    description: "Launch mode selected by the native V2T shell.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2SidecarMode = typeof Vt2SidecarMode.Type;

/**
 * Managed direct-capture lifecycle status.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Vt2ManagedCaptureStatus = LiteralKit(["idle", "capturing", "recoverable"]).annotate(
  $I.annote("Vt2ManagedCaptureStatus", {
    description: "Lifecycle status reported by the managed native capture bridge.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type Vt2ManagedCaptureStatus = typeof Vt2ManagedCaptureStatus.Type;

/**
 * Native-shell view of the managed V2T sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2ManagedSidecarState extends S.Class<Vt2ManagedSidecarState>($I`Vt2ManagedSidecarState`)(
  {
    status: Vt2SidecarStatus,
    mode: Vt2SidecarMode,
    bootstrap: S.OptionFromOptionalKey(SidecarBootstrapSchema),
    errorMessage: S.OptionFromOptionalKey(S.String),
    stderrTail: S.Array(S.String),
  },
  $I.annote("Vt2ManagedSidecarState", {
    description: "Native-shell view of the managed V2T sidecar lifecycle.",
  })
) {}

/**
 * Native-shell view of the managed direct-capture lifecycle.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2ManagedCaptureState extends S.Class<Vt2ManagedCaptureState>($I`Vt2ManagedCaptureState`)(
  {
    status: Vt2ManagedCaptureStatus,
    activeSessionId: S.OptionFromOptionalKey(UUID),
    activeCaptureId: S.OptionFromOptionalKey(UUID),
    draftPath: S.OptionFromOptionalKey(S.String),
    startedAt: S.OptionFromOptionalKey(S.DateTimeUtcFromMillis),
    recoverySessionId: S.OptionFromOptionalKey(UUID),
    recoveryCandidateId: S.OptionFromOptionalKey(UUID),
    errorMessage: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("Vt2ManagedCaptureState", {
    description: "Native-shell view of the direct-capture draft and recovery lifecycle.",
  })
) {}

/**
 * Typed native bridge error emitted by the V2T shell.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2NativeError extends StatusCauseTaggedErrorClass<Vt2NativeError>($I`Vt2NativeError`)(
  "Vt2NativeError",
  $I.annote("Vt2NativeError", {
    description: "Typed error emitted by the V2T native bridge.",
  })
) {}

/**
 * Determine whether the current runtime is the Tauri desktop shell.
 *
 * @since 0.0.0
 * @category Utility
 */
export const isNativeDesktop = (): boolean =>
  pipe(globalThis.window, P.every([P.isNotUndefined, P.isObject, P.hasProperty("__TAURI_INTERNALS__")]));

const invokeNative: <A>(
  command: string,
  decode: (input: unknown) => A,
  fallback: string,
  args?: undefined | Record<string, unknown>
) => Effect.Effect<A, Vt2NativeError, never> = <A>(
  command: string,
  decode: (input: unknown) => A,
  fallback: string,
  args?: undefined | Record<string, unknown>
) =>
  isNativeDesktop()
    ? Effect.tryPromise({
        try: async () => {
          const { invoke } = await import("@tauri-apps/api/core");
          return decode(await invoke(command, args));
        },
        catch: (cause) => Vt2NativeError.new(cause, fallback, 500),
      })
    : Effect.fail(Vt2NativeError.noCause(fallback, 500));

/**
 * Start the managed V2T sidecar from the native shell.
 *
 * @since 0.0.0
 * @category Integration
 */
export const startV2tSidecar: () => Effect.Effect<SidecarBootstrap, Vt2NativeError> = (): Effect.Effect<
  SidecarBootstrap,
  Vt2NativeError
> => invokeNative("start_sidecar", S.decodeUnknownSync(SidecarBootstrapSchema), "Failed to start the V2T sidecar.");

/**
 * Stop the managed V2T sidecar from the native shell.
 *
 * @since 0.0.0
 * @category Integration
 */
export const stopV2tSidecar: () => Effect.Effect<void, Vt2NativeError> = (): Effect.Effect<void, Vt2NativeError> =>
  invokeNative("stop_sidecar", S.decodeUnknownSync(S.Void), "Failed to stop the V2T sidecar.");

/**
 * Read the current native sidecar lifecycle state.
 *
 * @since 0.0.0
 * @category Integration
 */
export const getV2tSidecarState: () => Effect.Effect<Vt2ManagedSidecarState, Vt2NativeError> = (): Effect.Effect<
  Vt2ManagedSidecarState,
  Vt2NativeError
> =>
  invokeNative(
    "get_sidecar_state",
    S.decodeUnknownSync(Vt2ManagedSidecarState),
    "Failed to load the V2T native sidecar state."
  );

/**
 * Probe the managed sidecar health from the native shell and reconcile stale state.
 *
 * @since 0.0.0
 * @category Integration
 */
export const probeV2tSidecar: () => Effect.Effect<Vt2ManagedSidecarState, Vt2NativeError> = (): Effect.Effect<
  Vt2ManagedSidecarState,
  Vt2NativeError
> =>
  invokeNative(
    "probe_sidecar",
    S.decodeUnknownSync(Vt2ManagedSidecarState),
    "Failed to verify the V2T sidecar health."
  );

/**
 * Subscribe to native sidecar-state changes while the desktop shell is active.
 *
 * @since 0.0.0
 * @category Integration
 */
export const observeV2tSidecarState = (
  onState: (state: Vt2ManagedSidecarState) => void
): Effect.Effect<() => void, Vt2NativeError> =>
  isNativeDesktop()
    ? Effect.tryPromise({
        try: async () => {
          const { listen } = await import("@tauri-apps/api/event");

          return await listen("v2t://sidecar-state-changed", (event) => {
            try {
              onState(S.decodeUnknownSync(Vt2ManagedSidecarState)(event.payload));
            } catch {
              return;
            }
          });
        },
        catch: (cause) => Vt2NativeError.new(cause, "Failed to subscribe to V2T native sidecar-state events.", 500),
      })
    : Effect.fail(
        Vt2NativeError.noCause("V2T native sidecar-state events are only available inside the desktop shell.", 500)
      );

/**
 * Read the current native capture lifecycle state.
 *
 * @since 0.0.0
 * @category Integration
 */
export const getV2tCaptureState: () => Effect.Effect<Vt2ManagedCaptureState, Vt2NativeError> = (): Effect.Effect<
  Vt2ManagedCaptureState,
  Vt2NativeError
> =>
  invokeNative(
    "get_capture_state",
    S.decodeUnknownSync(Vt2ManagedCaptureState),
    "Failed to load the V2T native capture state."
  );

/**
 * Load the V2T workspace snapshot via the native shell bridge.
 *
 * @since 0.0.0
 * @category Integration
 */
export const getV2tWorkspaceSnapshot: () => Effect.Effect<Vt2WorkspaceSnapshot, Vt2NativeError> = (): Effect.Effect<
  Vt2WorkspaceSnapshot,
  Vt2NativeError
> =>
  invokeNative(
    "get_workspace_snapshot",
    S.decodeUnknownSync(Vt2WorkspaceSnapshot),
    "Failed to load the V2T workspace snapshot via the native shell."
  );

/**
 * Load a V2T session resource via the native shell bridge.
 *
 * @since 0.0.0
 * @category Integration
 */
export const getV2tSessionResource = (sessionId: string): Effect.Effect<Vt2SessionResource, Vt2NativeError> =>
  invokeNative(
    "get_session_resource",
    S.decodeUnknownSync(Vt2SessionResource),
    `Failed to load the V2T session "${sessionId}" via the native shell.`,
    { sessionId }
  );

/**
 * Create a V2T session via the native shell bridge.
 *
 * @since 0.0.0
 * @category Integration
 */
export const createV2tSessionResource = (
  input: CreateVt2SessionInput
): Effect.Effect<Vt2SessionResource, Vt2NativeError> =>
  invokeNative(
    "create_session_resource",
    S.decodeUnknownSync(Vt2SessionResource),
    `Failed to create the ${input.source} session "${input.title}" via the native shell.`,
    { payload: encodeCreateSessionInput(input) }
  );

/**
 * Save desktop preferences via the native shell bridge.
 *
 * @since 0.0.0
 * @category Integration
 */
export const saveV2tDesktopPreferences = (
  input: UpdateVt2DesktopPreferencesInput
): Effect.Effect<Vt2DesktopPreferences, Vt2NativeError> =>
  invokeNative(
    "save_preferences",
    S.decodeUnknownSync(Vt2DesktopPreferences),
    "Failed to save the V2T desktop preferences via the native shell.",
    { payload: encodePreferencesInput(input) }
  );

/**
 * Run the V2T composition flow via the native shell bridge.
 *
 * @since 0.0.0
 * @category Integration
 */
export const runV2tSessionComposition = (
  sessionId: string,
  input: RunVt2CompositionInput
): Effect.Effect<Vt2SessionResource, Vt2NativeError> =>
  invokeNative(
    "run_session_composition",
    S.decodeUnknownSync(Vt2SessionResource),
    `Failed to run the V2T composition flow for session "${sessionId}" via the native shell.`,
    { sessionId, payload: encodeCompositionInput(input) }
  );

/**
 * Retry local transcription for the selected session through the native shell bridge.
 *
 * @since 0.0.0
 * @category Integration
 */
export const retryV2tSessionTranscript = (sessionId: string): Effect.Effect<Vt2SessionResource, Vt2NativeError> =>
  invokeNative(
    "retry_session_transcript",
    S.decodeUnknownSync(Vt2SessionResource),
    `Failed to retry the V2T transcript flow for session "${sessionId}" via the native shell.`,
    { sessionId }
  );

/**
 * Start a native-owned capture draft for the selected session.
 *
 * @since 0.0.0
 * @category Integration
 */
export const startV2tCapture = (sessionId: string): Effect.Effect<Vt2ManagedCaptureState, Vt2NativeError> =>
  invokeNative(
    "start_capture",
    S.decodeUnknownSync(Vt2ManagedCaptureState),
    `Failed to start native capture for session "${sessionId}".`,
    { sessionId }
  );

/**
 * Stop the active native-owned capture draft and hand it to the sidecar.
 *
 * @since 0.0.0
 * @category Integration
 */
export const stopV2tCapture = (sessionId: string): Effect.Effect<Vt2ManagedCaptureState, Vt2NativeError> =>
  invokeNative(
    "stop_capture",
    S.decodeUnknownSync(Vt2ManagedCaptureState),
    `Failed to stop native capture for session "${sessionId}".`,
    { sessionId }
  );

/**
 * Simulate an interruption for the active native-owned capture draft.
 *
 * @since 0.0.0
 * @category Integration
 */
export const interruptV2tCapture = (sessionId: string): Effect.Effect<Vt2ManagedCaptureState, Vt2NativeError> =>
  invokeNative(
    "interrupt_capture",
    S.decodeUnknownSync(Vt2ManagedCaptureState),
    `Failed to interrupt native capture for session "${sessionId}".`,
    { sessionId }
  );

/**
 * Recover a pending recovery candidate through the native bridge.
 *
 * @since 0.0.0
 * @category Integration
 */
export const recoverV2tRecoveryCandidate = (
  sessionId: string,
  candidateId: string
): Effect.Effect<Vt2ManagedCaptureState, Vt2NativeError> =>
  invokeNative(
    "recover_capture_candidate",
    S.decodeUnknownSync(Vt2ManagedCaptureState),
    `Failed to recover V2T candidate "${candidateId}".`,
    { sessionId, candidateId }
  );

/**
 * Discard a pending recovery candidate through the native bridge.
 *
 * @since 0.0.0
 * @category Integration
 */
export const discardV2tRecoveryCandidate = (
  sessionId: string,
  candidateId: string
): Effect.Effect<Vt2ManagedCaptureState, Vt2NativeError> =>
  invokeNative(
    "discard_capture_candidate",
    S.decodeUnknownSync(Vt2ManagedCaptureState),
    `Failed to discard V2T candidate "${candidateId}".`,
    { sessionId, candidateId }
  );

/**
 * Subscribe to native capture-state changes while the desktop shell is active.
 *
 * @since 0.0.0
 * @category Integration
 */
export const observeV2tCaptureState = (
  onState: (state: Vt2ManagedCaptureState) => void
): Effect.Effect<() => void, Vt2NativeError> =>
  isNativeDesktop()
    ? Effect.tryPromise({
        try: async () => {
          const { listen } = await import("@tauri-apps/api/event");

          return await listen("v2t://capture-state-changed", (event) => {
            try {
              onState(S.decodeUnknownSync(Vt2ManagedCaptureState)(event.payload));
            } catch {
              return;
            }
          });
        },
        catch: (cause) => Vt2NativeError.new(cause, "Failed to subscribe to V2T native capture-state events.", 500),
      })
    : Effect.fail(
        Vt2NativeError.noCause("V2T native capture-state events are only available inside the desktop shell.", 500)
      );

/**
 * Open the native directory picker for selecting a workspace directory.
 *
 * @since 0.0.0
 * @category Integration
 */
export const pickWorkspaceDirectory: () => Effect.Effect<O.Option<string>, Vt2NativeError, never> = (): Effect.Effect<
  O.Option<string>,
  Vt2NativeError,
  never
> =>
  invokeNative(
    "pick_workspace_directory",
    S.decodeUnknownSync(OptionFromNullableStr),
    "Failed to open the V2T workspace directory picker."
  );
