/**
 * Native sidecar bridge for the editor desktop shell.
 *
 * @module
 * @since 0.0.0
 */
import { SidecarBootstrap } from "@beep/editor-protocol";
import { $EditorAppId } from "@beep/identity";
import { LiteralKit, OptionFromNullableStr, StatusCauseTaggedErrorClass } from "@beep/schema";
import { Effect, pipe } from "effect";
import type * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $EditorAppId.create("native");

/**
 * Managed editor sidecar lifecycle status.
 *
 * @example
 * ```ts
 * import type { EditorSidecarStatus } from "@beep/editor-app/native"
 *
 * const status: EditorSidecarStatus = "healthy"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const EditorSidecarStatus = LiteralKit(["stopped", "starting", "healthy", "failed"]).annotate(
  $I.annote("EditorSidecarStatus", {
    description: "Lifecycle status reported by the managed editor sidecar.",
  })
);
/**
 * {@inheritDoc EditorSidecarStatus}
 *
 * @example
 * ```ts
 * import type { EditorSidecarStatus } from "@beep/editor-app/native"
 *
 * const status: EditorSidecarStatus = "stopped"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type EditorSidecarStatus = typeof EditorSidecarStatus.Type;

/**
 * Managed editor sidecar launch mode.
 *
 * @example
 * ```ts
 * import type { EditorSidecarMode } from "@beep/editor-app/native"
 *
 * const mode: EditorSidecarMode = "managed-dev-portless"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const EditorSidecarMode = LiteralKit(["managed-dev-portless", "managed-packaged"]).annotate(
  $I.annote("EditorSidecarMode", {
    description: "Launch mode selected by the native editor shell.",
  })
);
/**
 * {@inheritDoc EditorSidecarMode}
 *
 * @example
 * ```ts
 * import type { EditorSidecarMode } from "@beep/editor-app/native"
 *
 * const mode: EditorSidecarMode = "managed-packaged"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type EditorSidecarMode = typeof EditorSidecarMode.Type;

/**
 * Native shell view of the managed editor sidecar.
 *
 * @example
 * ```ts
 * import { EditorSidecarState } from "@beep/editor-app/native"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownSync(EditorSidecarState)
 * const state = decode({
 *   status: "stopped",
 *   mode: "managed-dev-portless",
 *   stderrTail: [],
 * })
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class EditorSidecarState extends S.Class<EditorSidecarState>($EditorAppId`EditorSidecarState`)(
  {
    status: EditorSidecarStatus,
    mode: EditorSidecarMode,
    bootstrap: S.OptionFromOptionalKey(SidecarBootstrap),
    errorMessage: S.OptionFromOptionalKey(S.String),
    stderrTail: S.Array(S.String),
  },
  $I.annote("EditorSidecarState", {
    description: "Native shell view of the managed editor sidecar lifecycle.",
  })
) {}

/**
 * Typed error emitted by the editor native bridge.
 *
 * @example
 * ```ts
 * import { EditorNativeError } from "@beep/editor-app/native"
 *
 * const error = EditorNativeError.noCause("Native bridge unavailable.", 500)
 * ```
 *
 * @since 0.0.0
 * @category error handling
 */
export class EditorNativeError extends StatusCauseTaggedErrorClass<EditorNativeError>($EditorAppId`EditorNativeError`)(
  "EditorNativeError",
  $I.annote("EditorNativeError", {
    description: "Typed error emitted by the editor native bridge.",
  })
) {}

/**
 * Determine whether the current runtime is the Tauri desktop shell.
 *
 * @example
 * ```ts
 * import { isNativeDesktop } from "@beep/editor-app/native"
 *
 * const native = isNativeDesktop()
 * ```
 *
 * @returns `true` when the managed Tauri bridge is available.
 *
 * @since 0.0.0
 * @category predicates
 */
export const isNativeDesktop = (): boolean =>
  pipe(globalThis.window, P.every([P.isNotUndefined, P.isObject, P.hasProperty("__TAURI_INTERNALS__")]));

const invokeNative: <A>(
  command: string,
  decode: (input: unknown) => A,
  fallback: string,
  args?: undefined | Record<string, unknown>
) => Effect.Effect<A, EditorNativeError, never> = <A>(
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
        catch: EditorNativeError.new(fallback, 500),
      })
    : Effect.fail(EditorNativeError.noCause(fallback, 500));

/**
 * Start the managed editor sidecar from the native shell.
 *
 * @example
 * ```ts
 * import { startEditorSidecar } from "@beep/editor-app/native"
 *
 * const program = startEditorSidecar()
 * ```
 *
 * @returns An Effect that resolves with the started sidecar bootstrap.
 *
 * @since 0.0.0
 * @category interop
 */
export const startEditorSidecar: () => Effect.Effect<SidecarBootstrap, EditorNativeError, never> = (): Effect.Effect<
  SidecarBootstrap,
  EditorNativeError
> => invokeNative("start_sidecar", S.decodeUnknownSync(SidecarBootstrap), "Failed to start the editor sidecar.");

/**
 * Stop the managed editor sidecar from the native shell.
 *
 * @example
 * ```ts
 * import { stopEditorSidecar } from "@beep/editor-app/native"
 *
 * const program = stopEditorSidecar()
 * ```
 *
 * @returns An Effect that resolves when the sidecar has been stopped.
 *
 * @since 0.0.0
 * @category interop
 */
export const stopEditorSidecar: () => Effect.Effect<void, EditorNativeError> = (): Effect.Effect<
  void,
  EditorNativeError
> => invokeNative("stop_sidecar", S.decodeUnknownSync(S.Void), "Failed to stop the editor sidecar.");

/**
 * Read the current native sidecar lifecycle state.
 *
 * @example
 * ```ts
 * import { getEditorSidecarState } from "@beep/editor-app/native"
 *
 * const program = getEditorSidecarState()
 * ```
 *
 * @returns An Effect that resolves with the latest native sidecar state.
 *
 * @since 0.0.0
 * @category interop
 */
export const getEditorSidecarState: () => Effect.Effect<EditorSidecarState, EditorNativeError> = (): Effect.Effect<
  EditorSidecarState,
  EditorNativeError
> =>
  invokeNative(
    "get_sidecar_state",
    S.decodeUnknownSync(EditorSidecarState),
    "Failed to load the editor sidecar state."
  );

/**
 * Open the native directory picker for selecting an editor workspace root.
 *
 * @example
 * ```ts
 * import { pickWorkspaceDirectory } from "@beep/editor-app/native"
 *
 * const program = pickWorkspaceDirectory()
 * ```
 *
 * @returns An Effect that resolves with the selected directory or no selection.
 *
 * @since 0.0.0
 * @category interop
 */
export const pickWorkspaceDirectory: () => Effect.Effect<O.Option<string>, EditorNativeError, never> =
  (): Effect.Effect<O.Option<string>, EditorNativeError, never> =>
    invokeNative(
      "pick_workspace_directory",
      S.decodeUnknownSync(OptionFromNullableStr),
      "Failed to open the native workspace directory picker."
    );
