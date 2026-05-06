/**
 * Schema-first AI metrics data models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoAiMetricsId } from "@beep/identity/packages";
import { LiteralKit, UnknownRecord } from "@beep/schema";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $RepoAiMetricsId.create("models");

/**
 * Supported deployment targets for the AI metrics stack.
 *
 * @example
 * ```ts
 * import { AiMetricsDeployTarget } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsDeployTarget.Enum.dankserver)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiMetricsDeployTarget = LiteralKit(["local", "dankserver"] as const).annotate(
  $I.annote("AiMetricsDeployTarget", {
    description: "Deploy targets supported by the repo AI metrics install module.",
  })
);

/**
 * Runtime type for {@link AiMetricsDeployTarget}.
 *
 * @category models
 * @since 0.0.0
 */
export type AiMetricsDeployTarget = typeof AiMetricsDeployTarget.Type;

/**
 * Candidate LLM-observability tool identifiers used in the bakeoff.
 *
 * @example
 * ```ts
 * import { AiMetricsTool } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsTool.Enum.langfuse)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiMetricsTool = LiteralKit(["langfuse", "phoenix", "opik", "posthog"] as const).annotate(
  $I.annote("AiMetricsTool", {
    description: "LLM analytics or evaluation tools that AI metrics exports can target.",
  })
);

/**
 * Runtime type for {@link AiMetricsTool}.
 *
 * @category models
 * @since 0.0.0
 */
export type AiMetricsTool = typeof AiMetricsTool.Type;

/**
 * Transcript source kind normalized by the ingest layer.
 *
 * @example
 * ```ts
 * import { AiMetricsTranscriptSource } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsTranscriptSource.Enum.codex)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiMetricsTranscriptSource = LiteralKit(["codex", "claude", "openclaw"] as const).annotate(
  $I.annote("AiMetricsTranscriptSource", {
    description: "AI stack transcript sources supported by the repo ingest layer.",
  })
);

/**
 * Runtime type for {@link AiMetricsTranscriptSource}.
 *
 * @category models
 * @since 0.0.0
 */
export type AiMetricsTranscriptSource = typeof AiMetricsTranscriptSource.Type;

/**
 * Raw transcript retention and derived-dashboard privacy posture.
 *
 * @example
 * ```ts
 * import { AiMetricsPrivacyMode } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsPrivacyMode.Enum.encrypted_raw_redacted_ui)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiMetricsPrivacyMode = LiteralKit([
  "encrypted_raw_redacted_ui",
  "raw_tailnet_ui",
  "redacted_only",
] as const).annotate(
  $I.annote("AiMetricsPrivacyMode", {
    description: "Privacy boundary for raw transcripts and derived observability UI payloads.",
  })
);

/**
 * Runtime type for {@link AiMetricsPrivacyMode}.
 *
 * @category models
 * @since 0.0.0
 */
export type AiMetricsPrivacyMode = typeof AiMetricsPrivacyMode.Type;

