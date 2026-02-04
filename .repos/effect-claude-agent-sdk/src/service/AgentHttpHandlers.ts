import { HttpApiBuilder } from "@effect/platform"
import * as Effect from "effect/Effect"
import { AgentRuntime } from "../AgentRuntime.js"
import type { AgentSdkError } from "../Errors.js"
import { collectResultSuccess } from "../QueryResult.js"
import type { QueryHandle } from "../Query.js"
import type { SDKUserMessage } from "../Schema/Message.js"
import type { QueryInput as QueryInputType } from "../Schema/Service.js"
import type { QuerySupervisorError } from "../QuerySupervisor.js"
import { AgentHttpApi } from "./AgentHttpApi.js"

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
  runtime: AgentRuntime["Type"],
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

    return handlers
      .handle("query", ({ payload }) =>
        collectResultSuccess(runtime.stream(toPrompt(payload), payload.options)).pipe(
          Effect.scoped,
          Effect.map((result) => ({
            result: result.result,
            metadata: result
          }))
        ))
      .handle("stats", () => runtime.stats)
      .handle("interruptAll", () => runtime.interruptAll)
      .handle("models", () => withProbeHandle(runtime, (handle) => handle.supportedModels))
      .handle("commands", () => withProbeHandle(runtime, (handle) => handle.supportedCommands))
      .handle("account", () => withProbeHandle(runtime, (handle) => handle.accountInfo))
  })
)
