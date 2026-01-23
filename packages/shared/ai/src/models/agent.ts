import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
import { AiProviderName } from "../constants.ts";

const $I = $SharedAiId.create("models/agent");

export class ReasoningEffort extends BS.StringLiteralKit("disabled", "low", "medium", "high").annotations(
  $I.annotations("ReasoningEffort", {
    description: "ReasoningEffort",
  })
) {}

export declare namespace ReasoningEffort {
  export type Type = typeof ReasoningEffort.Type;
}

export class AgentConfig extends S.Class<AgentConfig>($I`AgentConfig`)(
  {
    agentType: S.String,
    llmProvider: AiProviderName,
    llmModel: S.String,
    reasoningEffort: S.optionalWith(ReasoningEffort, { as: "Option" }),
    tools: S.optionalWith(S.Array(S.String), { as: "Option" }),
  },
  $I.annotations("AgentConfig", {
    description: "AgentConfig",
  })
) {}

export class Agent extends S.Class<Agent>($I`Agent`)(
  {
    id: S.String,
    name: S.String,
    description: S.optional(S.String),
    model: S.TemplateLiteral(S.String, "/", S.String),
    config: AgentConfig,
    createdAt: BS.DateTimeUtcFromAllAcceptable,
    updatedAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("Agent", {
    description: "Agent",
  })
) {}

export class AgentRunMetricsContext extends S.Class<AgentRunMetricsContext>($I`AgentRunMetricsContext`)(
  {
    agent: Agent,
    conversationId: S.String,
    userId: S.optionalWith(SharedEntityIds.UserId, { as: "Option" }),
    provider: S.optionalWith(S.String, { as: "Option" }),
    model: S.optionalWith(S.String, { as: "Option" }),
    reasoningEffort: S.optionalWith(ReasoningEffort, { as: "Option" }),
    maxIteration: S.NonNegativeInt,
  },
  $I.annotations("AgentRunMetricsContext", {
    description: "AgentRunMetricsContext",
  })
) {}

export class AgentRunIterationSummary extends S.Class<AgentRunIterationSummary>($I`AgentRunIterationSummary`)(
  {
    iteration: S.NonNegativeInt,
    toolCalls: S.NonNegativeInt,
    toolsUsed: S.HashSet(S.String),
    toolCallsCounts: S.Record({
      key: S.String,
      value: S.NonNegativeInt,
    }),
    errors: S.Array(S.String),
    toolSequence: S.Array(S.String),
  },
  $I.annotations("AgentRunIterationSummary", {
    description: "AgentRunIterationSummary",
  })
) {}

export class AgentRunMetrics extends S.Class<AgentRunMetrics>($I`AgentRunMetrics`)(
  {
    runId: S.String,
    agentId: S.String,
    agentName: S.String,
    agentType: S.String,
    agentUpdatedAt: BS.DateTimeUtcFromAllAcceptable,
    conversationId: S.String,
    userId: S.optionalWith(SharedEntityIds.UserId, { as: "Option" }),
    provider: S.optionalWith(S.String, { as: "Option" }),
    model: S.optionalWith(S.String, { as: "Option" }),
    reasoningEffort: S.optionalWith(ReasoningEffort, { as: "Option" }),
    maxIteration: S.NonNegativeInt,
    startedAt: BS.DateTimeUtcFromAllAcceptable,
    totalPromptTokens: S.NonNegativeInt,
    totalCompletionTokens: S.NonNegativeInt,
    llmRetryCount: S.NonNegativeInt,
    lastError: S.optionalWith(S.String, { as: "Option" }),
    toolCalls: S.NonNegativeInt,
    toolErrors: S.NonNegativeInt,
    toolsUsed: S.HashSet(S.String),
    toolCallsCounts: S.Record({
      key: S.String,
      value: S.NonNegativeInt,
    }),
    toolInvocationSequence: S.Array(S.String),
    errors: S.Array(S.String),
    iterationSummaries: S.Array(AgentRunIterationSummary),
    currentIteration: S.OptionFromUndefinedOr(AgentRunIterationSummary),
    firstTokenLatencyMs: S.optionalWith(S.Duration, { as: "Option" }),
  },
  $I.annotations("AgentRunMetrics", {
    description: "AgentRunMetrics",
  })
) {}
