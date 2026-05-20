/**
 * Agent-effectiveness doctor and annotation-plan helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { DuckDb } from "@beep/duckdb";
import { $RepoAiMetricsId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { A, O, P, Str } from "@beep/utils";
import { DateTime, Effect, FileSystem, flow, Path, pipe } from "effect";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { AiMetricsDeployTarget } from "./models.ts";

const $I = $RepoAiMetricsId.create("agent-effectiveness");

const defaultPhoenixBaseUrl = "https://dankserver.tailc7c348.ts.net:8447";
const defaultDataRoot = ".beep/ai-metrics";
/**
 * Stable default pointer used to locate the latest checked-in JSDoc worker-eval evidence.
 *
 * @example
 * ```ts
 * import { DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH } from "@beep/repo-ai-metrics"
 * console.log(DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH)
 * ```
 * @category constants
 * @since 0.0.0
 */
export const DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH = "initiatives/jsdoc-worker-eval/ops/manifest.json";
const defaultAnnotationLimit = 50;

const phoenixInventoryQuery = `
query AgentEffectivenessPhoenixInventory {
  serverStatus { insufficientStorage }
  projectCount
  datasetCount
  promptCount
  evaluatorCount
  projects(first: 20) {
    edges {
      node {
        name
        hasTraces
        recordCount
        traceCount
        traceAnnotationsNames
        spanAnnotationNames
        sessionAnnotationNames
      }
    }
  }
}
`;

/**
 * Status emitted by agent-effectiveness reports.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessStatus } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessStatus.Enum.passed)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AgentEffectivenessStatus = LiteralKit(["passed", "warning", "failed", "unavailable"] as const).annotate(
  $I.annote("AgentEffectivenessStatus", {
    description: "Non-blocking status used by agent-effectiveness trust-gate reports.",
  })
);

/**
 * Runtime type for `AgentEffectivenessStatus`.
 *
 * @category models
 * @since 0.0.0
 */
export type AgentEffectivenessStatus = typeof AgentEffectivenessStatus.Type;

/**
 * Primitive annotation value allowed in local Phase 1 plans.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessAnnotationValue } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessAnnotationValue)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AgentEffectivenessAnnotationValue = S.Union([S.String, S.Number, S.Boolean]).annotate(
  $I.annote("AgentEffectivenessAnnotationValue", {
    description: "Sanitized primitive value allowed in an agent-effectiveness annotation plan.",
  })
);

/**
 * Runtime type for `AgentEffectivenessAnnotationValue`.
 *
 * @category models
 * @since 0.0.0
 */
export type AgentEffectivenessAnnotationValue = typeof AgentEffectivenessAnnotationValue.Type;

