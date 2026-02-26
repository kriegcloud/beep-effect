import * as EventLogServer from "@effect/experimental/EventLogServer"
import * as HttpServer from "@effect/platform/HttpServer"
import * as HttpRouter from "@effect/platform/HttpRouter"
import { BunHttpServer } from "@effect/platform-bun"
import * as Context from "effect/Context"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

export type EventLogRemoteServerOptions = {
  readonly port?: number
  readonly hostname?: string
  readonly path?: string
  readonly scheme?: "ws" | "wss"
  readonly storage?: Layer.Layer<EventLogServer.Storage>
}

export class EventLogRemoteServerError extends Schema.TaggedError<EventLogRemoteServerError>()(
  "EventLogRemoteServerError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

/**
 * Build a WebSocket URL from a bound server address.
 * Throws if the address is not a TCP address.
 *
 * @deprecated Prefer `toWebSocketUrlEffect`.
 */
export const toWebSocketUrl = (
  address: HttpServer.Address,
  options?: {
    readonly path?: string
    readonly hostname?: string
    readonly scheme?: "ws" | "wss"
  }
) => {
  if (address._tag !== "TcpAddress") {
    throw EventLogRemoteServerError.make({
      message: "EventLogRemoteServer requires a TCP address to build a WebSocket URL."
    })
  }
  const hostname = options?.hostname ?? address.hostname
  const parsedHostname = (() => {
    if (!hostname.includes("://")) return { hostname }
    try {
      const parsed = new URL(hostname)
      const scheme =
        parsed.protocol === "https:"
          ? "wss"
          : parsed.protocol === "http:"
          ? "ws"
          : undefined
      return {
        hostname: parsed.hostname,
        scheme,
        port: parsed.port ? Number(parsed.port) : undefined
      }
    } catch {
      return { hostname }
    }
  })()
  const resolvedHostname = parsedHostname.hostname === "0.0.0.0"
    ? "127.0.0.1"
    : parsedHostname.hostname === "::"
    ? "::1"
    : parsedHostname.hostname
  const formattedHostname =
    resolvedHostname.includes(":") && !resolvedHostname.startsWith("[")
      ? `[${resolvedHostname}]`
      : resolvedHostname
  const rawPath = options?.path ?? "/event-log"
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`
  const scheme = options?.scheme ?? parsedHostname.scheme ?? "ws"
  const port = parsedHostname.port ?? address.port
  return `${scheme}://${formattedHostname}:${port}${path}`
}

const toWebSocketUrlError = (cause: unknown) =>
  cause instanceof EventLogRemoteServerError
    ? cause
    : EventLogRemoteServerError.make({
        message: cause instanceof Error ? cause.message : "Failed to build WebSocket URL.",
        cause
      })


export const toWebSocketUrlEffect = (
  address: HttpServer.Address,
  options?: {
    readonly path?: string
    readonly hostname?: string
    readonly scheme?: "ws" | "wss"
  }
) =>
  Effect.try({
    try: () => toWebSocketUrl(address, options),
    catch: toWebSocketUrlError
  })

const basePort = 20000 + (process.pid % 10000)
let nextPort = basePort

const findAvailablePort = () =>
  Effect.sync(() => {
    const port = nextPort
    nextPort += 1
    if (nextPort > 65535) {
      nextPort = basePort
    }
    return port
  })

export class EventLogRemoteServer extends Context.Tag("@effect/claude-agent-sdk/EventLogRemoteServer")<
  EventLogRemoteServer,
  { readonly address: HttpServer.Address; readonly url: string }
>() {}

const buildBunWebSocketLayerWithServer = (
  options: EventLogRemoteServerOptions,
  httpServerLayer: Layer.Layer<HttpServer.HttpServer, unknown>
) => {
  const path = (options.path ?? "/event-log") as HttpRouter.PathInput
  const storageLayer = options.storage ?? EventLogServer.layerStorageMemory

  const handler = Effect.flatten(EventLogServer.makeHandlerHttp)
  const route = HttpRouter.makeRoute("GET", path, handler)
  const router = HttpRouter.empty.pipe(HttpRouter.append(route))
  const serveLayer = Layer.unwrapEffect(
    Effect.map(HttpRouter.toHttpApp(router), (app) => HttpServer.serve(app))
  )

  const serviceLayer = Layer.effect(
    EventLogRemoteServer,
    Effect.gen(function*() {
      const server = yield* HttpServer.HttpServer
      const url = yield* toWebSocketUrlEffect(server.address, {
        path,
        ...(options.hostname !== undefined ? { hostname: options.hostname } : {}),
        ...(options.scheme !== undefined ? { scheme: options.scheme } : {})
      })
      return EventLogRemoteServer.of({
        address: server.address,
        url
      })
    })
  )

  return Layer.merge(serveLayer, serviceLayer).pipe(
    Layer.provide(storageLayer),
    Layer.provide(httpServerLayer)
  )
}

const buildBunWebSocketLayer = (
  options: EventLogRemoteServerOptions,
  port: number
) =>
  buildBunWebSocketLayerWithServer(
    options,
    BunHttpServer.layer({ port, hostname: options.hostname })
  )

export const layerBunWebSocket = (options: EventLogRemoteServerOptions = {}) =>
  buildBunWebSocketLayer(options, options.port ?? 8787)

export const layerBunWebSocketTest = (options: EventLogRemoteServerOptions = {}) =>
  Layer.unwrapEffect(
    Effect.gen(function*() {
      const makeTestServer = Effect.gen(function*() {
        const maxAttempts = options.port ? 1 : 20
        let lastError: unknown = undefined
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const port = options.port ?? (yield* findAvailablePort())
          const exit = yield* Effect.exit(
            BunHttpServer.make({ port, hostname: options.hostname })
          )
          if (Exit.isSuccess(exit)) return exit.value
          lastError = Cause.squash(exit.cause)
        }
        return yield* toWebSocketUrlError(
          lastError ?? new Error("Failed to start test server.")
        )
      })
      const httpServerLayer = Layer.scoped(HttpServer.HttpServer, makeTestServer).pipe(
        Layer.provide(BunHttpServer.layerContext)
      )
      return buildBunWebSocketLayerWithServer(options, httpServerLayer)
    })
  )
