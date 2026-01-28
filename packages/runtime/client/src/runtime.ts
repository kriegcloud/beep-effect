import { Atom } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import type * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import type { ClientRuntimeLayer } from "./layer";
import { clientRuntimeLayer } from "./layer";

export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});
makeAtomRuntime.addGlobalLayer(clientRuntimeLayer);
export const clientRuntime = ManagedRuntime.make(clientRuntimeLayer);

// ============================================================================
// Runtime helpers
// ============================================================================

export type LiveManagedRuntime = ManagedRuntime.ManagedRuntime<Layer.Layer.Success<ClientRuntimeLayer>, never>;
export type LiveRuntimeContext = ManagedRuntime.ManagedRuntime.Context<LiveManagedRuntime>;

type ClientRuntimeEnv = Layer.Layer.Success<ClientRuntimeLayer>;
type RunPromiseOptions = Parameters<LiveManagedRuntime["runPromise"]>[1];
type RunPromiseExitOptions = Parameters<LiveManagedRuntime["runPromiseExit"]>[1];

/**
 * Runs an Effect within the client runtime, wrapping it in an observability span.
 */
export const runClientPromise = <A, E>(
  runtime: LiveManagedRuntime,
  effect: Effect.Effect<A, E, ClientRuntimeEnv>,
  spanName = "clientRuntime.runPromise",
  options?: RunPromiseOptions | undefined
) => runtime.runPromise(Effect.withSpan(effect, spanName), options);

export const runClientSync = <A, E>(runtime: LiveManagedRuntime, effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
  runtime.runSync(effect);

export const runClientSyncExit = <A, E>(runtime: LiveManagedRuntime, effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
  runtime.runSyncExit(effect);

/**
 * Returns a helper function bound to a specific runtime for repeated invocations.
 */
export const makeRunClientSync =
  (runtime: LiveManagedRuntime) =>
  <A, E>(effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
    runClientSync(runtime, effect);

export const makeRunClientSyncExit =
  (runtime: LiveManagedRuntime) =>
  <A, E>(effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
    runClientSyncExit(runtime, effect);
/**
 * Returns a helper function bound to a specific runtime for repeated invocations.
 */
export const makeRunClientPromise =
  (runtime: LiveManagedRuntime, spanName = "clientRuntime.runPromise", options?: RunPromiseOptions | undefined) =>
  <A, E>(effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
    runClientPromise(runtime, effect, spanName, options);

/**
 * Runs an Effect within the client runtime and returns its Exit value.
 */
export const runClientPromiseExit = <A, E>(
  runtime: LiveManagedRuntime,
  effect: Effect.Effect<A, E, ClientRuntimeEnv>,
  spanName = "clientRuntime.runPromiseExit",
  options?: RunPromiseExitOptions | undefined
) => runtime.runPromiseExit(Effect.withSpan(effect, spanName), options);

/**
 * Returns a helper function that captures Exit values from Effects run in the client runtime.
 */
export const makeRunClientPromiseExit =
  (
    runtime: LiveManagedRuntime,
    spanName = "clientRuntime.runPromiseExit",
    options?: RunPromiseExitOptions | undefined
  ) =>
  <A, E>(effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
    runClientPromiseExit(runtime, effect, spanName, options);