/**
 * Error raised by agent-effectiveness report helpers.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessError } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessError)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AgentEffectivenessError extends TaggedErrorClass<AgentEffectivenessError>($I`AgentEffectivenessError`)(
  "AgentEffectivenessError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AgentEffectivenessError", {
    description: "Typed failure raised while encoding or decoding agent-effectiveness reports.",
  })
) {}

/**
 * Input for the Phase 1 agent-effectiveness doctor.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessDoctorInput } from "@beep/repo-ai-metrics"
 * console.log(new AgentEffectivenessDoctorInput({}).target)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessDoctorInput extends S.Class<AgentEffectivenessDoctorInput>(
  $I`AgentEffectivenessDoctorInput`
)(
  {
    dataRoot: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultDataRoot)),
      S.withDecodingDefaultKey(Effect.succeed(defaultDataRoot))
    ),
    noPhoenix: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    phoenixBaseUrl: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(defaultPhoenixBaseUrl)),
      S.withDecodingDefaultKey(Effect.succeed(defaultPhoenixBaseUrl))
    ),
    target: AiMetricsDeployTarget.pipe(
      S.withConstructorDefault(Effect.succeed(AiMetricsDeployTarget.Enum.dankserver)),
      S.withDecodingDefaultKey(Effect.succeed(AiMetricsDeployTarget.Enum.dankserver))
    ),
    workerEvalReportPath: S.String.pipe(
      S.withConstructorDefault(Effect.succeed(DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH)),
      S.withDecodingDefaultKey(Effect.succeed(DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH))
    ),
  },
  $I.annote("AgentEffectivenessDoctorInput", {
    description: "Local, no-mutation inputs used to build the agent-effectiveness doctor report.",
  })
) {}

/**
 * Input for building a dry-run annotation plan.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessAnnotationPlanInput } from "@beep/repo-ai-metrics"
 * console.log(new AgentEffectivenessAnnotationPlanInput({}).annotationLimit)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessAnnotationPlanInput extends S.Class<AgentEffectivenessAnnotationPlanInput>(
  $I`AgentEffectivenessAnnotationPlanInput`
)(
  {
    annotationLimit: S.Number.pipe(
      S.withConstructorDefault(Effect.succeed(defaultAnnotationLimit)),
      S.withDecodingDefaultKey(Effect.succeed(defaultAnnotationLimit))
    ),
    doctor: AgentEffectivenessDoctorInput.pipe(
      S.withConstructorDefault(Effect.succeed(new AgentEffectivenessDoctorInput({}))),
      S.withDecodingDefaultKey(Effect.succeed(new AgentEffectivenessDoctorInput({})))
    ),
  },
  $I.annote("AgentEffectivenessAnnotationPlanInput", {
    description: "Input used to render a sanitized, local-only Phoenix annotation plan.",
  })
) {}

/**
 * Summary for one Phoenix project.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessPhoenixProject } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessPhoenixProject)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessPhoenixProject extends S.Class<AgentEffectivenessPhoenixProject>(
  $I`AgentEffectivenessPhoenixProject`
)(
  {
    hasTraces: S.Boolean,
    name: S.String,
    recordCount: S.Number,
    spanAnnotationNames: S.Array(S.String),
    sessionAnnotationNames: S.Array(S.String),
    traceAnnotationNames: S.Array(S.String),
    traceCount: S.Number,
  },
  $I.annote("AgentEffectivenessPhoenixProject", {
    description: "Sanitized Phoenix project inventory row used by the agent-effectiveness doctor.",
  })
) {}

/**
 * Read-only Phoenix health and inventory section.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessPhoenixSection } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessPhoenixSection)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessPhoenixSection extends S.Class<AgentEffectivenessPhoenixSection>(
  $I`AgentEffectivenessPhoenixSection`
)(
  {
    baseUrl: S.String,
    datasetCount: S.Number,
    evaluatorCount: S.Number,
    message: S.String,
    projectCount: S.Number,
    projects: S.Array(AgentEffectivenessPhoenixProject),
    promptCount: S.Number,
    serverInsufficientStorage: S.Boolean,
    status: AgentEffectivenessStatus,
    version: S.NullOr(S.String),
  },
  $I.annote("AgentEffectivenessPhoenixSection", {
    description: "Non-mutating Phoenix readiness section for the agent-effectiveness doctor.",
  })
) {}

/**
 * Source coverage row derived from AI-metrics storage.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessSourceCoverage } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessSourceCoverage)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessSourceCoverage extends S.Class<AgentEffectivenessSourceCoverage>(
  $I`AgentEffectivenessSourceCoverage`
)(
  {
    acceptedEvents: S.Number,
    lastTimestamp: S.NullOr(S.String),
    rejectedLines: S.Number,
    sourceFileCount: S.Number,
    sourceKind: S.String,
    totalLines: S.Number,
  },
  $I.annote("AgentEffectivenessSourceCoverage", {
    description: "Aggregate source coverage for one transcript source kind.",
  })
) {}

/**
 * Latest forwarder summary from derived AI-metrics storage.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessForwarderSummary } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessForwarderSummary)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessForwarderSummary extends S.Class<AgentEffectivenessForwarderSummary>(
  $I`AgentEffectivenessForwarderSummary`
)(
  {
    archiveObjectCount: S.Number,
    completedAtEpochMillis: S.Number,
    configSnapshotId: S.String,
    ingestRunId: S.String,
    sourceFileCount: S.Number,
    target: AiMetricsDeployTarget,
    turnCount: S.Number,
  },
  $I.annote("AgentEffectivenessForwarderSummary", {
    description: "Latest deploy-safe forwarder run summary.",
  })
) {}

/**
 * Latest scorecard summary from derived AI-metrics storage.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessScorecardSummary } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessScorecardSummary)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessScorecardSummary extends S.Class<AgentEffectivenessScorecardSummary>(
  $I`AgentEffectivenessScorecardSummary`
)(
  {
    benchmarkRunCount: S.Number,
    completionReady: S.Boolean,
    configSnapshotId: S.String,
    coverageGaps: S.Array(S.String),
    labelCount: S.Number,
    scorecardId: S.String,
    taskCount: S.Number,
    totalScore: S.Number,
    windowEndEpochMillis: S.Number,
    windowStartEpochMillis: S.Number,
  },
  $I.annote("AgentEffectivenessScorecardSummary", {
    description: "Latest deploy-safe scorecard summary.",
  })
) {}

/**
 * AI-metrics local evidence section for the doctor report.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessAiMetricsSection } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessAiMetricsSection)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessAiMetricsSection extends S.Class<AgentEffectivenessAiMetricsSection>(
  $I`AgentEffectivenessAiMetricsSection`
)(
  {
    benchmarkRunCount: S.Number,
    dataRoot: S.String,
    derivedDuckDbPath: S.String,
    labelCount: S.Number,
    latestForwarder: S.NullOr(AgentEffectivenessForwarderSummary),
    latestScorecard: S.NullOr(AgentEffectivenessScorecardSummary),
    message: S.String,
    sourceCoverage: S.Array(AgentEffectivenessSourceCoverage),
    status: AgentEffectivenessStatus,
    unavailableMetrics: S.Array(S.String),
  },
  $I.annote("AgentEffectivenessAiMetricsSection", {
    description: "AI-metrics derived evidence summarized for the agent-effectiveness trust gate.",
  })
) {}

/**
 * JSDoc worker-eval section for the doctor report.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessJsdocWorkerSection } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessJsdocWorkerSection)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessJsdocWorkerSection extends S.Class<AgentEffectivenessJsdocWorkerSection>(
  $I`AgentEffectivenessJsdocWorkerSection`
)(
  {
    cleanupDeleteStatus: S.NullOr(S.String),
    cleanupStopStatus: S.NullOr(S.String),
    completedPackets: S.Number,
    failedPackets: S.Number,
    message: S.String,
    otlpStatus: S.NullOr(S.String),
    policyViolationCodes: S.Array(S.String),
    reportPath: S.String,
    selectedPackets: S.Number,
    status: AgentEffectivenessStatus,
    timedOutPackets: S.Number,
  },
  $I.annote("AgentEffectivenessJsdocWorkerSection", {
    description: "Read-only JSDoc worker-eval evidence summarized for the agent-effectiveness doctor.",
  })
) {}

/**
 * Aggregate summary emitted by the doctor report.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessDoctorSummary } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessDoctorSummary)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessDoctorSummary extends S.Class<AgentEffectivenessDoctorSummary>(
  $I`AgentEffectivenessDoctorSummary`
)(
  {
    failures: S.Array(S.String),
    status: AgentEffectivenessStatus,
    unavailable: S.Array(S.String),
    warnings: S.Array(S.String),
  },
  $I.annote("AgentEffectivenessDoctorSummary", {
    description: "Human-sized status summary for the agent-effectiveness doctor.",
  })
) {}

/**
 * Phase 1 agent-effectiveness doctor report.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessDoctorReport } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessDoctorReport)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessDoctorReport extends S.Class<AgentEffectivenessDoctorReport>(
  $I`AgentEffectivenessDoctorReport`
)(
  {
    aiMetrics: AgentEffectivenessAiMetricsSection,
    dataRoot: S.String,
    generatedAt: S.String,
    jsdocWorkerEval: AgentEffectivenessJsdocWorkerSection,
    phoenix: AgentEffectivenessPhoenixSection,
    schemaVersion: S.String,
    summary: AgentEffectivenessDoctorSummary,
    target: AiMetricsDeployTarget,
  },
  $I.annote("AgentEffectivenessDoctorReport", {
    description: "Report-only trust gate for repo agent-effectiveness evidence.",
  })
) {}

/**
 * One local-only annotation row that could be written to Phoenix later.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessPlannedAnnotation } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessPlannedAnnotation)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessPlannedAnnotation extends S.Class<AgentEffectivenessPlannedAnnotation>(
  $I`AgentEffectivenessPlannedAnnotation`
)(
  {
    annotationId: S.String,
    metadata: S.Record(S.String, S.String).pipe(
      S.withConstructorDefault(Effect.succeed({})),
      S.withDecodingDefaultKey(Effect.succeed({}))
    ),
    name: S.String,
    optimization: S.String,
    source: S.String,
    targetKind: S.String,
    targetRef: S.String,
    value: AgentEffectivenessAnnotationValue,
  },
  $I.annote("AgentEffectivenessPlannedAnnotation", {
    description: "Sanitized planned annotation row for future Phoenix mutation phases.",
  })
) {}

/**
 * Dry-run annotation plan for Phase 1.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessAnnotationPlan } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessAnnotationPlan)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessAnnotationPlan extends S.Class<AgentEffectivenessAnnotationPlan>(
  $I`AgentEffectivenessAnnotationPlan`
)(
  {
    annotations: S.Array(AgentEffectivenessPlannedAnnotation),
    doctor: AgentEffectivenessDoctorReport,
    generatedAt: S.String,
    mutationPolicy: S.String,
    schemaVersion: S.String,
    summary: AgentEffectivenessDoctorSummary,
  },
  $I.annote("AgentEffectivenessAnnotationPlan", {
    description: "Local-only dry-run annotation plan for the agent-effectiveness loop.",
  })
) {}

/**
 * One validation finding for an annotation plan.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessAnnotationCheckFinding } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessAnnotationCheckFinding)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessAnnotationCheckFinding extends S.Class<AgentEffectivenessAnnotationCheckFinding>(
  $I`AgentEffectivenessAnnotationCheckFinding`
)(
  {
    annotationId: S.String,
    code: S.String,
    message: S.String,
  },
  $I.annote("AgentEffectivenessAnnotationCheckFinding", {
    description: "Privacy or schema finding emitted while checking a dry-run annotation plan.",
  })
) {}

/**
 * Report emitted by `agent-effectiveness annotations check`.
 *
 * @example
 * ```ts
 * import { AgentEffectivenessAnnotationCheckReport } from "@beep/repo-ai-metrics"
 * console.log(AgentEffectivenessAnnotationCheckReport)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AgentEffectivenessAnnotationCheckReport extends S.Class<AgentEffectivenessAnnotationCheckReport>(
  $I`AgentEffectivenessAnnotationCheckReport`
)(
  {
    annotationCount: S.Number,
    findings: S.Array(AgentEffectivenessAnnotationCheckFinding),
    generatedAt: S.String,
    schemaVersion: S.String,
    status: AgentEffectivenessStatus,
  },
  $I.annote("AgentEffectivenessAnnotationCheckReport", {
    description: "Report-only privacy/schema check result for a local annotation plan.",
  })
) {}

class SourceCoverageRow extends S.Class<SourceCoverageRow>($I`SourceCoverageRow`)(
  {
    acceptedEvents: S.Number,
    lastTimestamp: S.NullOr(S.String),
    rejectedLines: S.Number,
    sourceFileCount: S.Number,
    sourceKind: S.String,
    totalLines: S.Number,
  },
  $I.annote("SourceCoverageRow", {
    description: "Internal DuckDB source coverage row.",
  })
) {}

class ForwarderSummaryRow extends S.Class<ForwarderSummaryRow>($I`ForwarderSummaryRow`)(
  {
    archiveObjectCount: S.Number,
    completedAtEpochMillis: S.Number,
    configSnapshotId: S.String,
    ingestRunId: S.String,
    sourceFileCount: S.Number,
    target: AiMetricsDeployTarget,
    turnCount: S.Number,
  },
  $I.annote("ForwarderSummaryRow", {
    description: "Internal DuckDB forwarder summary row.",
  })
) {}

class ScorecardSummaryRow extends S.Class<ScorecardSummaryRow>($I`ScorecardSummaryRow`)(
  {
    benchmarkRunCount: S.Number,
    completionReady: S.Boolean,
    configSnapshotId: S.String,
    coverageGapsJson: S.String,
    labelCount: S.Number,
    scorecardId: S.String,
    taskCount: S.Number,
    totalScore: S.Number,
    windowEndEpochMillis: S.Number,
    windowStartEpochMillis: S.Number,
  },
  $I.annote("ScorecardSummaryRow", {
    description: "Internal DuckDB scorecard summary row.",
  })
) {}

class CountRow extends S.Class<CountRow>($I`CountRow`)(
  {
    count: S.Number,
  },
  $I.annote("CountRow", {
    description: "Internal DuckDB count row.",
  })
) {}

class OutcomeLabelAnnotationRow extends S.Class<OutcomeLabelAnnotationRow>($I`OutcomeLabelAnnotationRow`)(
  {
    agentTaskId: S.String,
    followUpFix: S.Boolean,
    interventionCount: S.Number,
    labelId: S.String,
    passed: S.Boolean,
    qualityGate: S.String,
    rating: S.Number,
  },
  $I.annote("OutcomeLabelAnnotationRow", {
    description: "Internal row used to plan outcome label annotations.",
  })
) {}

class BenchmarkRunAnnotationRow extends S.Class<BenchmarkRunAnnotationRow>($I`BenchmarkRunAnnotationRow`)(
  {
    benchmarkCaseId: S.String,
    benchmarkRunId: S.String,
    configSnapshotId: S.String,
    elapsedMs: S.Number,
    passed: S.Boolean,
    qualityGate: S.String,
  },
  $I.annote("BenchmarkRunAnnotationRow", {
    description: "Internal row used to plan benchmark annotations.",
  })
) {}

class WorkerEvalSummary extends S.Class<WorkerEvalSummary>($I`WorkerEvalSummary`)(
  {
    completed: S.Number,
    failed: S.Number,
    selectedPackets: S.Number,
    timedOut: S.Number,
  },
  $I.annote("WorkerEvalSummary", {
    description: "Internal minimal JSDoc worker-eval summary.",
  })
) {}

class WorkerEvalPolicyViolationObject extends S.Class<WorkerEvalPolicyViolationObject>(
  $I`WorkerEvalPolicyViolationObject`
)(
  {
    code: S.String,
  },
  $I.annote("WorkerEvalPolicyViolationObject", {
    description: "Internal minimal JSDoc worker-eval policy violation row.",
  })
) {}

const WorkerEvalPolicyViolation = S.Union([S.String, WorkerEvalPolicyViolationObject]).annotate(
  $I.annote("WorkerEvalPolicyViolation", {
    description: "Internal worker-eval policy violation code in either legacy object or current string form.",
  })
);

class WorkerEvalPacket extends S.Class<WorkerEvalPacket>($I`WorkerEvalPacket`)(
  {
    policyViolationCodes: S.Array(S.String).pipe(
      S.withConstructorDefault(Effect.succeed([])),
      S.withDecodingDefaultKey(Effect.succeed([]))
    ),
  },
  $I.annote("WorkerEvalPacket", {
    description: "Internal minimal JSDoc worker-eval packet row.",
  })
) {}

class WorkerEvalReport extends S.Class<WorkerEvalReport>($I`WorkerEvalReport`)(
  {
    packets: S.Array(WorkerEvalPacket).pipe(
      S.withConstructorDefault(Effect.succeed([])),
      S.withDecodingDefaultKey(Effect.succeed([]))
    ),
    policyViolations: S.Array(WorkerEvalPolicyViolation).pipe(
      S.withConstructorDefault(Effect.succeed([])),
      S.withDecodingDefaultKey(Effect.succeed([]))
    ),
    summary: WorkerEvalSummary,
  },
  $I.annote("WorkerEvalReport", {
    description: "Internal minimal nested JSDoc worker eval report.",
  })
) {}

class RunpodWorkerCleanup extends S.Class<RunpodWorkerCleanup>($I`RunpodWorkerCleanup`)(
  {
    deleteStatus: S.String,
    stopStatus: S.String,
  },
  $I.annote("RunpodWorkerCleanup", {
    description: "Internal Runpod worker cleanup status wrapper.",
  })
) {}

class RunpodWorkerOtlp extends S.Class<RunpodWorkerOtlp>($I`RunpodWorkerOtlp`)(
  {
    status: S.String,
  },
  $I.annote("RunpodWorkerOtlp", {
    description: "Internal Runpod worker OTLP export status wrapper.",
  })
) {}

class RunpodWorkerEvalReport extends S.Class<RunpodWorkerEvalReport>($I`RunpodWorkerEvalReport`)(
  {
    cleanup: RunpodWorkerCleanup,
    otlp: RunpodWorkerOtlp,
    workerEval: WorkerEvalReport,
  },
  $I.annote("RunpodWorkerEvalReport", {
    description: "Internal minimal Runpod worker-eval wrapper report.",
  })
) {}

class WorkerEvalManifestEvidence extends S.Class<WorkerEvalManifestEvidence>($I`WorkerEvalManifestEvidence`)(
  {
    raw: S.String,
  },
  $I.annote("WorkerEvalManifestEvidence", {
    description: "Internal initiative manifest evidence row used to resolve the latest worker-eval report.",
  })
) {}

class WorkerEvalManifest extends S.Class<WorkerEvalManifest>($I`WorkerEvalManifest`)(
  {
    evidence: S.Array(WorkerEvalManifestEvidence),
  },
  $I.annote("WorkerEvalManifest", {
    description: "Internal JSDoc worker-eval manifest shape used by the agent-effectiveness default.",
  })
) {}

class PhoenixGraphqlProjectNode extends S.Class<PhoenixGraphqlProjectNode>($I`PhoenixGraphqlProjectNode`)(
  {
    hasTraces: S.Boolean,
    name: S.String,
    recordCount: S.Number,
    spanAnnotationNames: S.Array(S.String),
    sessionAnnotationNames: S.Array(S.String),
    traceAnnotationsNames: S.Array(S.String),
    traceCount: S.Number,
  },
  $I.annote("PhoenixGraphqlProjectNode", {
    description: "Internal Phoenix GraphQL project node.",
  })
) {}

class PhoenixGraphqlProjectEdge extends S.Class<PhoenixGraphqlProjectEdge>($I`PhoenixGraphqlProjectEdge`)(
  {
    node: PhoenixGraphqlProjectNode,
  },
  $I.annote("PhoenixGraphqlProjectEdge", {
    description: "Internal Phoenix GraphQL project edge.",
  })
) {}

class PhoenixGraphqlProjectsConnection extends S.Class<PhoenixGraphqlProjectsConnection>(
  $I`PhoenixGraphqlProjectsConnection`
)(
  {
    edges: S.Array(PhoenixGraphqlProjectEdge),
  },
  $I.annote("PhoenixGraphqlProjectsConnection", {
    description: "Internal Phoenix GraphQL projects connection.",
  })
) {}

class PhoenixGraphqlServerStatus extends S.Class<PhoenixGraphqlServerStatus>($I`PhoenixGraphqlServerStatus`)(
  {
    insufficientStorage: S.Boolean,
  },
  $I.annote("PhoenixGraphqlServerStatus", {
    description: "Internal Phoenix GraphQL server status.",
  })
) {}

class PhoenixGraphqlData extends S.Class<PhoenixGraphqlData>($I`PhoenixGraphqlData`)(
  {
    datasetCount: S.Number,
    evaluatorCount: S.Number,
    projectCount: S.Number,
    projects: PhoenixGraphqlProjectsConnection,
    promptCount: S.Number,
    serverStatus: PhoenixGraphqlServerStatus,
  },
  $I.annote("PhoenixGraphqlData", {
    description: "Internal Phoenix GraphQL inventory data payload.",
  })
) {}

class PhoenixGraphqlResponse extends S.Class<PhoenixGraphqlResponse>($I`PhoenixGraphqlResponse`)(
  {
    data: PhoenixGraphqlData,
  },
  $I.annote("PhoenixGraphqlResponse", {
    description: "Internal Phoenix GraphQL inventory response.",
  })
) {}

const decodeSourceCoverageRows = S.decodeUnknownEffect(S.Array(SourceCoverageRow));
const decodeForwarderSummaryRows = S.decodeUnknownEffect(S.Array(ForwarderSummaryRow));
const decodeScorecardSummaryRows = S.decodeUnknownEffect(S.Array(ScorecardSummaryRow));
const decodeCountRows = S.decodeUnknownEffect(S.Array(CountRow));
const decodeOutcomeLabelAnnotationRows = S.decodeUnknownEffect(S.Array(OutcomeLabelAnnotationRow));
const decodeBenchmarkRunAnnotationRows = S.decodeUnknownEffect(S.Array(BenchmarkRunAnnotationRow));
const decodeWorkerEvalManifestJson = S.decodeUnknownEffect(S.fromJsonString(WorkerEvalManifest));
const decodeRunpodWorkerEvalReportJson = S.decodeUnknownEffect(S.fromJsonString(RunpodWorkerEvalReport));
const decodePhoenixGraphqlResponse = S.decodeUnknownEffect(PhoenixGraphqlResponse);
const encodeDoctorReportJson = S.encodeUnknownEffect(S.fromJsonString(AgentEffectivenessDoctorReport));
const encodeAnnotationPlanJson = S.encodeUnknownEffect(S.fromJsonString(AgentEffectivenessAnnotationPlan));
const encodeAnnotationCheckJson = S.encodeUnknownEffect(S.fromJsonString(AgentEffectivenessAnnotationCheckReport));
const decodeCoverageGapsJson = S.decodeUnknownEffect(S.fromJsonString(S.Array(S.String)));
const currentIsoTimestamp = DateTime.now.pipe(Effect.map(DateTime.formatIso));

const sectionStatus = (
  status: AgentEffectivenessStatus,
  label: string,
  message: string
): {
  readonly failures: ReadonlyArray<string>;
  readonly unavailable: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
} => {
  if (status === AgentEffectivenessStatus.Enum.failed) {
    return { failures: [`${label}: ${message}`], unavailable: [], warnings: [] };
  }

  if (status === AgentEffectivenessStatus.Enum.unavailable) {
    return { failures: [], unavailable: [`${label}: ${message}`], warnings: [] };
  }

  if (status === AgentEffectivenessStatus.Enum.warning) {
    return { failures: [], unavailable: [], warnings: [`${label}: ${message}`] };
  }

  return { failures: [], unavailable: [], warnings: [] };
};

const aggregateSummary = (
  sections: ReadonlyArray<{
    readonly label: string;
    readonly message: string;
    readonly status: AgentEffectivenessStatus;
  }>
): AgentEffectivenessDoctorSummary => {
  const folded = pipe(
    sections,
    A.reduce(
      { failures: A.empty<string>(), unavailable: A.empty<string>(), warnings: A.empty<string>() },
      (acc, section) => {
        const current = sectionStatus(section.status, section.label, section.message);
        return {
          failures: [...acc.failures, ...current.failures],
          unavailable: [...acc.unavailable, ...current.unavailable],
          warnings: [...acc.warnings, ...current.warnings],
        };
      }
    )
  );

  const status = A.isReadonlyArrayNonEmpty(folded.failures)
    ? AgentEffectivenessStatus.Enum.failed
    : A.isReadonlyArrayNonEmpty(folded.warnings) || A.isReadonlyArrayNonEmpty(folded.unavailable)
      ? AgentEffectivenessStatus.Enum.warning
      : AgentEffectivenessStatus.Enum.passed;

  return new AgentEffectivenessDoctorSummary({ ...folded, status });
};

const firstOrNull: <A>(values: ReadonlyArray<A>) => A | null = flow(A.head, O.getOrNull);

const dataRootDuckDbPath = (dataRoot: string): string => `${dataRoot}/derived/ai-metrics.duckdb`;
const normalizePathSeparators = Str.replace(/\\/gu, "/");
const isWorkerEvalManifestPath = flow(normalizePathSeparators, Str.endsWith("/ops/manifest.json"));
const normalizeAnnotationIdSuffix = flow(Str.replace(/[^A-Za-z0-9._-]+/gu, "-"), Str.replace(/^-+|-+$/gu, ""));

const annotationIdSuffixPart = (value: string): string => {
  const normalized = normalizeAnnotationIdSuffix(value);
  return Str.isNonEmpty(normalized) ? normalized : "value";
};

const readJsonFile = Effect.fn("AiMetrics.agentEffectiveness.readJsonFile")(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.resolve(filePath);
  return yield* fs.readFileString(absolutePath);
});

const latestWorkerEvalRawPath = (manifest: WorkerEvalManifest): O.Option<string> =>
  pipe(
    manifest.evidence,
    A.findLast((entry) => Str.endsWith(".json")(entry.raw) && Str.includes("worker-eval")(entry.raw)),
    O.map((entry) => entry.raw)
  );

const resolveWorkerEvalReportPath = Effect.fn("AiMetrics.agentEffectiveness.resolveWorkerEvalReportPath")(function* (
  workerEvalReportPath: string
) {
  const path = yield* Path.Path;
  const absolutePath = path.resolve(workerEvalReportPath);
  if (!isWorkerEvalManifestPath(absolutePath)) {
    return absolutePath;
  }

  const manifest = yield* readJsonFile(absolutePath).pipe(Effect.flatMap(decodeWorkerEvalManifestJson), Effect.option);
  if (manifest._tag === "None") {
    return absolutePath;
  }

  return pipe(
    latestWorkerEvalRawPath(manifest.value),
    O.map((rawPath) => path.resolve(path.dirname(path.dirname(absolutePath)), rawPath)),
    O.getOrElse(() => absolutePath)
  );
});

const buildPhoenixUnavailable = (
  input: AgentEffectivenessDoctorInput,
  message: string
): AgentEffectivenessPhoenixSection =>
  new AgentEffectivenessPhoenixSection({
    baseUrl: input.phoenixBaseUrl,
    datasetCount: 0,
    evaluatorCount: 0,
    message,
    projectCount: 0,
    projects: [],
    promptCount: 0,
    serverInsufficientStorage: false,
    status: AgentEffectivenessStatus.Enum.unavailable,
    version: null,
  });

const probePhoenix = Effect.fn("AiMetrics.agentEffectiveness.probePhoenix")(function* (
  input: AgentEffectivenessDoctorInput
) {
  if (input.noPhoenix) {
    return buildPhoenixUnavailable(input, "Phoenix probe disabled by --no-phoenix.");
  }

  const client = yield* HttpClient.HttpClient;
  const root = yield* client.get(input.phoenixBaseUrl).pipe(Effect.option);
  const projects = yield* client.get(`${input.phoenixBaseUrl}/projects`).pipe(Effect.option);

  if (root._tag === "None" || projects._tag === "None") {
    return buildPhoenixUnavailable(input, "Phoenix endpoint was not reachable.");
  }

  if (
    root.value.status < 200 ||
    root.value.status >= 400 ||
    projects.value.status < 200 ||
    projects.value.status >= 400
  ) {
    return buildPhoenixUnavailable(input, "Phoenix endpoint returned a non-success status.");
  }

  const request = yield* HttpClientRequest.bodyJson(HttpClientRequest.post(`${input.phoenixBaseUrl}/graphql`), {
    query: phoenixInventoryQuery,
  }).pipe(Effect.option);

  if (request._tag === "None") {
    return buildPhoenixUnavailable(input, "Phoenix GraphQL request could not be encoded.");
  }

  const response = yield* client
    .execute(pipe(request.value, HttpClientRequest.accept("application/json")))
    .pipe(Effect.option);

  if (response._tag === "None" || response.value.status < 200 || response.value.status >= 300) {
    return buildPhoenixUnavailable(input, "Phoenix GraphQL inventory query failed.");
  }

  const inventory = yield* HttpClientResponse.schemaBodyJson(S.Unknown)(response.value).pipe(
    Effect.flatMap(decodePhoenixGraphqlResponse),
    Effect.option
  );

  if (inventory._tag === "None") {
    return buildPhoenixUnavailable(input, "Phoenix GraphQL inventory response could not be decoded.");
  }

  const version =
    root.value.headers["x-phoenix-server-version"] ?? projects.value.headers["x-phoenix-server-version"] ?? null;
  const data = inventory.value.data;
  const projectsList = pipe(
    data.projects.edges,
    A.map(
      (edge) =>
        new AgentEffectivenessPhoenixProject({
          hasTraces: edge.node.hasTraces,
          name: edge.node.name,
          recordCount: edge.node.recordCount,
          spanAnnotationNames: edge.node.spanAnnotationNames,
          sessionAnnotationNames: edge.node.sessionAnnotationNames,
          traceAnnotationNames: edge.node.traceAnnotationsNames,
          traceCount: edge.node.traceCount,
        })
    )
  );
  const hasTraceBearingProject = pipe(
    projectsList,
    A.some((project) => project.hasTraces)
  );

  return new AgentEffectivenessPhoenixSection({
    baseUrl: input.phoenixBaseUrl,
    datasetCount: data.datasetCount,
    evaluatorCount: data.evaluatorCount,
    message: hasTraceBearingProject
      ? "Phoenix is reachable and has trace-bearing projects."
      : "Phoenix is reachable but no trace-bearing projects were reported.",
    projectCount: data.projectCount,
    projects: projectsList,
    promptCount: data.promptCount,
    serverInsufficientStorage: data.serverStatus.insufficientStorage,
    status:
      data.serverStatus.insufficientStorage || !hasTraceBearingProject
        ? AgentEffectivenessStatus.Enum.warning
        : AgentEffectivenessStatus.Enum.passed,
    version,
  });
});

const queryAiMetricsSection = Effect.fn("AiMetrics.agentEffectiveness.queryAiMetricsSection")(function* (
  input: AgentEffectivenessDoctorInput,
  duckDbPath: string
) {
  const duckdb = yield* DuckDb;
  const sourceRows = yield* duckdb
    .query(
      `SELECT source_kind AS "sourceKind",
              count(*)::INTEGER AS "sourceFileCount",
              sum(total_lines)::INTEGER AS "totalLines",
              sum(accepted_events)::INTEGER AS "acceptedEvents",
              sum(rejected_lines)::INTEGER AS "rejectedLines",
              max(last_timestamp) AS "lastTimestamp"
         FROM ai_metrics_source_files
        GROUP BY source_kind
        ORDER BY source_kind`
    )
    .pipe(Effect.flatMap(decodeSourceCoverageRows));
  const forwarderRows = yield* duckdb
    .query(
      `SELECT ingest_run_id AS "ingestRunId",
              target AS "target",
              config_snapshot_id AS "configSnapshotId",
              completed_at_epoch_ms::DOUBLE AS "completedAtEpochMillis",
              source_file_count::INTEGER AS "sourceFileCount",
              archive_object_count::INTEGER AS "archiveObjectCount",
              turn_count::INTEGER AS "turnCount"
         FROM ai_metrics_ingest_runs
        ORDER BY completed_at_epoch_ms DESC
        LIMIT 1`
    )
    .pipe(Effect.flatMap(decodeForwarderSummaryRows));
  const scorecardRows = yield* duckdb
    .query(
      `SELECT scorecard_id AS "scorecardId",
              config_snapshot_id AS "configSnapshotId",
              window_start_epoch_ms::DOUBLE AS "windowStartEpochMillis",
              window_end_epoch_ms::DOUBLE AS "windowEndEpochMillis",
              total_score::DOUBLE AS "totalScore",
              task_count::INTEGER AS "taskCount",
              label_count::INTEGER AS "labelCount",
              benchmark_run_count::INTEGER AS "benchmarkRunCount",
              completion_ready AS "completionReady",
              coverage_gaps_json AS "coverageGapsJson"
         FROM ai_metrics_scorecards
        ORDER BY window_end_epoch_ms DESC
        LIMIT 1`
    )
    .pipe(Effect.flatMap(decodeScorecardSummaryRows));
  const labelCountRows = yield* duckdb
    .query(`SELECT count(*)::INTEGER AS "count" FROM ai_metrics_outcome_labels`)
    .pipe(Effect.flatMap(decodeCountRows));
  const benchmarkCountRows = yield* duckdb
    .query(`SELECT count(*)::INTEGER AS "count" FROM ai_metrics_benchmark_runs`)
    .pipe(Effect.flatMap(decodeCountRows));

  const latestScorecard = firstOrNull(scorecardRows);
  const coverageGaps =
    latestScorecard === null
      ? []
      : yield* decodeCoverageGapsJson(latestScorecard.coverageGapsJson).pipe(
          Effect.orElseSucceed(() => ["invalid_coverage_gaps_json"])
        );
  const scorecard =
    latestScorecard === null
      ? null
      : new AgentEffectivenessScorecardSummary({
          benchmarkRunCount: latestScorecard.benchmarkRunCount,
          completionReady: latestScorecard.completionReady,
          configSnapshotId: latestScorecard.configSnapshotId,
          coverageGaps,
          labelCount: latestScorecard.labelCount,
          scorecardId: latestScorecard.scorecardId,
          taskCount: latestScorecard.taskCount,
          totalScore: latestScorecard.totalScore,
          windowEndEpochMillis: latestScorecard.windowEndEpochMillis,
          windowStartEpochMillis: latestScorecard.windowStartEpochMillis,
        });
  const sourceCoverage = pipe(
    sourceRows,
    A.map(
      (row) =>
        new AgentEffectivenessSourceCoverage({
          acceptedEvents: row.acceptedEvents,
          lastTimestamp: row.lastTimestamp,
          rejectedLines: row.rejectedLines,
          sourceFileCount: row.sourceFileCount,
          sourceKind: row.sourceKind,
          totalLines: row.totalLines,
        })
    )
  );
  const latestForwarderRow = firstOrNull(forwarderRows);
  const latestForwarder =
    latestForwarderRow === null
      ? null
      : new AgentEffectivenessForwarderSummary({
          archiveObjectCount: latestForwarderRow.archiveObjectCount,
          completedAtEpochMillis: latestForwarderRow.completedAtEpochMillis,
          configSnapshotId: latestForwarderRow.configSnapshotId,
          ingestRunId: latestForwarderRow.ingestRunId,
          sourceFileCount: latestForwarderRow.sourceFileCount,
          target: latestForwarderRow.target,
          turnCount: latestForwarderRow.turnCount,
        });
  const labelCount = firstOrNull(labelCountRows)?.count ?? 0;
  const benchmarkRunCount = firstOrNull(benchmarkCountRows)?.count ?? 0;
  const unavailableMetrics = ["provider_model_token_cost"];
  const missingCore = latestForwarder === null || scorecard === null || A.isReadonlyArrayEmpty(sourceCoverage);
  const readinessWarnings =
    scorecard === null
      ? ["no_scorecard"]
      : [
          ...(scorecard.completionReady ? [] : ["scorecard_not_completion_ready"]),
          ...(scorecard.labelCount > 0 ? [] : ["no_labels"]),
          ...(scorecard.benchmarkRunCount > 0 ? [] : ["no_benchmark_runs"]),
          ...scorecard.coverageGaps,
        ];

  return new AgentEffectivenessAiMetricsSection({
    benchmarkRunCount,
    dataRoot: input.dataRoot,
    derivedDuckDbPath: duckDbPath,
    labelCount,
    latestForwarder,
    latestScorecard: scorecard,
    message: missingCore
      ? "AI-metrics derived storage is present but core evidence is incomplete."
      : A.isReadonlyArrayNonEmpty(readinessWarnings)
        ? `AI-metrics evidence is present with readiness warnings: ${A.join(readinessWarnings, ", ")}.`
        : "AI-metrics derived evidence is present and completion-ready.",
    sourceCoverage,
    status:
      missingCore || A.isReadonlyArrayNonEmpty(readinessWarnings)
        ? AgentEffectivenessStatus.Enum.warning
        : AgentEffectivenessStatus.Enum.passed,
    unavailableMetrics,
  });
});

const buildAiMetricsSection = Effect.fn("AiMetrics.agentEffectiveness.buildAiMetricsSection")(function* (
  input: AgentEffectivenessDoctorInput
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const duckDbPath = path.resolve(dataRootDuckDbPath(input.dataRoot));
  const exists = yield* fs.exists(duckDbPath).pipe(Effect.orElseSucceed(() => false));

  if (!exists) {
    return new AgentEffectivenessAiMetricsSection({
      benchmarkRunCount: 0,
      dataRoot: input.dataRoot,
      derivedDuckDbPath: duckDbPath,
      labelCount: 0,
      latestForwarder: null,
      latestScorecard: null,
      message: "AI-metrics DuckDB evidence was not found at the selected data root.",
      sourceCoverage: [],
      status: AgentEffectivenessStatus.Enum.unavailable,
      unavailableMetrics: ["provider_model_token_cost"],
    });
  }

  return yield* queryAiMetricsSection(input, duckDbPath).pipe(
    Effect.catch(() =>
      Effect.succeed(
        new AgentEffectivenessAiMetricsSection({
          benchmarkRunCount: 0,
          dataRoot: input.dataRoot,
          derivedDuckDbPath: duckDbPath,
          labelCount: 0,
          latestForwarder: null,
          latestScorecard: null,
          message: "AI-metrics DuckDB evidence could not be queried.",
          sourceCoverage: [],
          status: AgentEffectivenessStatus.Enum.unavailable,
          unavailableMetrics: ["provider_model_token_cost"],
        })
      )
    )
  );
});

const buildJsdocWorkerSection = Effect.fn("AiMetrics.agentEffectiveness.buildJsdocWorkerSection")(function* (
  input: AgentEffectivenessDoctorInput
) {
  const fs = yield* FileSystem.FileSystem;
  const reportPath = yield* resolveWorkerEvalReportPath(input.workerEvalReportPath);
  const exists = yield* fs.exists(reportPath).pipe(Effect.orElseSucceed(() => false));

  if (!exists) {
    return new AgentEffectivenessJsdocWorkerSection({
      cleanupDeleteStatus: null,
      cleanupStopStatus: null,
      completedPackets: 0,
      failedPackets: 0,
      message: "JSDoc worker-eval report was not found.",
      otlpStatus: null,
      policyViolationCodes: [],
      reportPath,
      selectedPackets: 0,
      status: AgentEffectivenessStatus.Enum.unavailable,
      timedOutPackets: 0,
    });
  }

  const decoded = yield* readJsonFile(reportPath).pipe(Effect.flatMap(decodeRunpodWorkerEvalReportJson), Effect.option);

  if (decoded._tag === "None") {
    return new AgentEffectivenessJsdocWorkerSection({
      cleanupDeleteStatus: null,
      cleanupStopStatus: null,
      completedPackets: 0,
      failedPackets: 0,
      message: "JSDoc worker-eval report could not be decoded.",
      otlpStatus: null,
      policyViolationCodes: [],
      reportPath,
      selectedPackets: 0,
      status: AgentEffectivenessStatus.Enum.unavailable,
      timedOutPackets: 0,
    });
  }

  const summary = decoded.value.workerEval.summary;
  const policyViolationCodes = pipe(
    [
      ...pipe(
        decoded.value.workerEval.policyViolations,
        A.map((violation) => (P.isString(violation) ? violation : violation.code))
      ),
      ...pipe(
        decoded.value.workerEval.packets,
        A.flatMap((packet) => packet.policyViolationCodes)
      ),
    ],
    A.dedupe
  );
  const hasFailures = summary.failed > 0 || summary.timedOut > 0;
  const hasWarnings = A.isReadonlyArrayNonEmpty(policyViolationCodes);

  return new AgentEffectivenessJsdocWorkerSection({
    cleanupDeleteStatus: decoded.value.cleanup.deleteStatus,
    cleanupStopStatus: decoded.value.cleanup.stopStatus,
    completedPackets: summary.completed,
    failedPackets: summary.failed,
    message: hasFailures
      ? "JSDoc worker-eval contains failed or timed-out packets."
      : hasWarnings
        ? `JSDoc worker-eval completed with policy warnings: ${A.join(policyViolationCodes, ", ")}.`
        : "JSDoc worker-eval completed without policy violations.",
    otlpStatus: decoded.value.otlp.status,
    policyViolationCodes,
    reportPath,
    selectedPackets: summary.selectedPackets,
    status: hasFailures
      ? AgentEffectivenessStatus.Enum.failed
      : hasWarnings
        ? AgentEffectivenessStatus.Enum.warning
        : AgentEffectivenessStatus.Enum.passed,
    timedOutPackets: summary.timedOut,
  });
});

/**
 * Build the report-only Phase 1 agent-effectiveness doctor report.
 *
 * @example
 * ```ts
 * import { makeAgentEffectivenessDoctorReport } from "@beep/repo-ai-metrics"
 * console.log(makeAgentEffectivenessDoctorReport)
 * ```
 * @category services
 * @since 0.0.0
 */
