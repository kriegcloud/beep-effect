import { serverEnv } from "@beep/shared-env/ServerEnv";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as EffectLogger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Authentication from "./Authentication.layer";
import * as Persistence from "./Persistence.layer";
import * as Tooling from "./Tooling.layer";

export const serverRuntimeLayer = Layer.mergeAll(
  Authentication.layer,
  FetchHttpClient.layer,
  EffectLogger.minimumLogLevel(serverEnv.app.logLevel),
  Persistence.layer,
  Tooling.layer
);

export const serverRuntime = ManagedRuntime.make(serverRuntimeLayer);

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
