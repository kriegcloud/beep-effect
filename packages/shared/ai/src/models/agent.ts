import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import { thunkZero } from "@beep/utils";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import type * as Duration from "effect/Duration";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { AiProviderName } from "../constants.ts";
import { ChatMessage } from "./message.ts";
import { ToolCall } from "./tools.ts";

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
    runId: S.optionalWith(S.UUID, { default: () => crypto.randomUUID() }),
    agentId: S.String,
    agentName: S.String,
    agentType: S.String,
    agentUpdatedAt: BS.DateTimeUtcFromAllAcceptable,
    conversationId: S.String,
    userId: S.optionalWith(SharedEntityIds.UserId, { as: "Option" }),
    provider: S.optionalWith(S.String, { as: "Option" }),
    model: S.optionalWith(S.String, { as: "Option" }),
    reasoningEffort: S.optionalWith(ReasoningEffort, { as: "Option" }),
    maxIteration: S.optionalWith(S.NonNegativeInt, { default: thunkZero }),
    startedAt: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, {
      default: () => DateTime.unsafeNow().pipe(DateTime.toUtc),
    }),
    totalPromptTokens: S.optionalWith(S.NonNegativeInt, { default: thunkZero }),
    totalCompletionTokens: S.optionalWith(S.NonNegativeInt, { default: thunkZero }),
    llmRetryCount: S.optionalWith(S.NonNegativeInt, { default: thunkZero }),
    lastError: S.optionalWith(S.String, { as: "Option" }),
    toolCalls: S.optionalWith(S.NonNegativeInt, { default: thunkZero }),
    toolErrors: S.optionalWith(S.NonNegativeInt, { default: thunkZero }),
    toolsUsed: S.optionalWith(S.HashSet(S.String), { default: HashSet.empty<string> }),
    toolCallsCounts: S.optionalWith(
      S.Record({
        key: S.String,
        value: S.NonNegativeInt,
      }),
      { default: R.empty<string, number> }
    ),
    toolInvocationSequence: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
    errors: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
    iterationSummaries: S.optionalWith(S.Array(AgentRunIterationSummary), {
      default: A.empty<AgentRunIterationSummary>,
    }),
    currentIteration: S.optionalWith(S.OptionFromUndefinedOr(AgentRunIterationSummary), {
      default: O.none<AgentRunIterationSummary>,
    }),
    firstTokenLatencyMs: S.optionalWith(S.OptionFromUndefinedOr(S.Duration), { default: O.none<Duration.Duration> }),
  },
  $I.annotations("AgentRunMetrics", {
    description: "AgentRunMetrics",
  })
) {}

export class AgentRunnerOptions extends S.Class<AgentRunnerOptions>($I`AgentRunnerOptions`)(
  {
    agent: Agent.annotations({
      description: "The agent to execute.",
    }),
    userInput: S.String.annotations({
      description: "The user's input or query for this conversation turn.",
      documentation: "This is the primary instruction that the agent will process and respond to.",
    }),
    conversationId: BS.OptionalAsOption(S.String).annotations({
      description: "Optional conversation identifier for tracking multi-turn conversations.",
      documentation:
        "If not provided, a new conversation ID will be generated automatically.\nUse the same conversation ID across multiple turns to maintain context.",
    }),
    sessionId: S.String.annotations({
      description: "Session identifier for logging purposes.",
      documentation:
        "This should be set to the sessionId created at the start of a chat session.\nUsed to route logs to session-specific log files.",
    }),
    internal: BS.OptionalAsOption(S.Boolean).annotations({
      description: "If true, this is an internal sub-agent run (e.g., summarization).",
      documentation: "UI elements like thinking indicators will be suppressed.",
    }),
    maxIterations: BS.OptionalAsOption(S.NonNegativeInt).annotations({
      description: "Maximum number of iterations (agent reasoning loops) allowed for this run.",
      documentation:
        "Each iteration may involve tool calls and LLM responses.\nIf not specified, defaults to `MAX_AGENT_STEPS` constant.\nThe agent will stop when it reaches this limit or completes its task.",
    }),
    conversationHistory: BS.OptionalAsOption(ChatMessage).annotations({
      description: "Full conversation history to date, including prior assistant, user, and tool messages.",
      documentation: "Use this to preserve context across turns (e.g., approval flows, multi-step tasks).",
    }),
    stream: BS.OptionalAsOption(S.Boolean).annotations({
      description: "Override streaming behavior (from --stream or --no-stream CLI flags).",
      documentation:
        "- `true`: Force streaming on - responses are rendered in real-time as they're generated\n- `false`: Force streaming off - wait for complete response before rendering\n- `undefined`: Use auto-detection based on environment and configuration (default)",
    }),
  },
  $I.annotations("AgentRunnerOptions", {
    description: "Configuration options for running an agent conversation.",
    documentation:
      "This interface defines all the parameters needed to execute a single turn of an agent conversation,\nincluding the agent configuration, user input, conversation context, and execution settings.",
  })
) {}