export const makeAgentEffectivenessDoctorReport: (
  input?: AgentEffectivenessDoctorInput
) => Effect.Effect<
  AgentEffectivenessDoctorReport,
  never,
  DuckDb | FileSystem.FileSystem | HttpClient.HttpClient | Path.Path
> = Effect.fn("AiMetrics.makeAgentEffectivenessDoctorReport")(function* (
  input: AgentEffectivenessDoctorInput = new AgentEffectivenessDoctorInput({})
) {
  const [phoenix, aiMetrics, jsdocWorkerEval] = yield* Effect.all(
    [probePhoenix(input), buildAiMetricsSection(input), buildJsdocWorkerSection(input)] as const,
    { concurrency: 3 }
  );
  const summary = aggregateSummary([
    { label: "phoenix", message: phoenix.message, status: phoenix.status },
    { label: "aiMetrics", message: aiMetrics.message, status: aiMetrics.status },
    { label: "jsdocWorkerEval", message: jsdocWorkerEval.message, status: jsdocWorkerEval.status },
  ]);
  const generatedAt = yield* currentIsoTimestamp;

  return new AgentEffectivenessDoctorReport({
    aiMetrics,
    dataRoot: input.dataRoot,
    generatedAt,
    jsdocWorkerEval,
    phoenix,
    schemaVersion: "agent-effectiveness-doctor/v1",
    summary,
    target: input.target,
  });
});

