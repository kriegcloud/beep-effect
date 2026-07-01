/**
 * SDK data-transfer contracts for the Agentic Professional Runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentsUseCasesId } from "@beep/identity/packages";
import { EmailString } from "@beep/schema";
import * as S from "effect/Schema";
import {
  RuntimeActivityType,
  RuntimeApprovalDecision,
  RuntimeCandidateLifecycle,
  RuntimeClaimConfidence,
  RuntimeRequestKind,
  RuntimeSourceKind,
  RuntimeUsageMode,
} from "./ProfessionalRuntime.values.js";

const $I = $AgentsUseCasesId.create("processes/ProfessionalRuntime/ProfessionalRuntime.contracts");

/**
 * Scope for an SDK request.
 *
 * @example
 * ```ts
 * import { RuntimeScope } from "@beep/agents-use-cases/public"
 *
 * const scope = RuntimeScope.make({
 *   organizationId: "org-1",
 *   threadId: "thread-1",
 *   workspaceId: "workspace-1"
 * })
 *
 * console.log(scope.workspaceId) // "workspace-1"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeScope extends S.Class<RuntimeScope>($I`RuntimeScope`)(
  {
    organizationId: S.String,
    threadId: S.String,
    workspaceId: S.String,
  },
  $I.annote("RuntimeScope", {
    description: "Tenant, workspace, and thread scope for an SDK request.",
  })
) {}

/**
 * Lightweight reference to a vertical or runtime entity.
 *
 * @example
 * ```ts
 * import { RuntimeEntityRef } from "@beep/agents-use-cases/public"
 *
 * const household = RuntimeEntityRef.make({
 *   id: "household-park-family",
 *   kind: "household"
 * })
 *
 * console.log(`${household.kind}:${household.id}`)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeEntityRef extends S.Class<RuntimeEntityRef>($I`RuntimeEntityRef`)(
  {
    id: S.String,
    kind: S.String,
  },
  $I.annote("RuntimeEntityRef", {
    description: "Kind/id reference to a vertical or runtime entity.",
  })
) {}

/**
 * Source evidence reference for a candidate output.
 *
 * @example
 * ```ts
 * import { RuntimeEvidenceRef } from "@beep/agents-use-cases/public"
 *
 * const evidence = RuntimeEvidenceRef.make({
 *   artifactId: "email-artifact-001",
 *   spanIds: ["email-001-s2", "email-001-s3"]
 * })
 *
 * console.log(evidence.spanIds?.length) // 2
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeEvidenceRef extends S.Class<RuntimeEvidenceRef>($I`RuntimeEvidenceRef`)(
  {
    artifactId: S.String,
    spanId: S.optionalKey(S.String),
    spanIds: S.Array(S.String).pipe(S.optionalKey),
  },
  $I.annote("RuntimeEvidenceRef", {
    description: "Reference to one or more source spans on an artifact.",
  })
) {}

/**
 * Candidate claim proposed by the runtime.
 *
 * @example
 * ```ts
 * import {
 *   RuntimeCandidateClaim,
 *   RuntimeEntityRef,
 *   RuntimeEvidenceRef
 * } from "@beep/agents-use-cases/public"
 *
 * const claim = RuntimeCandidateClaim.make({
 *   claimId: "claim-cash-need-001",
 *   claimType: "client_cash_need",
 *   confidence: "high",
 *   evidence: [RuntimeEvidenceRef.make({ artifactId: "email-001", spanId: "s2" })],
 *   lifecycle: "candidate",
 *   producedByPrincipalId: "principal-agent-runtime-fixture",
 *   statement: "The household needs cash available by June 3.",
 *   subjectRef: RuntimeEntityRef.make({ id: "household-park-family", kind: "household" })
 * })
 *
 * console.log(claim.confidence) // "high"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeCandidateClaim extends S.Class<RuntimeCandidateClaim>($I`RuntimeCandidateClaim`)(
  {
    claimId: S.String,
    claimType: S.String,
    confidence: RuntimeClaimConfidence,
    eventDate: S.optionalKey(S.String),
    evidence: S.Array(RuntimeEvidenceRef),
    lifecycle: RuntimeCandidateLifecycle,
    producedByPrincipalId: S.String,
    statement: S.String,
    subjectRef: RuntimeEntityRef,
  },
  $I.annote("RuntimeCandidateClaim", {
    description: "Candidate claim with source evidence and producing principal provenance.",
  })
) {}

/**
 * Candidate project proposed by the runtime.
 *
 * @example
 * ```ts
 * import {
 *   RuntimeCandidateProject,
 *   RuntimeEntityRef,
 *   RuntimeEvidenceRef
 * } from "@beep/agents-use-cases/public"
 *
 * const project = RuntimeCandidateProject.make({
 *   evidence: [RuntimeEvidenceRef.make({ artifactId: "email-001", spanId: "s2" })],
 *   lifecycle: "candidate",
 *   projectId: "project-cash-need-001",
 *   title: "Review household cash need",
 *   verticalContextRefs: [
 *     RuntimeEntityRef.make({ id: "household-park-family", kind: "household" })
 *   ],
 *   workspaceId: "workspace-wealth"
 * })
 *
 * console.log(project.title)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeCandidateProject extends S.Class<RuntimeCandidateProject>($I`RuntimeCandidateProject`)(
  {
    evidence: S.Array(RuntimeEvidenceRef),
    lifecycle: RuntimeCandidateLifecycle,
    projectId: S.String,
    title: S.String,
    verticalContextRefs: S.Array(RuntimeEntityRef),
    workspaceId: S.String,
  },
  $I.annote("RuntimeCandidateProject", {
    description: "Candidate project with workspace, context references, and source evidence.",
  })
) {}

/**
 * Candidate task proposed by the runtime.
 *
 * @example
 * ```ts
 * import { RuntimeCandidateTask, RuntimeEvidenceRef } from "@beep/agents-use-cases/public"
 *
 * const task = RuntimeCandidateTask.make({
 *   assigneePrincipalId: "principal-user-wealth-tia-rowan",
 *   dueDate: "2026-05-08",
 *   evidence: [RuntimeEvidenceRef.make({ artifactId: "email-001", spanId: "s5" })],
 *   lifecycle: "candidate",
 *   projectId: "project-cash-need-001",
 *   taskId: "task-schedule-call-001",
 *   title: "Offer Friday afternoon call times"
 * })
 *
 * console.log(task.dueDate) // "2026-05-08"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeCandidateTask extends S.Class<RuntimeCandidateTask>($I`RuntimeCandidateTask`)(
  {
    assigneePrincipalId: S.String,
    dueDate: S.String,
    evidence: S.Array(RuntimeEvidenceRef),
    lifecycle: RuntimeCandidateLifecycle,
    projectId: S.String,
    taskId: S.String,
    title: S.String,
  },
  $I.annote("RuntimeCandidateTask", {
    description: "Candidate task with assignee, due date, and source evidence.",
  })
) {}

/**
 * Recipient for a candidate draft.
 *
 * @example
 * ```ts
 * import { RuntimeDraftRecipient } from "@beep/agents-use-cases/public"
 *
 * const recipient = RuntimeDraftRecipient.make({
 *   displayName: "Mira Park",
 *   email: "mira.park@example.test"
 * })
 *
 * console.log(recipient.email)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeDraftRecipient extends S.Class<RuntimeDraftRecipient>($I`RuntimeDraftRecipient`)(
  {
    displayName: S.String,
    email: EmailString,
  },
  $I.annote("RuntimeDraftRecipient", {
    description: "Draft recipient display name and email address.",
  })
) {}

/**
 * Candidate draft proposed by the runtime.
 *
 * @example
 * ```ts
 * import {
 *   RuntimeCandidateDraft,
 *   RuntimeDraftRecipient,
 *   RuntimeEvidenceRef
 * } from "@beep/agents-use-cases/public"
 *
 * const draft = RuntimeCandidateDraft.make({
 *   artifactId: "draft-artifact-001",
 *   body: "I will review the cash options before recommending movement.",
 *   draftId: "draft-cash-acknowledgement-001",
 *   draftKind: "client_email_reply",
 *   evidence: [RuntimeEvidenceRef.make({ artifactId: "email-001", spanId: "s5" })],
 *   lifecycle: "candidate",
 *   producedByPrincipalId: "principal-agent-runtime-fixture",
 *   requiresApproval: true,
 *   subject: "Re: Cash need",
 *   to: [RuntimeDraftRecipient.make({ displayName: "Mira Park", email: "mira.park@example.test" })]
 * })
 *
 * console.log(draft.requiresApproval) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeCandidateDraft extends S.Class<RuntimeCandidateDraft>($I`RuntimeCandidateDraft`)(
  {
    artifactId: S.String,
    body: S.String,
    draftId: S.String,
    draftKind: S.String,
    evidence: S.Array(RuntimeEvidenceRef),
    lifecycle: RuntimeCandidateLifecycle,
    producedByPrincipalId: S.String,
    requiresApproval: S.Boolean,
    subject: S.String,
    to: S.Array(RuntimeDraftRecipient),
  },
  $I.annote("RuntimeCandidateDraft", {
    description: "Candidate draft artifact with approval requirement, evidence, and producing principal.",
  })
) {}

/**
 * Candidate approval gate proposed by the runtime.
 *
 * @example
 * ```ts
 * import { RuntimeApprovalGate, RuntimeEvidenceRef } from "@beep/agents-use-cases/public"
 *
 * const gate = RuntimeApprovalGate.make({
 *   approvalGateId: "approval-cash-request-001",
 *   candidateRefs: ["claim-cash-need-001", "draft-cash-acknowledgement-001"],
 *   decision: "pending",
 *   evidence: [RuntimeEvidenceRef.make({ artifactId: "email-001", spanIds: ["s2", "s5"] })],
 *   lifecycle: "candidate",
 *   policyBasis: "Advisor approval is required before sending client-facing drafts.",
 *   requestedActions: ["approve_or_revise_client_email_draft"],
 *   reviewerPrincipalId: "principal-user-wealth-tia-rowan"
 * })
 *
 * console.log(gate.decision) // "pending"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeApprovalGate extends S.Class<RuntimeApprovalGate>($I`RuntimeApprovalGate`)(
  {
    approvalGateId: S.String,
    candidateRefs: S.Array(S.String),
    decision: RuntimeApprovalDecision,
    evidence: S.Array(RuntimeEvidenceRef),
    lifecycle: RuntimeCandidateLifecycle,
    policyBasis: S.String,
    requestedActions: S.Array(S.String),
    reviewerPrincipalId: S.String,
  },
  $I.annote("RuntimeApprovalGate", {
    description: "Human approval gate over candidate claims, tasks, and drafts.",
  })
) {}

/**
 * Request section embedded in a context packet.
 *
 * @example
 * ```ts
 * import { RuntimeContextPacketRequest } from "@beep/agents-use-cases/public"
 *
 * const request = RuntimeContextPacketRequest.make({
 *   artifactId: "email-artifact-001",
 *   kind: "email_to_candidate_work"
 * })
 *
 * console.log(request.kind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeContextPacketRequest extends S.Class<RuntimeContextPacketRequest>($I`RuntimeContextPacketRequest`)(
  {
    artifactId: S.String,
    kind: RuntimeRequestKind,
  },
  $I.annote("RuntimeContextPacketRequest", {
    description: "Original runtime request summarized inside a context packet.",
  })
) {}

/**
 * Source span declared by a context packet source artifact.
 *
 * @example
 * ```ts
 * import { RuntimeSourceSpanRef } from "@beep/agents-use-cases/public"
 *
 * const span = RuntimeSourceSpanRef.make({
 *   purpose: "cash need and date",
 *   spanId: "email-001-s2"
 * })
 *
 * console.log(span.spanId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeSourceSpanRef extends S.Class<RuntimeSourceSpanRef>($I`RuntimeSourceSpanRef`)(
  {
    purpose: S.String,
    spanId: S.String,
  },
  $I.annote("RuntimeSourceSpanRef", {
    description: "Declared source span and its evidence purpose.",
  })
) {}

/**
 * Source artifact declared by a context packet.
 *
 * @example
 * ```ts
 * import { RuntimeSourceArtifact, RuntimeSourceSpanRef } from "@beep/agents-use-cases/public"
 *
 * const artifact = RuntimeSourceArtifact.make({
 *   artifactId: "email-artifact-001",
 *   sourceKind: "email",
 *   spanRefs: [
 *     RuntimeSourceSpanRef.make({ purpose: "cash need and date", spanId: "email-001-s2" })
 *   ],
 *   title: "Cash need"
 * })
 *
 * console.log(artifact.spanRefs[0]?.purpose)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeSourceArtifact extends S.Class<RuntimeSourceArtifact>($I`RuntimeSourceArtifact`)(
  {
    artifactId: S.String,
    sourceKind: RuntimeSourceKind,
    spanRefs: S.Array(RuntimeSourceSpanRef),
    title: S.String,
  },
  $I.annote("RuntimeSourceArtifact", {
    description: "Source artifact and the spans available for evidence references.",
  })
) {}

/**
 * Runtime provenance activity included in a context packet.
 *
 * @example
 * ```ts
 * import { RuntimeActivity } from "@beep/agents-use-cases/public"
 *
 * const activity = RuntimeActivity.make({
 *   activityId: "activity-candidates-proposed-001",
 *   activityType: "candidate_work_proposed",
 *   principalId: "principal-agent-runtime-fixture",
 *   spanIds: ["email-001-s2", "email-001-s5"]
 * })
 *
 * console.log(activity.activityType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeActivity extends S.Class<RuntimeActivity>($I`RuntimeActivity`)(
  {
    activityId: S.String,
    activityType: RuntimeActivityType,
    artifactId: S.optionalKey(S.String),
    principalId: S.String,
    spanIds: S.Array(S.String).pipe(S.optionalKey),
  },
  $I.annote("RuntimeActivity", {
    description: "Provenance activity for ingestion and candidate proposal events.",
  })
) {}

/**
 * Runtime usage attribution included in a context packet.
 *
 * @example
 * ```ts
 * import { RuntimeUsageRecord } from "@beep/agents-use-cases/public"
 *
 * const usage = RuntimeUsageRecord.make({
 *   mode: "deterministic_fixture",
 *   model: "none",
 *   provider: "fixture",
 *   usageRecordId: "usage-fixture-agent-001"
 * })
 *
 * console.log(`${usage.provider}:${usage.model}`)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeUsageRecord extends S.Class<RuntimeUsageRecord>($I`RuntimeUsageRecord`)(
  {
    mode: RuntimeUsageMode,
    model: S.String,
    provider: S.String,
    usageRecordId: S.String,
  },
  $I.annote("RuntimeUsageRecord", {
    description: "Usage attribution for the runtime path that produced candidate work.",
  })
) {}

/**
 * Context packet returned to SDK clients.
 *
 * @example
 * ```ts
 * import {
 *   RuntimeActivity,
 *   RuntimeContextPacketRequest,
 *   RuntimeEntityRef,
 *   RuntimeScope,
 *   RuntimeSourceArtifact,
 *   RuntimeSourceSpanRef,
 *   RuntimeUsageRecord,
 *   SdkContextPacket
 * } from "@beep/agents-use-cases/public"
 *
 * const packet = SdkContextPacket.make({
 *   activities: [
 *     RuntimeActivity.make({
 *       activityId: "activity-ingested-001",
 *       activityType: "artifact_ingested",
 *       artifactId: "email-001",
 *       principalId: "principal-agent-runtime-fixture"
 *     })
 *   ],
 *   approvalGates: ["approval-cash-request-001"],
 *   candidateClaims: ["claim-cash-need-001"],
 *   candidateDrafts: ["draft-cash-acknowledgement-001"],
 *   candidateTasks: ["task-schedule-call-001"],
 *   contextPacketId: "context-cash-request-001",
 *   exclusions: ["No external money movement instruction is included."],
 *   generatedAt: "2026-05-01T15:05:10Z",
 *   principals: ["principal-user-wealth-tia-rowan", "principal-agent-runtime-fixture"],
 *   request: RuntimeContextPacketRequest.make({
 *     artifactId: "email-001",
 *     kind: "email_to_candidate_work"
 *   }),
 *   scenarioId: "wealth-cash-request",
 *   schemaVersion: "runtime-data-loop.expected.context-packet.v1",
 *   scope: RuntimeScope.make({
 *     organizationId: "org-wealth",
 *     threadId: "thread-wealth-001",
 *     workspaceId: "workspace-wealth"
 *   }),
 *   sourceArtifacts: [
 *     RuntimeSourceArtifact.make({
 *       artifactId: "email-001",
 *       sourceKind: "email",
 *       spanRefs: [
 *         RuntimeSourceSpanRef.make({ purpose: "cash need and date", spanId: "email-001-s2" })
 *       ],
 *       title: "Cash need"
 *     })
 *   ],
 *   usage: [
 *     RuntimeUsageRecord.make({
 *       mode: "deterministic_fixture",
 *       model: "none",
 *       provider: "fixture",
 *       usageRecordId: "usage-fixture-agent-001"
 *     })
 *   ],
 *   verticalContext: [
 *     RuntimeEntityRef.make({ id: "household-park-family", kind: "household" })
 *   ]
 * })
 *
 * console.log(packet.request.artifactId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SdkContextPacket extends S.Class<SdkContextPacket>($I`SdkContextPacket`)(
  {
    activities: S.Array(RuntimeActivity),
    approvalGates: S.Array(S.String),
    candidateClaims: S.Array(S.String),
    candidateDrafts: S.Array(S.String),
    candidateTasks: S.Array(S.String),
    contextPacketId: S.String,
    exclusions: S.Array(S.String),
    generatedAt: S.String,
    principals: S.Array(S.String),
    request: RuntimeContextPacketRequest,
    scenarioId: S.String,
    schemaVersion: S.String,
    scope: RuntimeScope,
    sourceArtifacts: S.Array(RuntimeSourceArtifact),
    usage: S.Array(RuntimeUsageRecord),
    verticalContext: S.Array(RuntimeEntityRef),
  },
  $I.annote("SdkContextPacket", {
    description: "Evidence-bounded context packet returned through the runtime SDK.",
  })
) {}

/**
 * Batch of candidate outputs proposed by an agent run.
 *
 * @example
 * ```ts
 * import { runRuntimeFixture, RuntimeFixtureInput } from "@beep/agents-use-cases/proof"
 * import { Effect } from "effect"
 *
 * const fixture = RuntimeFixtureInput.make({
 *   body: [
 *     "[span:law-email-001-s2] We need help preparing a provisional patent application.",
 *     "[span:law-email-001-s3] The public prototype demonstration is planned for June 12, 2026.",
 *     "[span:law-email-001-s4] Avery Chen and Priya Raman are the main contributors.",
 *     "[span:law-email-001-s5] Please schedule an intake call next week."
 *   ].join("\n"),
 *   email: {
 *     artifactId: "email-artifact-law-001",
 *     scenarioId: "law-patent-intake",
 *     sourceSpans: ["law-email-001-s2", "law-email-001-s3", "law-email-001-s4", "law-email-001-s5"],
 *     subject: "Provisional patent help",
 *     threadId: "thread-law-001"
 *   },
 *   seed: {
 *     organization: { organizationId: "org-law-fixture" },
 *     scenarioId: "law-patent-intake",
 *     workspace: { workspaceId: "workspace-law-fixture" }
 *   }
 * })
 *
 * Effect.runPromise(runRuntimeFixture(fixture)).then((outputSet) =>
 *   console.log(outputSet.claims.length) // 3
 * )
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateOutputSet extends S.Class<CandidateOutputSet>($I`CandidateOutputSet`)(
  {
    approvalGates: S.Array(RuntimeApprovalGate),
    candidateProject: RuntimeCandidateProject,
    claims: S.Array(RuntimeCandidateClaim),
    contextPacket: SdkContextPacket,
    drafts: S.Array(RuntimeCandidateDraft),
    scenarioId: S.String,
    tasks: S.Array(RuntimeCandidateTask),
  },
  $I.annote("CandidateOutputSet", {
    description: "Structured candidate claims, project, tasks, drafts, gates, and context packet.",
  })
) {}
