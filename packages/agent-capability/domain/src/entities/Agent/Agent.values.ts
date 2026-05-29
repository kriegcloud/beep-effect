/**
 * Agent value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentCapabilityDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $AgentCapabilityDomainId.create("entities/Agent/Agent.values");

/**
 * Agent mode used by the deterministic proof.
 *
 * @example
 * ```ts
 * import { AgentMode } from "@beep/agent-capability-domain"
 *
 * console.log(AgentMode.is.deterministic_fixture("deterministic_fixture"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const AgentMode = LiteralKit(["deterministic_fixture"]).annotate(
  $I.annote("AgentMode", {
    description: "Execution mode vocabulary for proof agents.",
  })
);

/**
 * Runtime type for {@link AgentMode}.
 *
 * @example
 * ```ts
 * import type { AgentMode } from "@beep/agent-capability-domain"
 *
 * const value: AgentMode = "deterministic_fixture"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AgentMode = typeof AgentMode.Type;