const annotation = ({
  idSuffix,
  metadata = {},
  name,
  optimization,
  source,
  targetKind,
  targetRef,
  value,
}: {
  readonly idSuffix?: string;
  readonly metadata?: Record<string, string>;
  readonly name: string;
  readonly optimization: string;
  readonly source: string;
  readonly targetKind: string;
  readonly targetRef: string;
  readonly value: AgentEffectivenessAnnotationValue;
}): AgentEffectivenessPlannedAnnotation => {
  const baseAnnotationId = `${source}:${targetKind}:${targetRef}:${name}`;
  const annotationId = pipe(
    O.fromUndefinedOr(idSuffix),
    O.map((suffix) => `${baseAnnotationId}:${annotationIdSuffixPart(suffix)}`),
    O.getOrElse(() => baseAnnotationId)
  );
  return new AgentEffectivenessPlannedAnnotation({
    annotationId,
    metadata,
    name,
    optimization,
    source,
    targetKind,
    targetRef,
    value,
  });
};

const sourceCoverageAnnotations = (
  doctor: AgentEffectivenessDoctorReport
): ReadonlyArray<AgentEffectivenessPlannedAnnotation> =>
  pipe(
    doctor.aiMetrics.sourceCoverage,
    A.flatMap((coverage) => [
      annotation({
        metadata: { sourceKind: coverage.sourceKind },
        name: "agent.source.file_count",
        optimization: "maximize",
        source: "ai-metrics",
        targetKind: "source",
        targetRef: coverage.sourceKind,
        value: coverage.sourceFileCount,
      }),
      annotation({
        metadata: { sourceKind: coverage.sourceKind },
        name: "agent.source.accepted_events",
        optimization: "maximize",
        source: "ai-metrics",
        targetKind: "source",
        targetRef: coverage.sourceKind,
        value: coverage.acceptedEvents,
      }),
    ])
  );

