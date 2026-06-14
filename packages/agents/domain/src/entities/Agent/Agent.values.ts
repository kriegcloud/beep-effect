/**
 * Agent value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentsDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $AgentsDomainId.create("entities/Agent/Agent.values");

/**
 * Agent mode used by the deterministic proof.
 *
 * @example
 * ```ts
 * import { AgentMode } from "@beep/agents-domain"
 *
 * console.log(AgentMode.is.deterministic_fixture("deterministic_fixture"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const AgentMode = LiteralKit(["deterministic_fixture"]).pipe(
  $I.annoteSchema("AgentMode", {
    description: "Execution mode vocabulary for proof agents.",
  })
);

/**
 * Runtime type for {@link AgentMode}.
 *
 * @example
 * ```ts
 * import type { AgentMode } from "@beep/agents-domain"
 *
 * const value: AgentMode = "deterministic_fixture"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AgentMode = typeof AgentMode.Type;
