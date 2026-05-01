/**
 * SDK data-transfer contracts for the Agentic Professional Runtime proof.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentCapabilityUseCasesId } from "@beep/identity/packages";
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

const $I = $AgentCapabilityUseCasesId.create("processes/ProfessionalRuntime/ProfessionalRuntime.contracts");

/**
 * Scope for an SDK request.
 *
 * @example
 * ```ts
 * import { RuntimeScope } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeScope)
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
 * import { RuntimeEntityRef } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeEntityRef)
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
 * import { RuntimeEvidenceRef } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeEvidenceRef)
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
 * import { RuntimeCandidateClaim } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeCandidateClaim)
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
 * import { RuntimeCandidateProject } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeCandidateProject)
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
 * import { RuntimeCandidateTask } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeCandidateTask)
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
 * import { RuntimeDraftRecipient } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeDraftRecipient)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RuntimeDraftRecipient extends S.Class<RuntimeDraftRecipient>($I`RuntimeDraftRecipient`)(
  {
    displayName: S.String,
    email: S.String,
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
 * import { RuntimeCandidateDraft } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeCandidateDraft)
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
 * import { RuntimeApprovalGate } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeApprovalGate)
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
 * import { RuntimeContextPacketRequest } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeContextPacketRequest)
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
 * import { RuntimeSourceSpanRef } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeSourceSpanRef)
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
 * import { RuntimeSourceArtifact } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeSourceArtifact)
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
 * import { RuntimeActivity } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeActivity)
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
 * import { RuntimeUsageRecord } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeUsageRecord)
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
 * import { SdkContextPacket } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(SdkContextPacket)
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
 * import { CandidateOutputSet } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(CandidateOutputSet)
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
