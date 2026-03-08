import { TokenBudgetExceeded } from "@template/domain/errors"
import type { AgentId } from "@template/domain/ids"
import type { AgentState, AgentStatePort, Instant } from "@template/domain/ports"
import { DateTime, Effect, HashMap, Layer, Option, Ref, ServiceMap } from "effect"

export class AgentStatePortMemory extends ServiceMap.Service<AgentStatePortMemory>()(
  "server/AgentStatePortMemory",
  {
    make: Effect.gen(function*() {
      const states = yield* Ref.make(HashMap.empty<AgentId, AgentState>())

      const get: AgentStatePort["get"] = (agentId) =>
        Ref.get(states).pipe(
          Effect.map((map) => Option.getOrNull(HashMap.get(map, agentId)))
        )

      const upsert: AgentStatePort["upsert"] = (agentState) =>
        Ref.update(states, HashMap.set(agentState.agentId, agentState))

      const consumeTokenBudget: AgentStatePort["consumeTokenBudget"] = (agentId, requestedTokens, now) =>
        Ref.get(states).pipe(
          Effect.flatMap((map) => {
            const existing = HashMap.get(map, agentId)
            if (Option.isNone(existing)) {
              return Effect.fail(
                new TokenBudgetExceeded({
                  agentId,
                  requestedTokens,
                  remainingTokens: 0
                })
              )
            }

            const normalized = normalizeBudgetWindow(existing.value, now)
            const remainingTokens = Math.max(normalized.tokenBudget - normalized.tokensConsumed, 0)
            if (requestedTokens > remainingTokens) {
              return Effect.fail(
                new TokenBudgetExceeded({
                  agentId,
                  requestedTokens,
                  remainingTokens
                })
              )
            }

            const updated: AgentState = {
              ...normalized,
              tokensConsumed: normalized.tokensConsumed + requestedTokens
            }
            const next = HashMap.set(map, agentId, updated)
            return Ref.set(states, next)
          })
        )

      return {
        get,
        upsert,
        consumeTokenBudget
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const normalizeBudgetWindow = (state: AgentState, now: Instant): AgentState => {
  if (state.quotaPeriod === "Lifetime") {
    return state
  }
  if (state.budgetResetAt === null) {
    return {
      ...state,
      budgetResetAt: nextBudgetReset(now, state.quotaPeriod)
    }
  }
  if (DateTime.toEpochMillis(now) < DateTime.toEpochMillis(state.budgetResetAt)) {
    return state
  }
  return {
    ...state,
    tokensConsumed: 0,
    budgetResetAt: nextBudgetReset(now, state.quotaPeriod)
  }
}

const nextBudgetReset = (from: Instant, period: AgentState["quotaPeriod"]): Instant | null => {
  switch (period) {
    case "Daily": {
      return DateTime.add(from, { days: 1 })
    }
    case "Monthly": {
      return DateTime.add(from, { months: 1 })
    }
    case "Yearly": {
      return DateTime.add(from, { years: 1 })
    }
    case "Lifetime": {
      return null
    }
  }
}
