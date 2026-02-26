import { HttpApiBuilder, HttpServerResponse } from "@effect/platform"
import * as Cause from "effect/Cause"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import { AgentRuntime } from "../AgentRuntime.js"
import type { AgentSdkError } from "../Errors.js"
import { collectResultSuccess } from "../QueryResult.js"
import type { QueryHandle } from "../Query.js"
import type { SDKUserMessage } from "../Schema/Message.js"
import { QueryInput, type QueryInput as QueryInputType } from "../Schema/Service.js"
import type { QuerySupervisorError } from "../QuerySupervisor.js"
import { SessionPool } from "../SessionPool.js"
import { AgentHttpApi } from "./AgentHttpApi.js"
import { SessionPoolUnavailableError } from "./SessionErrors.js"
import { resolveRequestTenant } from "./TenantAccess.js"

type SessionPoolService = Context.Tag.Service<typeof SessionPool>

const textEncoder = new TextEncoder()

const toSseChunk = (data: unknown, event?: string) => {
  const payload = JSON.stringify(data)
  const eventLine = event ? `event: ${event}\n` : ""
  return textEncoder.encode(`${eventLine}data: ${payload}\n\n`)
}

const toSseStream = <E>(stream: Stream.Stream<unknown, E>) =>
  stream.pipe(
    Stream.map((message) => toSseChunk(message)),
    Stream.catchAllCause((cause) =>
      Stream.fromIterable([
        toSseChunk({ error: Cause.pretty(cause) }, "error")
      ])
    )
  )

const toAsyncIterable = (messages: ReadonlyArray<SDKUserMessage>): AsyncIterable<SDKUserMessage> => ({
  async *[Symbol.asyncIterator]() {
    for (const message of messages) {
      yield message
    }
  }
})

const toPrompt = (input: QueryInputType): string | AsyncIterable<SDKUserMessage> =>
  typeof input.prompt === "string"
    ? input.prompt
    : toAsyncIterable(input.prompt)

const withProbeHandle = <A>(
  runtime: AgentRuntime,
  use: (handle: QueryHandle) => Effect.Effect<A, AgentSdkError, never>
): Effect.Effect<A, AgentSdkError | QuerySupervisorError, never> =>
  Effect.scoped(
    Effect.acquireUseRelease(
      runtime.queryRaw(" ", {}),
      use,
      (handle) =>
        Effect.all([handle.closeInput, handle.interrupt], {
          concurrency: "unbounded",
          discard: true
        }).pipe(Effect.ignore)
    )
  )

export const layer = HttpApiBuilder.group(AgentHttpApi, "agent", (handlers) =>
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime
    const poolOption = yield* Effect.serviceOption(SessionPool)

    const requirePool = <A, E, R>(
      use: (pool: SessionPoolService) => Effect.Effect<A, E, R>
    ): Effect.Effect<A, E | SessionPoolUnavailableError, R> =>
      Option.isSome(poolOption)
        ? use(poolOption.value)
        : Effect.fail(
            SessionPoolUnavailableError.make({
              message: "SessionPool is not configured for this server"
            })
          )

    return handlers
      .handle("query", ({ payload }) =>
        collectResultSuccess(runtime.stream(toPrompt(payload), payload.options)).pipe(
          Effect.scoped,
          Effect.map((result) => ({
            result: result.result,
            metadata: result
          }))
        ))
      .handleRaw("stream", ({ urlParams }) =>
        Effect.succeed(
          HttpServerResponse.stream(
            toSseStream(runtime.stream(urlParams.prompt)),
            {
              headers: {
                "content-type": "text/event-stream",
                "cache-control": "no-cache",
                connection: "keep-alive"
              }
            }
          )
        ))
      .handleRaw("streamPost", ({ request }) =>
        request.json.pipe(
          Effect.flatMap((payload) =>
            Schema.decodeUnknown(QueryInput)(payload).pipe(
              Effect.map((decoded) =>
                HttpServerResponse.stream(
                  toSseStream(runtime.stream(toPrompt(decoded), decoded.options)),
                  {
                    headers: {
                      "content-type": "text/event-stream",
                      "cache-control": "no-cache",
                      connection: "keep-alive"
                    }
                  }
                )
              )
            )
          ),
          Effect.catchAll(() =>
            Effect.succeed(
              HttpServerResponse.text("Invalid request payload.", { status: 400 })
            )
          )
        ))
      .handle("stats", () => runtime.stats)
      .handle("interruptAll", () => runtime.interruptAll)
      .handle("models", () => withProbeHandle(runtime, (handle) => handle.supportedModels))
      .handle("commands", () => withProbeHandle(runtime, (handle) => handle.supportedCommands))
      .handle("account", () => withProbeHandle(runtime, (handle) => handle.accountInfo))
      .handle("createSession", ({ payload }) =>
        requirePool((pool) =>
          resolveRequestTenant(payload.tenant).pipe(
            Effect.flatMap((tenant) =>
              pool.create(payload.options, tenant).pipe(
                Effect.flatMap((handle) => handle.sessionId),
                Effect.map((sessionId) => ({ sessionId }))
              ))
          )
        ))
      .handle("listSessions", ({ urlParams }) =>
        requirePool((pool) =>
          resolveRequestTenant(urlParams.tenant).pipe(
            Effect.flatMap((tenant) => pool.listByTenant(tenant))
          )
        )
      )
      .handle("getSession", ({ urlParams }) =>
        requirePool((pool) =>
          resolveRequestTenant(urlParams.tenant).pipe(
            Effect.flatMap((tenant) =>
              pool.get(urlParams.id, undefined, tenant).pipe(
                Effect.zipRight(pool.info(urlParams.id, tenant))
              ))
          )
        ))
      .handle("sendSession", ({ urlParams, payload }) =>
        requirePool((pool) =>
          resolveRequestTenant(payload.tenant).pipe(
            Effect.flatMap((tenant) =>
              pool.get(urlParams.id, undefined, tenant).pipe(
                Effect.flatMap((handle) => handle.send(payload.message)),
                Effect.asVoid
              ))
          )
        ))
      .handleRaw("streamSession", ({ urlParams }) =>
        requirePool((pool) =>
          resolveRequestTenant(urlParams.tenant).pipe(
            Effect.flatMap((tenant) =>
              pool.get(urlParams.id, undefined, tenant).pipe(
                Effect.map((handle) =>
                  HttpServerResponse.stream(
                    toSseStream(handle.stream),
                    {
                      headers: {
                        "content-type": "text/event-stream",
                        "cache-control": "no-cache",
                        connection: "keep-alive"
                      }
                    }
                  )
                )
              ))
          )
        ))
      .handle("closeSession", ({ urlParams }) =>
        requirePool((pool) =>
          resolveRequestTenant(urlParams.tenant).pipe(
            Effect.flatMap((tenant) => pool.close(urlParams.id, tenant).pipe(Effect.asVoid))
          )
        )
      )
  })
)
