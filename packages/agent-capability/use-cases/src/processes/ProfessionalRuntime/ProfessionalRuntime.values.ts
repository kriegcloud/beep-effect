/**
 * Concept-local value vocabularies for Agentic Professional Runtime contracts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentCapabilityUseCasesId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $AgentCapabilityUseCasesId.create("processes/ProfessionalRuntime/ProfessionalRuntime.values");
/**
 * Candidate lifecycle vocabulary used by runtime output sections.
 *
 * @example
 * ```ts
 * import { RuntimeCandidateLifecycle } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeCandidateLifecycle)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RuntimeCandidateLifecycle = LiteralKit(["candidate"]).annotate(
  $I.annote("RuntimeCandidateLifecycle", {
    description: "Candidate lifecycle vocabulary used by runtime output sections.",
  })
);

/**
 * Confidence vocabulary for candidate claims.
 *
 * @example
 * ```ts
 * import { RuntimeClaimConfidence } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeClaimConfidence)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RuntimeClaimConfidence = LiteralKit(["high", "medium", "low"]).annotate(
  $I.annote("RuntimeClaimConfidence", {
    description: "Confidence vocabulary for candidate claims.",
  })
);

/**
 * Approval decision vocabulary for candidate approval gates.
 *
 * @example
 * ```ts
 * import { RuntimeApprovalDecision } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeApprovalDecision)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RuntimeApprovalDecision = LiteralKit(["pending"]).annotate(
  $I.annote("RuntimeApprovalDecision", {
    description: "Approval decision vocabulary for candidate approval gates.",
  })
);

/**
 * Runtime request kinds represented in context packets.
 *
 * @example
 * ```ts
 * import { RuntimeRequestKind } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeRequestKind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RuntimeRequestKind = LiteralKit(["email_to_candidate_work"]).annotate(
  $I.annote("RuntimeRequestKind", {
    description: "Runtime request kinds represented in context packets.",
  })
);

/**
 * Source artifact kinds represented in context packets.
 *
 * @example
 * ```ts
 * import { RuntimeSourceKind } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeSourceKind)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RuntimeSourceKind = LiteralKit(["email"]).annotate(
  $I.annote("RuntimeSourceKind", {
    description: "Source artifact kinds represented in context packets.",
  })
);

/**
 * Activity types emitted by deterministic runtime fixtures.
 *
 * @example
 * ```ts
 * import { RuntimeActivityType } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeActivityType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RuntimeActivityType = LiteralKit(["artifact_ingested", "candidate_work_proposed"]).annotate(
  $I.annote("RuntimeActivityType", {
    description: "Activity types emitted by deterministic runtime fixtures.",
  })
);

/**
 * Usage modes emitted by deterministic runtime fixtures.
 *
 * @example
 * ```ts
 * import { RuntimeUsageMode } from "@beep/agent-capability-use-cases/public"
 *
 * console.log(RuntimeUsageMode)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RuntimeUsageMode = LiteralKit(["deterministic_fixture"]).annotate(
  $I.annote("RuntimeUsageMode", {
    description: "Usage modes emitted by deterministic runtime fixtures.",
  })
);
