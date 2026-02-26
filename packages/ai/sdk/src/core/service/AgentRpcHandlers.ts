import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import { AgentRuntime } from "../AgentRuntime.js"
import { collectResultSuccess } from "../QueryResult.js"
import type { QueryHandle } from "../Query.js"
import type { AgentSdkError } from "../Errors.js"
import type { SDKUserMessage } from "../Schema/Message.js"
import type {
  QueryInput as QueryInputType,
  SessionCreateInput as SessionCreateInputType,
  SessionSendInput as SessionSendInputType
} from "../Schema/Service.js"
import type { QuerySupervisorError } from "../QuerySupervisor.js"
import { SessionPool } from "../SessionPool.js"
import { AgentRpcs } from "./AgentRpcs.js"
import { SessionPoolUnavailableError } from "./SessionErrors.js"
import { resolveRequestTenant } from "./TenantAccess.js"

type SessionPoolService = Context.Tag.Service<typeof SessionPool>
type TenantScopedInput = { readonly tenant?: string | undefined }
type ResumeSessionInput = TenantScopedInput & {
  readonly sessionId: string
  readonly options: SessionCreateInputType["options"]
}
type SendSessionInput = TenantScopedInput & {
  readonly sessionId: string
  readonly message: SessionSendInputType["message"]
}
type SessionRefInput = TenantScopedInput & { readonly sessionId: string }

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

const toStream = (runtime: AgentRuntime, input: QueryInputType) =>
  runtime.stream(toPrompt(input), input.options)

// Metadata calls require an active query handle; use a minimal probe query.
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

export const layer = AgentRpcs.toLayer(
  Effect.gen(function*() {
    const runtime = yield* AgentRuntime
    const poolOption = yield* (Effect.serviceOption(SessionPool) as Effect.Effect<
      Option.Option<SessionPoolService>
    >)

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

    const CreateSession = (input: SessionCreateInputType) =>
      requirePool((pool) =>
        resolveRequestTenant(input.tenant).pipe(
          Effect.flatMap((tenant) =>
            pool.create(input.options, tenant).pipe(
              Effect.flatMap((handle) => handle.sessionId),
              Effect.map((sessionId) => ({ sessionId }))
            ))
        )
      )

    const ResumeSession = (input: ResumeSessionInput) =>
      requirePool((pool) =>
        resolveRequestTenant(input.tenant).pipe(
          Effect.flatMap((tenant) =>
            pool.get(input.sessionId, input.options, tenant).pipe(
              Effect.flatMap((handle) => handle.sessionId),
              Effect.map((sessionId) => ({ sessionId }))
            ))
        )
      )

    const SendSession = (input: SendSessionInput) =>
      requirePool((pool) =>
        resolveRequestTenant(input.tenant).pipe(
          Effect.flatMap((tenant) =>
            pool.get(input.sessionId, undefined, tenant).pipe(
              Effect.flatMap((handle) => handle.send(input.message)),
              Effect.asVoid
            ))
        )
      )

    const SessionStream = (input: SessionRefInput) =>
      Stream.unwrap(
        requirePool((pool) =>
          resolveRequestTenant(input.tenant).pipe(
            Effect.flatMap((tenant) =>
              pool.get(input.sessionId, undefined, tenant).pipe(
                Effect.map((handle) => handle.stream)
              ))
          )
        )
      )

    const CloseSession = (input: SessionRefInput) =>
      requirePool((pool) =>
        resolveRequestTenant(input.tenant).pipe(
          Effect.flatMap((tenant) => pool.close(input.sessionId, tenant).pipe(Effect.asVoid))
        )
      )

    const ListSessions = () =>
      requirePool((pool) => pool.list)

    const ListSessionsByTenant = (input: TenantScopedInput) =>
      requirePool((pool) =>
        resolveRequestTenant(input.tenant).pipe(
          Effect.flatMap((tenant) => pool.listByTenant(tenant))
        )
      )

    return {
      QueryStream,
      QueryResult,
      Stats,
      InterruptAll,
      SupportedModels,
      SupportedCommands,
      AccountInfo,
      CreateSession,
      ResumeSession,
      SendSession,
      SessionStream,
      CloseSession,
      ListSessionsByTenant,
      ListSessions
    }
  })
)