/**
 * Outcome-heavy scorecard weights for coding-agent performance.
 *
 * @example
 * ```ts
 * import { AiMetricsScoreWeights } from "@beep/repo-ai-metrics"
 * console.log(new AiMetricsScoreWeights({}).outcome)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsScoreWeights extends S.Class<AiMetricsScoreWeights>($I`AiMetricsScoreWeights`)(
  {
    cost: S.Number.pipe(S.withConstructorDefault(Effect.succeed(0.1)), S.withDecodingDefaultKey(Effect.succeed(0.1))),
    flow: S.Number.pipe(S.withConstructorDefault(Effect.succeed(0.2)), S.withDecodingDefaultKey(Effect.succeed(0.2))),
    outcome: S.Number.pipe(
      S.withConstructorDefault(Effect.succeed(0.7)),
      S.withDecodingDefaultKey(Effect.succeed(0.7))
    ),
  },
  $I.annote("AiMetricsScoreWeights", {
    description: "Default weighted rubric emphasizing outcomes over flow and cost.",
  })
) {}

/**
 * Versioned snapshot of agent-facing repository configuration.
 *
 * @example
 * ```ts
 * import { ConfigSnapshot } from "@beep/repo-ai-metrics"
 * console.log(ConfigSnapshot)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ConfigSnapshot extends S.Class<ConfigSnapshot>($I`ConfigSnapshot`)(
  {
    changedPaths: S.Array(S.String),
    configHash: S.String,
    gitCommit: S.optionalKey(S.String),
    label: S.String,
    snapshotId: S.String,
  },
  $I.annote("ConfigSnapshot", {
    description: "Hashed snapshot of Codex, Claude, assistant, and repo guidance configuration.",
  })
) {}

/**
 * Canonical unit of analysis for coding-agent metrics.
 *
 * @example
 * ```ts
 * import { AgentTask } from "@beep/repo-ai-metrics"
 * console.log(AgentTask)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentTask extends S.Class<AgentTask>($I`AgentTask`)(
  {
    agentTaskId: S.String,
    configSnapshotId: S.optionalKey(S.String),
    createdAt: S.String,
    repoPath: S.String,
    title: S.String,
  },
  $I.annote("AgentTask", {
    description: "One developer goal grouped across sessions, turns, commands, and labels.",
  })
) {}

/**
 * Session-level transcript metadata under an agent task.
 *
 * @example
 * ```ts
 * import { AgentSession } from "@beep/repo-ai-metrics"
 * console.log(AgentSession)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentSession extends S.Class<AgentSession>($I`AgentSession`)(
  {
    agentSessionId: S.String,
    agentTaskId: S.optionalKey(S.String),
    sourceKind: AiMetricsTranscriptSource,
    sourcePath: S.String,
    startedAt: S.optionalKey(S.String),
  },
  $I.annote("AgentSession", {
    description: "Transcript session metadata normalized from Codex, Claude, or OpenClaw logs.",
  })
) {}

/**
 * Turn-level transcript event normalized from local agent logs.
 *
 * @example
 * ```ts
 * import { AgentTurn } from "@beep/repo-ai-metrics"
 * console.log(AgentTurn)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentTurn extends S.Class<AgentTurn>($I`AgentTurn`)(
  {
    eventName: S.String,
    lineNumber: S.Number,
    sourceKind: AiMetricsTranscriptSource,
    sourcePath: S.String,
    timestamp: S.optionalKey(S.String),
  },
  $I.annote("AgentTurn", {
    description: "Single normalized transcript line suitable for derived analytics and OTel export.",
  })
) {}

/**
 * Model or provider call measured under an agent task.
 *
 * @example
 * ```ts
 * import { ModelCall } from "@beep/repo-ai-metrics"
 * console.log(ModelCall)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ModelCall extends S.Class<ModelCall>($I`ModelCall`)(
  {
    callId: S.String,
    latencyMs: S.optionalKey(S.Number),
    model: S.String,
    provider: S.String,
    totalTokens: S.optionalKey(S.Number),
  },
  $I.annote("ModelCall", {
    description: "Provider/model usage, latency, and token measurement for a coding-agent run.",
  })
) {}

/**
 * Tool or shell command invocation measured under an agent task.
 *
 * @example
 * ```ts
 * import { ToolInvocation } from "@beep/repo-ai-metrics"
 * console.log(ToolInvocation)
 * ```
 * @category models
 * @since 0.0.0
 */
export class ToolInvocation extends S.Class<ToolInvocation>($I`ToolInvocation`)(
  {
    durationMs: S.optionalKey(S.Number),
    exitCode: S.optionalKey(S.Number),
    toolName: S.String,
    toolRunId: S.String,
  },
  $I.annote("ToolInvocation", {
    description: "Tool or command invocation normalized from transcript events.",
  })
) {}

/**
 * Human label used by the weekly outcome-heavy scorecard.
 *
 * @example
 * ```ts
 * import { OutcomeLabel } from "@beep/repo-ai-metrics"
 * console.log(OutcomeLabel)
 * ```
 * @category models
 * @since 0.0.0
 */
export class OutcomeLabel extends S.Class<OutcomeLabel>($I`OutcomeLabel`)(
  {
    agentTaskId: S.String,
    labelId: S.String,
    passed: S.Boolean,
    rating: S.Number,
    reason: S.String,
  },
  $I.annote("OutcomeLabel", {
    description: "Small manual label used to calibrate agent task outcome scoring.",
  })
) {}

/**
 * Repeatable benchmark case for comparing agent configurations.
 *
 * @example
 * ```ts
 * import { BenchmarkCase } from "@beep/repo-ai-metrics"
 * console.log(BenchmarkCase)
 * ```
 * @category models
 * @since 0.0.0
 */