const scorecardAnnotations = (
  doctor: AgentEffectivenessDoctorReport
): ReadonlyArray<AgentEffectivenessPlannedAnnotation> => {
  const scorecard = doctor.aiMetrics.latestScorecard;
  if (scorecard === null) {
    return [];
  }

  return [
    annotation({
      metadata: { configSnapshotId: scorecard.configSnapshotId },
      name: "scorecard.completion_ready",
      optimization: "maximize",
      source: "ai-metrics",
      targetKind: "scorecard",
      targetRef: scorecard.scorecardId,
      value: scorecard.completionReady,
    }),
    annotation({
      metadata: { configSnapshotId: scorecard.configSnapshotId },
      name: "scorecard.total_score",
      optimization: "maximize",
      source: "ai-metrics",
      targetKind: "scorecard",
      targetRef: scorecard.scorecardId,
      value: scorecard.totalScore,
    }),
    ...pipe(
      scorecard.coverageGaps,
      A.map((gap) =>
        annotation({
          idSuffix: gap,
          metadata: { gap },
          name: "scorecard.gap",
          optimization: "minimize",
          source: "ai-metrics",
          targetKind: "scorecard",
          targetRef: scorecard.scorecardId,
          value: gap,
        })
      )
    ),
  ];
};

const workerAnnotations = (
  doctor: AgentEffectivenessDoctorReport
): ReadonlyArray<AgentEffectivenessPlannedAnnotation> => [
  annotation({
    metadata: { reportPathHash: "repo-relative-jsdoc-worker-eval-report" },
    name: "worker.completed_packets",
    optimization: "maximize",
    source: "jsdoc-worker-eval",
    targetKind: "worker-report",
    targetRef: "jsdoc-worker-eval-latest",
    value: doctor.jsdocWorkerEval.completedPackets,
  }),
  annotation({
    metadata: { reportPathHash: "repo-relative-jsdoc-worker-eval-report" },
    name: "worker.failed_packets",
    optimization: "minimize",
    source: "jsdoc-worker-eval",
    targetKind: "worker-report",
    targetRef: "jsdoc-worker-eval-latest",
    value: doctor.jsdocWorkerEval.failedPackets,
  }),
  ...pipe(
    doctor.jsdocWorkerEval.policyViolationCodes,
    A.map((code) =>
      annotation({
        idSuffix: code,
        metadata: { code },
        name: "worker.policy_violation",
        optimization: "minimize",
        source: "jsdoc-worker-eval",
        targetKind: "worker-report",
        targetRef: "jsdoc-worker-eval-latest",
        value: code,
      })
    )
  ),
];

