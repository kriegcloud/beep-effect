import * as Effect from "effect/Effect"
import { AgentRuntime } from "../AgentRuntime.js"
import { collectResultSuccess } from "../QueryResult.js"
import type { QueryHandle } from "../Query.js"
import type { AgentSdkError } from "../Errors.js"
import type { SDKUserMessage } from "../Schema/Message.js"
import type { QueryInput as QueryInputType } from "../Schema/Service.js"
import type { QuerySupervisorError } from "../QuerySupervisor.js"
import { AgentRpcs } from "./AgentRpcs.js"

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

const toStream = (runtime: AgentRuntime["Type"], input: QueryInputType) =>
  runtime.stream(toPrompt(input), input.options)

// Metadata calls require an active query handle; use a minimal probe query.
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

export const layer = AgentRpcs.toLayer(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime

    const QueryStream = (input: QueryInputType) =>
      toStream(runtime, input)

    const QueryResult = (input: QueryInputType) =>
      collectResultSuccess(toStream(runtime, input)).pipe(
        Effect.scoped,
        Effect.map((result) => ({
          result: result.result,
          metadata: result
        }))
      )

    const Stats = () => runtime.stats
    const InterruptAll = () => runtime.interruptAll
    const SupportedModels = () =>
      withProbeHandle(runtime, (handle) => handle.supportedModels)
    const SupportedCommands = () =>
      withProbeHandle(runtime, (handle) => handle.supportedCommands)
    const AccountInfo = () =>
      withProbeHandle(runtime, (handle) => handle.accountInfo)

    return {
      QueryStream,
      QueryResult,
      Stats,
      InterruptAll,
      SupportedModels,
      SupportedCommands,
      AccountInfo
    }
  })
)
