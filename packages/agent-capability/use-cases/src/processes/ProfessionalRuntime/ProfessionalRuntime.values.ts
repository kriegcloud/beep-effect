/**
 * Concept-local value vocabularies for Agentic Professional Runtime contracts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { LiteralKit } from "@beep/schema";

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
export const RuntimeCandidateLifecycle = LiteralKit(["candidate"]);

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
export const RuntimeClaimConfidence = LiteralKit(["high", "medium", "low"]);

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
export const RuntimeApprovalDecision = LiteralKit(["pending"]);

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
export const RuntimeRequestKind = LiteralKit(["email_to_candidate_work"]);

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
export const RuntimeSourceKind = LiteralKit(["email"]);

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
export const RuntimeActivityType = LiteralKit(["artifact_ingested", "candidate_work_proposed"]);

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
export const RuntimeUsageMode = LiteralKit(["deterministic_fixture"]);