const loopHealthAnnotations = (
  doctor: AgentEffectivenessDoctorReport
): ReadonlyArray<AgentEffectivenessPlannedAnnotation> => [
  annotation({
    name: "agent.loop.status",
    optimization: "maximize",
    source: "agent-effectiveness-doctor",
    targetKind: "loop",
    targetRef: "phase1",
    value: doctor.summary.status,
  }),
  annotation({
    name: "agent.loop.warning_count",
    optimization: "minimize",
    source: "agent-effectiveness-doctor",
    targetKind: "loop",
    targetRef: "phase1",
    value: A.length(doctor.summary.warnings),
  }),
  annotation({
    name: "agent.loop.unavailable_count",
    optimization: "minimize",
    source: "agent-effectiveness-doctor",
    targetKind: "loop",
    targetRef: "phase1",
    value: A.length(doctor.summary.unavailable),
  }),
];

const queryAnnotationRows = Effect.fn("AiMetrics.agentEffectiveness.queryAnnotationRows")(function* (
  input: AgentEffectivenessAnnotationPlanInput,
  doctor: AgentEffectivenessDoctorReport
) {
  if (doctor.aiMetrics.status === AgentEffectivenessStatus.Enum.unavailable) {
    return A.empty<AgentEffectivenessPlannedAnnotation>();
  }

  const duckdb = yield* DuckDb;
  const labelRows = yield* duckdb
    .query(
      `SELECT label_id AS "labelId",
              agent_task_id AS "agentTaskId",
              rating::DOUBLE AS "rating",
              passed AS "passed",
              quality_gate AS "qualityGate",
              intervention_count::INTEGER AS "interventionCount",
              follow_up_fix AS "followUpFix"
         FROM ai_metrics_outcome_labels
        ORDER BY labeled_at_epoch_ms DESC
        LIMIT $limit`,
      { limit: input.annotationLimit }
    )
    .pipe(Effect.flatMap(decodeOutcomeLabelAnnotationRows));
  const benchmarkRows = yield* duckdb
    .query(
      `SELECT benchmark_run_id AS "benchmarkRunId",
              benchmark_case_id AS "benchmarkCaseId",
              config_snapshot_id AS "configSnapshotId",
              elapsed_ms::DOUBLE AS "elapsedMs",
              passed AS "passed",
              quality_gate AS "qualityGate"
         FROM ai_metrics_benchmark_runs
        ORDER BY recorded_at_epoch_ms DESC
        LIMIT $limit`,
      { limit: input.annotationLimit }
    )
    .pipe(Effect.flatMap(decodeBenchmarkRunAnnotationRows));
  const labelAnnotations = pipe(
    labelRows,
    A.flatMap((row) => [
      annotation({
        metadata: { labelId: row.labelId, qualityGate: row.qualityGate },
        name: "agent.outcome.passed",
        optimization: "maximize",
        source: "ai-metrics",
        targetKind: "agent-task",
        targetRef: row.agentTaskId,
        value: row.passed,
      }),
      annotation({
        metadata: { labelId: row.labelId, qualityGate: row.qualityGate },
        name: "agent.outcome.rating",
        optimization: "maximize",
        source: "ai-metrics",
        targetKind: "agent-task",
        targetRef: row.agentTaskId,
        value: row.rating,
      }),
      annotation({
        metadata: { labelId: row.labelId, qualityGate: row.qualityGate },
        name: "agent.interventions",
        optimization: "minimize",
        source: "ai-metrics",
        targetKind: "agent-task",
        targetRef: row.agentTaskId,
        value: row.interventionCount,
      }),
      annotation({
        metadata: { labelId: row.labelId, qualityGate: row.qualityGate },
        name: "agent.follow_up_fix",
        optimization: "minimize",
        source: "ai-metrics",
        targetKind: "agent-task",
        targetRef: row.agentTaskId,
        value: row.followUpFix,
      }),
    ])
  );
  const benchmarkAnnotations = pipe(
    benchmarkRows,
    A.flatMap((row) => [
      annotation({
        metadata: { benchmarkCaseId: row.benchmarkCaseId, configSnapshotId: row.configSnapshotId },
        name: "benchmark.passed",
        optimization: "maximize",
        source: "ai-metrics",
        targetKind: "benchmark-run",
        targetRef: row.benchmarkRunId,
        value: row.passed,
      }),
      annotation({
        metadata: { benchmarkCaseId: row.benchmarkCaseId, configSnapshotId: row.configSnapshotId },
        name: "benchmark.elapsed_ms",
        optimization: "minimize",
        source: "ai-metrics",
        targetKind: "benchmark-run",
        targetRef: row.benchmarkRunId,
        value: row.elapsedMs,
      }),
    ])
  );

  return [...labelAnnotations, ...benchmarkAnnotations];
});

