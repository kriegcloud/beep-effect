import * as Effect from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Authentication from "./Authentication.layer.ts";

export const serverRuntime = ManagedRuntime.make(Authentication.layer);

export type ServerRuntimeEnv = ManagedRuntime.ManagedRuntime.Context<typeof serverRuntime>;

/**
 * Runs an Effect within the configured server runtime while recording a tracing span.
 */
export const runServerPromise = <A, E>(
  effect: Effect.Effect<A, E, ServerRuntimeEnv>,
  spanName = "serverRuntime.runPromise",
  options?: Parameters<typeof serverRuntime.runPromise>[1] | undefined
) => serverRuntime.runPromise(Effect.withSpan(effect, spanName), options);

/**
 * Runs an Effect within the configured server runtime and captures the full Exit value.
 */
export const runServerPromiseExit = <A, E>(
  effect: Effect.Effect<A, E, ServerRuntimeEnv>,
  spanName = "serverRuntime.runPromiseExit",
  options?:
    | {
        readonly signal?: AbortSignal | undefined;
      }
    | undefined
) => serverRuntime.runPromiseExit(Effect.withSpan(effect, spanName), options);
