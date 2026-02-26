import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as ServiceMap from "effect/ServiceMap"
import * as Stream from "effect/Stream"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { AgentRuntime } from "../AgentRuntime.js"
import type { AgentSdkError } from "../Errors.js"
import type { QueryHandle } from "../Query.js"
import { collectResultSuccess } from "../QueryResult.js"
import type { QuerySupervisorError } from "../QuerySupervisor.js"
import type { SDKUserMessage } from "../Schema/Message.js"
import type { QueryInput as QueryInputType } from "../Schema/Service.js"
import { SessionPool } from "../SessionPool.js"
import { AgentHttpApi } from "./AgentHttpApi.js"
import { SessionPoolUnavailableError } from "./SessionErrors.js"
import { resolveRequestTenant } from "./TenantAccess.js"

type AgentRuntimeService = ServiceMap.Service.Shape<typeof AgentRuntime>
type SessionPoolService = ServiceMap.Service.Shape<typeof SessionPool>

const textEncoder = new TextEncoder()

const toSseChunk = (data: unknown, event?: string) => {
  const payload = JSON.stringify(data)
  const eventLine = event ? `event: ${event}\n` : ""
  return textEncoder.encode(`${eventLine}data: ${payload}\n\n`)
}

const toSseStream = <E>(stream: Stream.Stream<unknown, E>) =>
  stream.pipe(
    Stream.map((message) => toSseChunk(message)),
    Stream.catchCause((cause) =>
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
  runtime: AgentRuntimeService,
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

const sseHeaders = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache",
  connection: "keep-alive"
}

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
      .handle("stream", ({ query }) =>
        Effect.succeed(
          HttpServerResponse.stream(
            toSseStream(runtime.stream(query.prompt)),
            { headers: sseHeaders }
          )
        ))
      .handle("streamPost", ({ payload }) =>
        Effect.succeed(
          HttpServerResponse.stream(
            toSseStream(runtime.stream(toPrompt(payload), payload.options)),
            { headers: sseHeaders }
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
      .handle("listSessions", ({ query }) =>
        requirePool((pool) =>
          resolveRequestTenant(query.tenant).pipe(
            Effect.flatMap((tenant) => pool.listByTenant(tenant))
          )
        )
      )
      .handle("getSession", ({ params, query }) =>
        requirePool((pool) =>
          resolveRequestTenant(query.tenant).pipe(
            Effect.flatMap((tenant) =>
              pool.get(params.id, undefined, tenant).pipe(
                Effect.andThen(pool.info(params.id, tenant))
              ))
          )
        ))
      .handle("sendSession", ({ params, payload }) =>
        requirePool((pool) =>
          resolveRequestTenant(payload.tenant).pipe(
            Effect.flatMap((tenant) =>
              pool.get(params.id, undefined, tenant).pipe(
                Effect.flatMap((handle) => handle.send(payload.message)),
                Effect.asVoid
              ))
          )
        ))
      .handle("streamSession", ({ params, query }) =>
        requirePool((pool) =>
          resolveRequestTenant(query.tenant).pipe(
            Effect.flatMap((tenant) =>
              pool.get(params.id, undefined, tenant).pipe(
                Effect.map((handle) =>
                  HttpServerResponse.stream(
                    toSseStream(handle.stream),
                    { headers: sseHeaders }
                  )
                )
              ))
          )
        ))
      .handle("closeSession", ({ params, query }) =>
        requirePool((pool) =>
          resolveRequestTenant(query.tenant).pipe(
            Effect.flatMap((tenant) => pool.close(params.id, tenant).pipe(Effect.asVoid))
          )
        )
      )
  })
)