/**
 * Build a sanitized local-only annotation plan.
 *
 * @example
 * ```ts
 * import { makeAgentEffectivenessAnnotationPlan } from "@beep/repo-ai-metrics"
 * console.log(makeAgentEffectivenessAnnotationPlan)
 * ```
 * @category services
 * @since 0.0.0
 */
export const makeAgentEffectivenessAnnotationPlan: (
  input?: AgentEffectivenessAnnotationPlanInput
) => Effect.Effect<
  AgentEffectivenessAnnotationPlan,
  never,
  DuckDb | FileSystem.FileSystem | HttpClient.HttpClient | Path.Path
> = Effect.fn("AiMetrics.makeAgentEffectivenessAnnotationPlan")(function* (
  input: AgentEffectivenessAnnotationPlanInput = new AgentEffectivenessAnnotationPlanInput({})
) {
  const doctor = yield* makeAgentEffectivenessDoctorReport(input.doctor);
  const storageAnnotations = yield* queryAnnotationRows(input, doctor).pipe(Effect.orElseSucceed(() => []));
  const annotations = [
    ...loopHealthAnnotations(doctor),
    ...sourceCoverageAnnotations(doctor),
    ...scorecardAnnotations(doctor),
    ...workerAnnotations(doctor),
    ...storageAnnotations,
  ];
  const generatedAt = yield* currentIsoTimestamp;

  return new AgentEffectivenessAnnotationPlan({
    annotations,
    doctor,
    generatedAt,
    mutationPolicy: "local-only-no-phoenix-mutation",
    schemaVersion: "agent-effectiveness-annotation-plan/v1",
    summary: doctor.summary,
  });
});