export class AgentResponse extends S.Class<AgentResponse>($I`AgentResponse`)(
  {
    content: S.String.annotations({
      description: "The agent's text response content.",
      documentation:
        "This is the final answer or message from the agent after processing the user input\nand executing any necessary tools. May be empty if the agent only performed tool calls\nwithout providing a text response.",
    }),
    conversationId: S.String.annotations({
      description: "The conversation identifier for this run.",
      documentation:
        "This will be the same as the `conversationId` provided in options, or a newly generated\nID if one wasn't provided. Use this to track and correlate related conversation turns.",
    }),
    toolCalls: S.optionalWith(S.Array(ToolCall), { as: "Option" }).annotations({
      description: "Optional array of tool calls made by the agent during this turn.",
      documentation:
        "Present when the agent decided to use tools to accomplish the task.\nEach tool call includes the tool name, arguments, and call ID.",
    }),
    toolResults: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { as: "Option" }).annotations({
      description: "Optional map of tool execution results, keyed by tool name.",
      documentation:
        "Present when tools were executed during this turn.\nContains the results returned by each tool, which may include data, errors, or status information.",
    }),
    messages: S.optionalWith(S.Array(ChatMessage), { as: "Option" }).annotations({
      description: "The full message list used for this turn.",
      documentation:
        "Pass this back on the next turn to retain context across approvals and multi-step tasks.\nThis array contains the complete conversation state, including:\n- System messages (agent instructions)\n- User messages (input)\n- Assistant messages (agent responses)\n- Tool messages (tool execution results)",
    }),
  },
  $I.annotations("AgentResponse", {
    description: "Response returned from executing an agent conversation.",
    documentation:
      "Contains the agent's response content, conversation metadata, tool execution results,\nand the full message history for this turn. Use this to:\n- Display the agent's response to the user\n- Pass conversation history to subsequent turns\n- Inspect tool calls and results for debugging or auditing\n- Track conversation state and context",
  })
) {}

const TokenUsageIterationSummary = S.Struct({
  iteration: S.NonNegativeInt,
  toolCalls: S.NonNegativeInt,
  toolsUsed: S.Array(S.String),
  toolCallCounts: S.Record({ key: S.String, value: S.NonNegativeInt }),
  errors: S.Array(S.String),
  toolSequence: S.Array(S.String),
}).annotations(
  $I.annotations("TokenUsageIterationSummary", {
    description: "Summary of a single iteration within a token usage log.",
  })
);

export class TokenUsageLogPayload extends S.Class<TokenUsageLogPayload>($I`TokenUsageLogPayload`)(
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
    promptTokens: S.NonNegativeInt,
    completionTokens: S.NonNegativeInt,
    totalTokens: S.NonNegativeInt,
    iterations: S.NonNegativeInt,
    maxIterations: S.NonNegativeInt,
    finished: S.Boolean,
    startedAt: BS.DateTimeUtcFromAllAcceptable,
    endedAt: BS.DateTimeUtcFromAllAcceptable,
    durationMs: S.NonNegativeInt,
    retryCount: S.NonNegativeInt,
    lastError: S.optionalWith(S.String, { as: "Option" }),
    toolCalls: S.NonNegativeInt,
    toolsUsed: S.Array(S.String),
    toolErrors: S.NonNegativeInt,
    toolCallCounts: S.Record({ key: S.String, value: S.NonNegativeInt }),
    toolInvocationSequence: S.Array(S.String),
    errors: S.Array(S.String),
    iterationSummaries: S.Array(TokenUsageIterationSummary),
    firstTokenLatencyMs: S.optionalWith(S.NonNegativeInt, { as: "Option" }),
  },
  $I.annotations("TokenUsageLogPayload", {
    description: "Payload for logging token usage metrics from an agent run.",
  })
) {}
