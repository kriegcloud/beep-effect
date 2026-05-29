/**
 * Agent-capability slice entity-id registry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentCapabilityDomainId } from "@beep/identity/packages";
import * as EntityId from "../entity/EntityId.js";

const $I = $AgentCapabilityDomainId.create("identity/AgentCapability");
const make = EntityId.factory("agent_capability", $I);

/**
 * Agent entity identifier.
 *
 * @example
 * ```ts
 * import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability"
 *
 * console.log(AgentCapability.AgentId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const AgentId = make("agent", {
  description: "Identifier for an agent capability agent entity.",
});

/**
 * Runtime type for {@link AgentId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: AgentCapability.AgentId = yield* S.decodeUnknownEffect(AgentCapability.AgentId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type AgentId = typeof AgentId.Type;

/**
 * Skill entity identifier.
 *
 * @example
 * ```ts
 * import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability"
 *
 * console.log(AgentCapability.SkillId.entityType)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const SkillId = make("skill", {
  description: "Identifier for an agent capability skill entity.",
});

/**
 * Runtime type for {@link SkillId}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const id: AgentCapability.SkillId = yield* S.decodeUnknownEffect(AgentCapability.SkillId)(1)
 *   return id
 * })
 * console.log(program)
 * ```
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type SkillId = typeof SkillId.Type;
