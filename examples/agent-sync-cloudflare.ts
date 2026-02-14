import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime, Sync } from "../src/index.js"

const url = process.env.SYNC_URL ?? "ws://localhost:8787/event-log"
const tenant = process.env.SYNC_TENANT
const authToken = process.env.SYNC_AUTH_TOKEN

const layer = Sync.withRemoteSync(url, {
  syncInterval: "3 seconds",
  exposeSync: true,
  ...(tenant !== undefined ? { tenant } : {}),
  ...(authToken !== undefined ? { authToken } : {})
})

const program = Effect.scoped(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime
    const handle = yield* runtime.query("Hello from the Cloudflare sync demo")
    yield* handle.stream.pipe(Stream.runDrain)
    yield* Effect.logInfo("sync demo complete")
  }).pipe(Effect.provide(layer))
)

Effect.runPromise(program)