export class BenchmarkCase extends S.Class<BenchmarkCase>($I`BenchmarkCase`)(
  {
    benchmarkCaseId: S.String,
    expectedChecks: S.Array(S.String),
    prompt: S.String,
    repoPath: S.String,
    title: S.String,
  },
  $I.annote("BenchmarkCase", {
    description: "Repeatable coding-agent or runtime-proof benchmark case.",
  })
) {}

/**
 * Benchmark run result under one config snapshot.
 *
 * @example
 * ```ts
 * import { BenchmarkRun } from "@beep/repo-ai-metrics"
 * console.log(BenchmarkRun)
 * ```
 * @category models
 * @since 0.0.0
 */
export class BenchmarkRun extends S.Class<BenchmarkRun>($I`BenchmarkRun`)(
  {
    benchmarkCaseId: S.String,
    benchmarkRunId: S.String,
    configSnapshotId: S.String,
    elapsedMs: S.Number,
    passed: S.Boolean,
  },
  $I.annote("BenchmarkRun", {
    description: "Observed result from running one benchmark case against one configuration snapshot.",
  })
) {}

/**
 * Derived scorecard for weekly or config-impact review.
 *
 * @example
 * ```ts
 * import { Scorecard } from "@beep/repo-ai-metrics"
 * console.log(Scorecard)
 * ```
 * @category models
 * @since 0.0.0
 */
export class Scorecard extends S.Class<Scorecard>($I`Scorecard`)(
  {
    costScore: S.Number,
    flowScore: S.Number,
    outcomeScore: S.Number,
    scorecardId: S.String,
    totalScore: S.Number,
    weights: AiMetricsScoreWeights,
  },
  $I.annote("Scorecard", {
    description: "Outcome-heavy aggregate score for an agent task, benchmark run, or weekly review.",
  })
) {}

/**
 * Summary produced by transcript ingestion.
 *
 * @example
 * ```ts
 * import { TranscriptIngestSummary } from "@beep/repo-ai-metrics"
 * console.log(TranscriptIngestSummary)
 * ```
 * @category models
 * @since 0.0.0
 */
export class TranscriptIngestSummary extends S.Class<TranscriptIngestSummary>($I`TranscriptIngestSummary`)(
  {
    acceptedEvents: S.Number,
    eventNames: S.Array(S.String),
    firstTimestamp: S.optionalKey(S.String),
    lastTimestamp: S.optionalKey(S.String),
    rejectedLines: S.Number,
    sourceKind: AiMetricsTranscriptSource,
    sourcePath: S.String,
    totalLines: S.Number,
  },
  $I.annote("TranscriptIngestSummary", {
    description: "Line-count, timestamp, and event-name summary from transcript ingestion.",
  })
) {}

/**
 * Minimal external Codex JSONL shape.
 *
 * @category models
 * @since 0.0.0
 */
export class CodexTranscriptLine extends S.Class<CodexTranscriptLine>($I`CodexTranscriptLine`)(
  {
    payload: S.optionalKey(S.Unknown),
    timestamp: S.optionalKey(S.String),
    type: S.String,
  },
  $I.annote("CodexTranscriptLine", {
    description: "Boundary shape decoded from Codex session JSONL lines.",
  })
) {}

/**
 * Minimal external Claude JSONL shape.
 *
 * @category models
 * @since 0.0.0
 */
export class ClaudeTranscriptLine extends S.Class<ClaudeTranscriptLine>($I`ClaudeTranscriptLine`)(
  {
    cwd: S.optionalKey(S.String),
    message: S.optionalKey(S.Unknown),
    sessionId: S.optionalKey(S.String),
    timestamp: S.optionalKey(S.String),
    type: S.optionalKey(S.String),
  },
  $I.annote("ClaudeTranscriptLine", {
    description: "Boundary shape decoded from Claude Code project JSONL lines.",
  })
) {}

/**
 * Minimal external OpenClaw JSONL shape.
 *
 * @category models
 * @since 0.0.0
 */
export class OpenClawTranscriptLine extends S.Class<OpenClawTranscriptLine>($I`OpenClawTranscriptLine`)(
  {
    event: S.optionalKey(S.String),
    message: S.optionalKey(S.String),
    payload: S.optionalKey(UnknownRecord),
    timestamp: S.optionalKey(S.String),
    type: S.optionalKey(S.String),
  },
  $I.annote("OpenClawTranscriptLine", {
    description: "Boundary shape decoded from OpenClaw JSONL or exported event lines.",
  })
) {}
