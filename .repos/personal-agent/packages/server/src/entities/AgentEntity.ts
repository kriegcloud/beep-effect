import { TokenBudgetExceeded } from "@template/domain/errors"
import type { AgentId } from "@template/domain/ids"
import { Effect, Schema } from "effect"
import { ClusterSchema, Entity } from "effect/unstable/cluster"
import { Rpc } from "effect/unstable/rpc"
import { AgentStatePortTag } from "../PortTags.js"

const AgentStateFields = {
  agentId: Schema.String,
  permissionMode: Schema.Literals(["Permissive", "Standard", "Restrictive"]),
  tokenBudget: Schema.Number,
  maxToolIterations: Schema.Number,
  quotaPeriod: Schema.Literals(["Daily", "Monthly", "Yearly", "Lifetime"]),
  tokensConsumed: Schema.Number,
  budgetResetAt: Schema.Union([Schema.DateTimeUtc, Schema.Null])
} as const

const AgentStateSchema = Schema.Struct(AgentStateFields)
const AgentStateOrNull = Schema.Union([AgentStateSchema, Schema.Null])

const GetStateRpc = Rpc.make("getState", {
  payload: { agentId: Schema.String },
  success: AgentStateOrNull
})

const UpsertStateRpc = Rpc.make("upsertState", {
  payload: AgentStateFields,
  success: Schema.Void,
  primaryKey: ({ agentId }) => `upsert:${agentId}`
}).annotate(ClusterSchema.Persisted, true)

const ConsumeTokenBudgetRpc = Rpc.make("consumeTokenBudget", {
  payload: {
    agentId: Schema.String,
    requestedTokens: Schema.Number,
    now: Schema.DateTimeUtc
  },
  success: Schema.Void,
  error: TokenBudgetExceeded,
  primaryKey: ({ agentId }) => `budget:${agentId}`
}).annotate(ClusterSchema.Persisted, true)

export const AgentEntity = Entity.make("Agent", [
  GetStateRpc,
  UpsertStateRpc,
  ConsumeTokenBudgetRpc
])

export const layer = AgentEntity.toLayer(Effect.gen(function*() {
  const port = yield* AgentStatePortTag

  return {
    getState: ({ address }) => {
      const agentId = String(address.entityId) as AgentId
      return port.get(agentId).pipe(
        Effect.withSpan("AgentEntity.getState"),
        Effect.annotateLogs({ module: "AgentEntity", entityId: address.entityId })
      )
    },

    upsertState: ({ address, payload }) => {
      const agentId = String(address.entityId) as AgentId
      return port.upsert({
        ...payload,
        agentId
      }).pipe(
        Effect.withSpan("AgentEntity.upsertState"),
        Effect.annotateLogs({ module: "AgentEntity", entityId: address.entityId })
      )
    },

    consumeTokenBudget: ({ address, payload }) => {
      const agentId = String(address.entityId) as AgentId
      return port.consumeTokenBudget(
        agentId,
        payload.requestedTokens,
        payload.now
      ).pipe(
        Effect.withSpan("AgentEntity.consumeTokenBudget"),
        Effect.annotateLogs({ module: "AgentEntity", entityId: address.entityId })
      )
    }
  }
}))
