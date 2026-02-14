/**
 * Cloudflare Sandbox Example (Workers-only)
 *
 * Shows how to configure a Cloudflare Sandbox backend for isolated
 * agent execution. Two patterns are demonstrated:
 *
 * 1. runtimeLayer() — for one-shot requests
 * 2. managedRuntime() — for persistent Workers (cached per-isolate)
 *
 * Requires:
 *   - A Cloudflare Worker environment with a Sandbox binding
 *   - @cloudflare/sandbox >=0.7.0 installed
 *
 * This file is a reference — it cannot run locally.
 * Deploy it inside a Worker's fetch handler.
 */
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import type * as ManagedRuntime from "effect/ManagedRuntime"
import * as Stream from "effect/Stream"
import {
  AgentRuntime,
  type QuerySupervisor,
  Sandbox,
  managedRuntime,
  runtimeLayer
} from "../src/index.js"

type Env = {
  readonly ANTHROPIC_API_KEY: string
  readonly Sandbox: unknown
}

// ---------------------------------------------------------------------------
// Approach 1: runtimeLayer (one-shot — layer built per request)
// ---------------------------------------------------------------------------
export const handleRequestOneShot = (env: Env) => {
  const layer = runtimeLayer({
    apiKey: env.ANTHROPIC_API_KEY,
    model: "sonnet",
    sandbox: {
      provider: "cloudflare",
      sandboxId: "demo-sandbox",
      env: { Sandbox: env.Sandbox },
      sleepAfter: "15m",
      apiKey: env.ANTHROPIC_API_KEY
    },
    persistence: "memory"
  })

  return Effect.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const sandbox = yield* Sandbox.SandboxService
        yield* Console.log(`Provider: ${sandbox.provider}, Isolated: ${sandbox.isolated}`)

        const runtime = yield* AgentRuntime
        const handle = yield* runtime.query("List files in /tmp")
        const messages = yield* Stream.runCollect(handle.stream)
        return Array.from(messages)
      }).pipe(Effect.provide(layer))
    )
  )
}

// ---------------------------------------------------------------------------
// Approach 2: managedRuntime (persistent — cached per Worker isolate)
// ---------------------------------------------------------------------------
// Build once at module scope, reuse across all requests on this isolate.
// ManagedRuntime manages the layer lifecycle and memoizes construction.
type SandboxRuntime = ManagedRuntime.ManagedRuntime<
  AgentRuntime | QuerySupervisor | Sandbox.SandboxService,
  unknown
>
let cachedRt: SandboxRuntime | undefined

const getRuntime = (env: Env) => {
  cachedRt ??= managedRuntime({
    apiKey: env.ANTHROPIC_API_KEY,
    model: "sonnet",
    sandbox: {
      provider: "cloudflare",
      sandboxId: "demo-sandbox",
      env: { Sandbox: env.Sandbox },
      sleepAfter: "15m",
      apiKey: env.ANTHROPIC_API_KEY
    },
    persistence: "memory"
  })
  return cachedRt
}

export const handleRequestCached = (env: Env) => {
  const rt = getRuntime(env)

  // No Effect.provide needed — services are baked into the runtime
  return rt.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const sandbox = yield* Sandbox.SandboxService
        yield* Console.log(`Provider: ${sandbox.provider}, Isolated: ${sandbox.isolated}`)

        const result = yield* sandbox.exec("uname", ["-a"])
        yield* Console.log(`OS: ${result.stdout.trim()}`)

        const runtime = yield* AgentRuntime
        const handle = yield* runtime.query("List files in /tmp")
        const messages = yield* Stream.runCollect(handle.stream)
        return Array.from(messages)
      })
    )
  )
}
