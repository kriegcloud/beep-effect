import { $AiSdkId } from "@beep/identity/packages";
import { BunHttpServer } from "@effect/platform-bun";
import { Cause, Effect, Exit, Layer, ServiceMap } from "effect";
import * as S from "effect/Schema";
import * as EventLogServer from "effect/unstable/eventlog/EventLogServer";
import * as HttpServer from "effect/unstable/http/HttpServer";

const $I = $AiSdkId.create("core/Sync/EventLogRemoteServer");

/**
 * @since 0.0.0
 */
export type EventLogRemoteServerOptions = {
  readonly port?: number;
  readonly hostname?: string;
  readonly path?: string;
  readonly scheme?: "ws" | "wss";
  readonly storage?: Layer.Layer<EventLogServer.Storage>;
};

/**
 * @since 0.0.0
 */
export class EventLogRemoteServerError extends S.TaggedErrorClass<EventLogRemoteServerError>(
  $I`EventLogRemoteServerError`
)(
  "EventLogRemoteServerError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("EventLogRemoteServerError", {
    description: "Raised when the EventLogRemoteServer cannot derive or bind a valid websocket endpoint.",
  })
) {
  static readonly make = (params: { readonly message: string; readonly cause?: unknown }) =>
    new EventLogRemoteServerError(params);
}

/**
 * Build a WebSocket URL from a bound server address.
 * Throws if the address is not a TCP address.
 *
 * @deprecated Prefer `toWebSocketUrlEffect`.
 */
/**
 * @since 0.0.0
 */
export const toWebSocketUrl = (
  address: HttpServer.Address,
  options?: {
    readonly path?: string;
    readonly hostname?: string;
    readonly scheme?: "ws" | "wss";
  }
) => {
  if (address._tag !== "TcpAddress") {
    throw EventLogRemoteServerError.make({
      message: "EventLogRemoteServer requires a TCP address to build a WebSocket URL.",
    });
  }
  const hostname = options?.hostname ?? address.hostname;
  const parsedHostname = (() => {
    if (!hostname.includes("://")) return { hostname };
    try {
      const parsed = new URL(hostname);
      const scheme = parsed.protocol === "https:" ? "wss" : parsed.protocol === "http:" ? "ws" : undefined;
      return {
        hostname: parsed.hostname,
        scheme,
        port: parsed.port ? Number(parsed.port) : undefined,
      };
    } catch {
      return { hostname };
    }
  })();
  const resolvedHostname =
    parsedHostname.hostname === "0.0.0.0"
      ? "127.0.0.1"
      : parsedHostname.hostname === "::"
        ? "::1"
        : parsedHostname.hostname;
  const formattedHostname =
    resolvedHostname.includes(":") && !resolvedHostname.startsWith("[") ? `[${resolvedHostname}]` : resolvedHostname;
  const rawPath = options?.path ?? "/event-log";
  const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const scheme = options?.scheme ?? parsedHostname.scheme ?? "ws";
  const port = parsedHostname.port ?? address.port;
  return `${scheme}://${formattedHostname}:${port}${path}`;
};

const toWebSocketUrlError = (cause: unknown) =>
  cause instanceof EventLogRemoteServerError
    ? cause
    : EventLogRemoteServerError.make({
        message: cause instanceof Error ? cause.message : "Failed to build WebSocket URL.",
        cause,
      });

/**
 * @since 0.0.0
 */
export const toWebSocketUrlEffect = (
  address: HttpServer.Address,
  options?: {
    readonly path?: string;
    readonly hostname?: string;
    readonly scheme?: "ws" | "wss";
  }
) =>
  Effect.try({
    try: () => toWebSocketUrl(address, options),
    catch: toWebSocketUrlError,
  });

/**
 * @since 0.0.0
 */
export interface EventLogRemoteServerShape {
  readonly address: HttpServer.Address;
  readonly url: string;
}

const basePort = 20000 + (process.pid % 10000);
let nextPort = basePort;

const findAvailablePort = () =>
  Effect.sync(() => {
    const port = nextPort;
    nextPort += 1;
    if (nextPort > 65535) {
      nextPort = basePort;
    }
    return port;
  });

/**
 * @since 0.0.0
 */
export class EventLogRemoteServer extends ServiceMap.Service<EventLogRemoteServer, EventLogRemoteServerShape>()(
  $I`EventLogRemoteServer`
) {}

const buildBunWebSocketLayerWithServer = (
  options: EventLogRemoteServerOptions,
  httpServerLayer: Layer.Layer<HttpServer.HttpServer, unknown>
) => {
  const path = options.path ?? "/event-log";
  const storageLayer = options.storage ?? EventLogServer.layerStorageMemory;

  const serveLayer = Layer.unwrap(Effect.map(EventLogServer.makeHandlerHttp, (handler) => HttpServer.serve(handler)));

  const serviceLayer = Layer.effect(
    EventLogRemoteServer,
    Effect.gen(function* () {
      const server = yield* HttpServer.HttpServer;
      const url = yield* toWebSocketUrlEffect(server.address, {
        path,
        ...(options.hostname !== undefined ? { hostname: options.hostname } : {}),
        ...(options.scheme !== undefined ? { scheme: options.scheme } : {}),
      });
      return EventLogRemoteServer.of({
        address: server.address,
        url,
      });
    })
  );

  return Layer.merge(serveLayer, serviceLayer).pipe(Layer.provide(storageLayer), Layer.provide(httpServerLayer));
};

const buildBunWebSocketLayer = (options: EventLogRemoteServerOptions, port: number) =>
  buildBunWebSocketLayerWithServer(
    options,
    BunHttpServer.layer({
      port,
      ...(options.hostname !== undefined ? { hostname: options.hostname } : {}),
    })
  );

/**
 * @since 0.0.0
 */
export const layerBunWebSocket = (options: EventLogRemoteServerOptions = {}) =>
  buildBunWebSocketLayer(options, options.port ?? 8787);

/**
 * @since 0.0.0
 */
export const layerBunWebSocketTest = (options: EventLogRemoteServerOptions = {}) =>
  Layer.unwrap(
    Effect.gen(function* () {
      yield* Effect.void;
      const makeTestServer = Effect.gen(function* () {
        const maxAttempts = options.port ? 1 : 20;
        let lastError: unknown = undefined;
        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const port = options.port ?? (yield* findAvailablePort());
          const exit = yield* Effect.exit(
            BunHttpServer.make({
              port,
              ...(options.hostname !== undefined ? { hostname: options.hostname } : {}),
            })
          );
          if (Exit.isSuccess(exit)) return exit.value;
          lastError = Cause.squash(exit.cause);
        }
        return yield* toWebSocketUrlError(lastError ?? new Error("Failed to start test server."));
      });
      const httpServerLayer = Layer.effect(HttpServer.HttpServer, makeTestServer);
      return buildBunWebSocketLayerWithServer(options, httpServerLayer);
    })
  );
