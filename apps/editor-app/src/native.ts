import { SidecarBootstrap } from "@beep/editor-protocol";
import { $I as $SchemaId } from "@beep/identity/packages";
import { LiteralKit, makeStatusCauseError, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { Cause, Effect } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $EditorAppId = $SchemaId.create("apps/editor-app/src/native");

export const EditorSidecarStatus = LiteralKit(["stopped", "starting", "healthy", "failed"]).annotate(
  $EditorAppId.annote("EditorSidecarStatus", {
    description: "Lifecycle status reported by the managed editor sidecar.",
  })
);

export const EditorSidecarMode = LiteralKit(["managed-dev-portless", "managed-packaged"]).annotate(
  $EditorAppId.annote("EditorSidecarMode", {
    description: "Launch mode selected by the native editor shell.",
  })
);

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

export class EditorNativeError extends TaggedErrorClass<EditorNativeError>($EditorAppId`EditorNativeError`)(
  "EditorNativeError",
  StatusCauseFields,
  $EditorAppId.annote("EditorNativeError", {
    description: "Typed error emitted by the editor native bridge.",
  })
) {}

const NullableString = S.OptionFromNullOr(S.String);
const toNativeError = makeStatusCauseError(EditorNativeError);

const isNativeDesktop = (): boolean =>
  globalThis.window !== undefined &&
  P.isObject(globalThis.window) &&
  P.hasProperty(globalThis.window, "__TAURI_INTERNALS__");

export { isNativeDesktop };

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

export const startEditorSidecar = () =>
  invokeNative("start_sidecar", S.decodeUnknownSync(SidecarBootstrap), "Failed to start the editor sidecar.");

export const stopEditorSidecar = () =>
  invokeNative("stop_sidecar", S.decodeUnknownSync(S.Void), "Failed to stop the editor sidecar.");

export const getEditorSidecarState = () =>
  invokeNative(
    "get_sidecar_state",
    S.decodeUnknownSync(EditorSidecarState),
    "Failed to load the editor sidecar state."
  );

export const pickWorkspaceDirectory = () =>
  invokeNative(
    "pick_workspace_directory",
    S.decodeUnknownSync(NullableString),
    "Failed to open the native workspace directory picker."
  );