const forbiddenPatterns = [
  { code: "private-home-path", pattern: /\/home\/[A-Za-z0-9_.-]+/u },
  { code: "onepassword-ref", pattern: /op:\/\//u },
  { code: "secret-shaped-value", pattern: /(SECRET|TOKEN|API[_-]?KEY|sk-[A-Za-z0-9_-]{12,})/iu },
  { code: "raw-worker-draft", pattern: /draftJsDoc|@example|```ts/u },
] as const;

const checkText = (annotationId: string, value: string): ReadonlyArray<AgentEffectivenessAnnotationCheckFinding> =>
  pipe(
    forbiddenPatterns,
    A.filter((entry) => entry.pattern.test(value)),
    A.map(
      (entry) =>
        new AgentEffectivenessAnnotationCheckFinding({
          annotationId,
          code: entry.code,
          message: `Annotation contains forbidden ${entry.code} content.`,
        })
    )
  );

const checkAnnotation = (
  annotation: AgentEffectivenessPlannedAnnotation
): ReadonlyArray<AgentEffectivenessAnnotationCheckFinding> => {
  const metadataFindings = pipe(
    R.toEntries(annotation.metadata),
    A.flatMap(([key, value]) => [
      ...checkText(annotation.annotationId, key),
      ...checkText(annotation.annotationId, value),
    ])
  );
  const valueFindings = P.isString(annotation.value) ? checkText(annotation.annotationId, annotation.value) : [];
  return [
    ...checkText(annotation.annotationId, annotation.annotationId),
    ...checkText(annotation.annotationId, annotation.name),
    ...checkText(annotation.annotationId, annotation.source),
    ...checkText(annotation.annotationId, annotation.targetKind),
    ...checkText(annotation.annotationId, annotation.targetRef),
    ...metadataFindings,
    ...valueFindings,
  ];
};

const duplicateAnnotationIdFindings = (
  annotations: ReadonlyArray<AgentEffectivenessPlannedAnnotation>
): ReadonlyArray<AgentEffectivenessAnnotationCheckFinding> => {
  let seen = R.empty<string, true>();
  const duplicatedIds = pipe(
    annotations,
    A.filter((annotation) => {
      const duplicated = R.has(seen, annotation.annotationId);
      seen = R.set(seen, annotation.annotationId, true);
      return duplicated;
    }),
    A.map((annotation) => annotation.annotationId),
    A.dedupe
  );
  return pipe(
    duplicatedIds,
    A.map(
      (annotationId) =>
        new AgentEffectivenessAnnotationCheckFinding({
          annotationId,
          code: "duplicate-annotation-id",
          message: "Annotation id must be unique within the local plan.",
        })
    )
  );
};

/**
 * Check a local annotation plan for Phase 1 privacy and schema safety.
 *
 * @param plan - Local annotation plan to inspect for private or forbidden payload fields.
 * @returns Report-only validation summary that never mutates Phoenix or local evidence.
 * @example
 * ```ts
 * import { makeAgentEffectivenessAnnotationCheckReport } from "@beep/repo-ai-metrics"
 * console.log(makeAgentEffectivenessAnnotationCheckReport)
 * ```
 * @category services
 * @since 0.0.0
 */
export const makeAgentEffectivenessAnnotationCheckReport: (
  plan: AgentEffectivenessAnnotationPlan
) => AgentEffectivenessAnnotationCheckReport = (plan) => {
  const findings = [
    ...pipe(plan.annotations, A.flatMap(checkAnnotation)),
    ...duplicateAnnotationIdFindings(plan.annotations),
  ];
  return new AgentEffectivenessAnnotationCheckReport({
    annotationCount: A.length(plan.annotations),
    findings,
    generatedAt: plan.generatedAt,
    schemaVersion: "agent-effectiveness-annotation-check/v1",
    status: A.isReadonlyArrayNonEmpty(findings)
      ? AgentEffectivenessStatus.Enum.failed
      : AgentEffectivenessStatus.Enum.passed,
  });
};

/**
 * Encode a doctor report as JSON.
 *
 * @example
 * ```ts
 * import { agentEffectivenessDoctorReportToJson } from "@beep/repo-ai-metrics"
 * console.log(agentEffectivenessDoctorReportToJson)
 * ```
 * @category encoding
 * @since 0.0.0
 */
export const agentEffectivenessDoctorReportToJson: (
  report: AgentEffectivenessDoctorReport
) => Effect.Effect<string, AgentEffectivenessError> = Effect.fn("AiMetrics.agentEffectivenessDoctorReportToJson")(
  (report) =>
    encodeDoctorReportJson(report).pipe(
      Effect.mapError(
        (cause) =>
          new AgentEffectivenessError({
            cause,
            message: "Failed to encode agent-effectiveness doctor report as JSON.",
          })
      )
    )
);

/**
 * Encode an annotation plan as JSON.
 *
 * @example
 * ```ts
 * import { agentEffectivenessAnnotationPlanToJson } from "@beep/repo-ai-metrics"
 * console.log(agentEffectivenessAnnotationPlanToJson)
 * ```
 * @category encoding
 * @since 0.0.0
 */
export const agentEffectivenessAnnotationPlanToJson: (
  plan: AgentEffectivenessAnnotationPlan
) => Effect.Effect<string, AgentEffectivenessError> = Effect.fn("AiMetrics.agentEffectivenessAnnotationPlanToJson")(
  (plan) =>
    encodeAnnotationPlanJson(plan).pipe(
      Effect.mapError(
        (cause) =>
          new AgentEffectivenessError({
            cause,
            message: "Failed to encode agent-effectiveness annotation plan as JSON.",
          })
      )
    )
);

/**
 * Encode an annotation-check report as JSON.
 *
 * @example
 * ```ts
 * import { agentEffectivenessAnnotationCheckReportToJson } from "@beep/repo-ai-metrics"
 * console.log(agentEffectivenessAnnotationCheckReportToJson)
 * ```
 * @category encoding
 * @since 0.0.0
 */
export const agentEffectivenessAnnotationCheckReportToJson: (
  report: AgentEffectivenessAnnotationCheckReport
) => Effect.Effect<string, AgentEffectivenessError> = Effect.fn(
  "AiMetrics.agentEffectivenessAnnotationCheckReportToJson"
)((report) =>
  encodeAnnotationCheckJson(report).pipe(
    Effect.mapError(
      (cause) =>
        new AgentEffectivenessError({
          cause,
          message: "Failed to encode agent-effectiveness annotation-check report as JSON.",
        })
    )
  )
);
