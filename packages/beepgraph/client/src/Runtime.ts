/**
 * ManagedRuntime bridge for React integration.
 *
 * Creates a long-lived runtime from a client Layer that can be used
 * in React hooks, event handlers, and other non-Effect contexts.
 *
 * @example
 * ```typescript
 * import { makeBeepGraphRuntime } from "@beep/beepgraph-client/Runtime"
 * import { BeepGraphClient } from "@beep/beepgraph-client/BeepGraphClient"
 *
 * // Create once at app startup
 * const runtime = makeBeepGraphRuntime(BeepGraphClient.layer)
 *
 * // Use in React hooks
 * const result = await runtime.runPromise(
 *   BeepGraphClient.use((client) => client.graphRag({ query: "What is Effect?" }))
 * )
 *
 * // Dispose on app unmount
 * await runtime.dispose()
 * ```
 *
 * @module
 * @since 0.1.0
 */
import { type Layer, ManagedRuntime } from "effect";

import type { BeepGraphClient } from "./BeepGraphClient.ts";

// ---------------------------------------------------------------------------
// Runtime factory
// ---------------------------------------------------------------------------

/**
 * Create a `ManagedRuntime` from a `BeepGraphClient` layer.
 *
 * The runtime manages the lifecycle of all services in the layer
 * (connection pools, subscriptions, etc.) and provides `runPromise`
 * / `runSync` for imperative execution from React or other non-Effect
 * code.
 *
 * Call `runtime.dispose()` when the application unmounts to cleanly
 * shut down all managed resources.
 *
 * @since 0.1.0
 * @category constructors
 */
export const makeBeepGraphRuntime = <E>(
  layer: Layer.Layer<BeepGraphClient, E>
): ManagedRuntime.ManagedRuntime<BeepGraphClient, E> => ManagedRuntime.make(layer);
