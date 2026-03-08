import { DateTime, Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import { TokenBudgetExceeded } from "../../domain/src/errors.js"
import type { AgentId } from "../../domain/src/ids.js"
import type { AgentState, AgentStatePort, Instant } from "../../domain/src/ports.js"
import { PermissionMode, QuotaPeriod } from "../../domain/src/status.js"

const AgentStateRowSchema = Schema.Struct({
  agent_id: Schema.String,
  permission_mode: PermissionMode,
  token_budget: Schema.Number,
  max_tool_iterations: Schema.Number,
  quota_period: QuotaPeriod,
  tokens_consumed: Schema.Number,
  budget_reset_at: Schema.Union([Schema.String, Schema.Null])
})
type AgentStateRow = typeof AgentStateRowSchema.Type

const AgentIdRequest = Schema.Struct({ agentId: Schema.String })
const EmptyRequest = Schema.Struct({})
import { sqlInstantNullable } from "./persistence/SqlCodecs.js"

export class AgentStatePortSqlite extends ServiceMap.Service<AgentStatePortSqlite>()(
  "server/AgentStatePortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const findAgentStateById = SqlSchema.findOneOption({
        Request: AgentIdRequest,
        Result: AgentStateRowSchema,
        execute: ({ agentId }) =>
          sql`
            SELECT
              agent_id,
              permission_mode,
              token_budget,
              max_tool_iterations,
              quota_period,
              tokens_consumed,
              budget_reset_at
            FROM agents
            WHERE agent_id = ${agentId}
            LIMIT 1
          `.withoutTransform
      })

      const findAllAgentStates = SqlSchema.findAll({
        Request: EmptyRequest,
        Result: AgentStateRowSchema,
        execute: () =>
          sql`
            SELECT
              agent_id,
              permission_mode,
              token_budget,
              max_tool_iterations,
              quota_period,
              tokens_consumed,
              budget_reset_at
            FROM agents
            ORDER BY agent_id ASC
          `.withoutTransform
      })

      const readAgentState = (agentId: AgentId) =>
        findAgentStateById({ agentId }).pipe(
          Effect.map(
            Option.match({
              onNone: () => null,
              onSome: decodeAgentStateRow
            })
          ),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const get: AgentStatePort["get"] = (agentId) =>
        readAgentState(agentId).pipe(
          Effect.map((state) => state === null ? null : state),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const upsert: AgentStatePort["upsert"] = (agentState) =>
        sql`
          INSERT INTO agents (
            agent_id,
            permission_mode,
            token_budget,
            max_tool_iterations,
            quota_period,
            tokens_consumed,
            budget_reset_at,
            updated_at
          ) VALUES (
            ${agentState.agentId},
            ${agentState.permissionMode},
            ${agentState.tokenBudget},
            ${agentState.maxToolIterations},
            ${agentState.quotaPeriod},
            ${agentState.tokensConsumed},
            ${sqlInstantNullable.encode(agentState.budgetResetAt)},
            CURRENT_TIMESTAMP
          )
          ON CONFLICT(agent_id) DO UPDATE SET
            permission_mode = excluded.permission_mode,
            token_budget = excluded.token_budget,
            max_tool_iterations = excluded.max_tool_iterations,
            quota_period = excluded.quota_period,
            tokens_consumed = excluded.tokens_consumed,
            budget_reset_at = excluded.budget_reset_at,
            updated_at = CURRENT_TIMESTAMP
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      const consumeTokenBudget: AgentStatePort["consumeTokenBudget"] = (agentId, requestedTokens, now) =>
        sql.withTransaction(
          Effect.gen(function*() {
            const existing = yield* readAgentState(agentId)
            if (existing === null) {
              return yield* new TokenBudgetExceeded({
                agentId,
                requestedTokens,
                remainingTokens: 0
              })
            }

            const normalized = normalizeBudgetWindow(existing, now)
            const remainingTokens = Math.max(
              normalized.tokenBudget - normalized.tokensConsumed,
              0
            )
            if (requestedTokens > remainingTokens) {
              return yield* new TokenBudgetExceeded({
                agentId,
                requestedTokens,
                remainingTokens
              })
            }

            const updated: AgentState = {
              ...normalized,
              tokensConsumed: normalized.tokensConsumed + requestedTokens
            }

            yield* sql`
              UPDATE agents
              SET
                permission_mode = ${updated.permissionMode},
                token_budget = ${updated.tokenBudget},
                max_tool_iterations = ${updated.maxToolIterations},
                quota_period = ${updated.quotaPeriod},
                tokens_consumed = ${updated.tokensConsumed},
                budget_reset_at = ${sqlInstantNullable.encode(updated.budgetResetAt)},
                updated_at = CURRENT_TIMESTAMP
              WHERE agent_id = ${updated.agentId}
            `.unprepared
          })
        ).pipe(
          Effect.asVoid,
          Effect.catch((error: unknown) =>
            error instanceof TokenBudgetExceeded
              ? Effect.fail(error)
              : Effect.die(error)
          )
        )

      const listAgentStates = () =>
        findAllAgentStates({}).pipe(
          Effect.map((rows) => rows.map(decodeAgentStateRow)),
          Effect.tapDefect(Effect.logError),
          Effect.orDie
        )

      return {
        get,
        upsert,
        consumeTokenBudget,
        listAgentStates
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const decodeAgentStateRow = (row: AgentStateRow): AgentState => ({
  agentId: row.agent_id as AgentId,
  permissionMode: row.permission_mode,
  tokenBudget: row.token_budget,
  maxToolIterations: row.max_tool_iterations,
  quotaPeriod: row.quota_period,
  tokensConsumed: row.tokens_consumed,
  budgetResetAt: sqlInstantNullable.decode(row.budget_reset_at)
})

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
