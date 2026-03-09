import net from "node:net"
import {
  Command,
  type CommandExecutor,
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform"
import { Console, Context, Effect, Layer, Schedule, Stream } from "effect"
import { getBaseUrl, NEXT_CACHE_DIR, TEMPLATE_ROUTE } from "./config.js"

// =============================================================================
// Server Handle
// =============================================================================

interface ServerHandle {
  baseUrl: string
  process: CommandExecutor.Process | null
}

// =============================================================================
// Port Discovery
// =============================================================================

/** Find an available port by binding to port 0 */
const getRandomPort = Effect.async<number>((resume) => {
  const server = net.createServer()
  server.listen(0, "localhost", () => {
    const address = server.address()
    const port = typeof address === "object" && address ? address.port : 0
    server.close(() => resume(Effect.succeed(port)))
  })
  server.on("error", (err) => resume(Effect.fail(err)))
})

// =============================================================================
// HTTP Helpers
// =============================================================================

const checkServer = (url: string) =>
  HttpClient.execute(HttpClientRequest.get(url)).pipe(
    Effect.flatMap(HttpClientResponse.filterStatusOk),
    Effect.as(true),
    Effect.catchAll(() => Effect.succeed(false)),
    Effect.provide(FetchHttpClient.layer),
  )

const waitForServer = (url: string) =>
  checkServer(url).pipe(
    Effect.filterOrFail(
      (ok) => ok,
      () => new Error("Server not ready"),
    ),
    Effect.retry(Schedule.spaced("500 millis")),
    Effect.timeout("45 seconds"),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(new Error(`Timed out waiting for Next.js dev server at ${url}`)),
    ),
  )

// =============================================================================
// Server Lifecycle
// =============================================================================

const startDevServer = Effect.gen(function* () {
  const port = yield* getRandomPort
  const baseUrl = `http://localhost:${port}`

  yield* Console.log(`Starting temporary Next.js server for OG template on ${baseUrl}...`)

  const command = Command.make("bunx", "next", "dev", "--hostname", "127.0.0.1", "--port", String(port)).pipe(
    Command.workingDirectory(process.cwd()),
    Command.env({
      BROWSER: "none",
      NEXT_CACHE_DIR,
    }),
    Command.stderr("inherit"),
  )

  // Command.start is already scoped - process killed when scope closes
  const proc = yield* Command.start(command)

  // Pipe stdout to console with prefix
  yield* proc.stdout
    .pipe(
      Stream.decodeText(),
      Stream.runForEach((chunk) => Effect.sync(() => process.stdout.write(`[og-dev] ${chunk}`))),
    )
    .pipe(Effect.fork)

  // Wait for server to be ready
  yield* waitForServer(new URL(TEMPLATE_ROUTE, baseUrl).toString())

  return { baseUrl, process: proc } satisfies ServerHandle
})

const acquireServer = Effect.gen(function* () {
  // Check for explicit base URL override
  const explicitBaseUrl = getBaseUrl()
  if (explicitBaseUrl) {
    return { baseUrl: explicitBaseUrl, process: null } satisfies ServerHandle
  }

  // Always start our own server on a random port to avoid cross-project contamination
  return yield* startDevServer
})

// =============================================================================
// Template Server Service
// =============================================================================

export class TemplateServer extends Context.Tag("TemplateServer")<TemplateServer, { readonly baseUrl: string }>() {
  static layer = Layer.scoped(TemplateServer, acquireServer.pipe(Effect.map((handle) => ({ baseUrl: handle.baseUrl }))))

  static test = (baseUrl: string) => Layer.succeed(TemplateServer, TemplateServer.of({ baseUrl }))
}
