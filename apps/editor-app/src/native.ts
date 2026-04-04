import { SidecarBootstrap } from "@beep/editor-protocol";
import { $I as $SchemaId } from "@beep/identity/packages";
import { LiteralKit, makeStatusCauseError, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { Cause, Effect } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $EditorAppId = $SchemaId.create("apps/editor-app/src/native");

/**
 * Managed editor sidecar lifecycle status.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const EditorSidecarStatus = LiteralKit(["stopped", "starting", "healthy", "failed"]).annotate(
  $EditorAppId.annote("EditorSidecarStatus", {
    description: "Lifecycle status reported by the managed editor sidecar.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type EditorSidecarStatus = typeof EditorSidecarStatus.Type;

/**
 * Managed editor sidecar launch mode.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const EditorSidecarMode = LiteralKit(["managed-dev-portless", "managed-packaged"]).annotate(
  $EditorAppId.annote("EditorSidecarMode", {
    description: "Launch mode selected by the native editor shell.",
  })
);
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type EditorSidecarMode = typeof EditorSidecarMode.Type;

/**
 * Native shell view of the managed editor sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EditorSidecarState extends S.Class<EditorSidecarState>($EditorAppId`EditorSidecarState`)(
  {
    status: EditorSidecarStatus,
    mode: EditorSidecarMode,
    bootstrap: S.OptionFromOptionalKey(SidecarBootstrap),
    errorMessage: S.OptionFromOptionalKey(S.String),
    stderrTail: S.Array(S.String),
  },
  $EditorAppId.annote("EditorSidecarState", {
    description: "Native shell view of the managed editor sidecar lifecycle.",
  })
) {}

/**
 * Typed error emitted by the editor native bridge.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EditorNativeError extends TaggedErrorClass<EditorNativeError>($EditorAppId`EditorNativeError`)(
  "EditorNativeError",
  StatusCauseFields,
  $EditorAppId.annote("EditorNativeError", {
    description: "Typed error emitted by the editor native bridge.",
  })
) {}

const NullableString = S.OptionFromNullOr(S.String);
const toNativeError = makeStatusCauseError(EditorNativeError);

/**
 * Determine whether the current runtime is the Tauri desktop shell.
 *
 * @returns {boolean} - `true` when the managed Tauri bridge is available.
 *
 * @since 0.0.0
 * @category Utility
 */
export const isNativeDesktop = (): boolean =>
  globalThis.window !== undefined &&
  P.isObject(globalThis.window) &&
  P.hasProperty(globalThis.window, "__TAURI_INTERNALS__");

const invokeNative = <A>(
  command: string,
  decode: (input: unknown) => A,
  fallback: string,
  args?: Record<string, unknown>
) =>
  (isNativeDesktop()
    ? Effect.tryPromise({
        try: async () => {
          const { invoke } = await import("@tauri-apps/api/core");
          return decode(await invoke(command, args));
        },
        catch: (cause) => toNativeError(fallback, 500, cause),
      })
    : Effect.fail(toNativeError(fallback, 500))
  ).pipe(Effect.catchCause((cause) => Effect.fail(toNativeError(fallback, 500, Cause.squash(cause)))));

/**
 * Start the managed editor sidecar from the native shell.
 *
 * @returns {Effect.Effect<SidecarBootstrap, EditorNativeError>} - An Effect that resolves with the started sidecar bootstrap.
 *
 * @since 0.0.0
 * @category Integration
 */
export const startEditorSidecar = () =>
  invokeNative("start_sidecar", S.decodeUnknownSync(SidecarBootstrap), "Failed to start the editor sidecar.");

/**
 * Stop the managed editor sidecar from the native shell.
 *
 * @returns {Effect.Effect<void, EditorNativeError>} - An Effect that resolves when the sidecar has been stopped.
 *
 * @since 0.0.0
 * @category Integration
 */
export const stopEditorSidecar = () =>
  invokeNative("stop_sidecar", S.decodeUnknownSync(S.Void), "Failed to stop the editor sidecar.");

/**
 * Read the current native sidecar lifecycle state.
 *
 * @returns {Effect.Effect<EditorSidecarState, EditorNativeError>} - An Effect that resolves with the latest native sidecar state.
 *
 * @since 0.0.0
 * @category Integration
 */
export const getEditorSidecarState = () =>
  invokeNative(
    "get_sidecar_state",
    S.decodeUnknownSync(EditorSidecarState),
    "Failed to load the editor sidecar state."
  );

/**
 * Open the native directory picker for selecting an editor workspace root.
 *
 * @returns {Effect.Effect<O.Option<string>, EditorNativeError>} - An Effect that resolves with the selected directory or no selection.
 *
 * @since 0.0.0
 * @category Integration
 */
export const pickWorkspaceDirectory = () =>
  invokeNative(
    "pick_workspace_directory",
    S.decodeUnknownSync(NullableString),
    "Failed to open the native workspace directory picker."
  );
