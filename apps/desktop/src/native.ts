import { $I } from "@beep/identity/packages";
import { SidecarBootstrap } from "@beep/runtime-protocol";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { Cause, Effect } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $DesktopId = $I.create("apps/desktop/src/native");

export const ManagedSidecarStatus = LiteralKit(["stopped", "starting", "healthy", "failed"]).annotate(
  $DesktopId.annote("ManagedSidecarStatus", {
    description: "Lifecycle status reported by the native Tauri desktop bridge.",
  })
);

export const ManagedSidecarMode = LiteralKit(["managed-dev-portless", "managed-packaged"]).annotate(
  $DesktopId.annote("ManagedSidecarMode", {
    description: "Managed sidecar launch mode selected by the native Tauri desktop bridge.",
  })
);

export class ManagedSidecarState extends S.Class<ManagedSidecarState>($DesktopId`ManagedSidecarState`)(
  {
    status: ManagedSidecarStatus,
    mode: ManagedSidecarMode,
    bootstrap: S.OptionFromOptionalKey(SidecarBootstrap),
    errorMessage: S.OptionFromOptionalKey(S.String),
    stderrTail: S.Array(S.String),
  },
  $DesktopId.annote("ManagedSidecarState", {
    description: "Native desktop view of the managed repo-memory sidecar lifecycle.",
  })
) {}

export class DesktopNativeError extends TaggedErrorClass<DesktopNativeError>($DesktopId`DesktopNativeError`)(
  "DesktopNativeError",
  {
    message: S.String,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $DesktopId.annote("DesktopNativeError", {
    description: "Typed error emitted by the native desktop bridge.",
  })
) {}

const NullableString = S.OptionFromNullOr(S.String);

const toNativeError = (message: string, cause: unknown): DesktopNativeError =>
  new DesktopNativeError({
    message,
    cause: O.fromUndefinedOr(P.isError(cause) ? cause : undefined),
  });

const isNativeDesktop = (): boolean =>
  P.isObject(globalThis.window) && P.hasProperty(globalThis.window, "__TAURI_INTERNALS__");

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
        catch: (cause) => toNativeError(fallback, cause),
      })
    : Effect.fail(toNativeError(fallback, undefined))
  ).pipe(Effect.catchCause((cause) => Effect.fail(toNativeError(fallback, Cause.squash(cause)))));

export { isNativeDesktop };

export const startManagedSidecar = () =>
  invokeNative("start_sidecar", S.decodeUnknownSync(SidecarBootstrap), "Failed to start the managed local sidecar.");

export const stopManagedSidecar = () =>
  invokeNative("stop_sidecar", S.decodeUnknownSync(S.Void), "Failed to stop the managed local sidecar.");

export const getManagedSidecarState = () =>
  invokeNative(
    "get_sidecar_state",
    S.decodeUnknownSync(ManagedSidecarState),
    "Failed to load the managed sidecar state."
  );

export const pickRepoDirectory = () =>
  invokeNative(
    "pick_repo_directory",
    S.decodeUnknownSync(NullableString),
    "Failed to open the native repo directory picker."
  );
