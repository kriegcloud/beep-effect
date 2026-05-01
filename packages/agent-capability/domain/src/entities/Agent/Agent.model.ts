/**
 * Agent capability agent entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $AgentCapabilityDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability";
import { AgentProfilePack } from "./Agent.values.js";

const $I = $AgentCapabilityDomainId.create("entities/Agent/Agent.model");

/**
 * Agent definition available to the runtime proof.
 *
 * @example
 * ```ts
 * import { Agent } from "@beep/agent-capability-domain"
 *
 * console.log(Agent.definition.entityId.entityType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Agent extends BaseEntity.extend<Agent>($I`Agent`)(
  AgentCapability.AgentId,
  AgentProfilePack,
  {},
  $I.annote("Agent", {
    description: "Agent definition available to the runtime proof.",
  })
) {}
