/**
 * Agent capability skill entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $AgentCapabilityDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability";
import { SkillProfilePack } from "./Skill.values.js";

const $I = $AgentCapabilityDomainId.create("entities/Skill/Skill.model");

/**
 * Skill definition used by an agent.
 *
 * @example
 * ```ts
 * import { Skill } from "@beep/agent-capability-domain"
 *
 * console.log(Skill.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Skill extends BaseEntity.extend<Skill>($I`Skill`)(
  AgentCapability.SkillId,
  SkillProfilePack,
  {},
  $I.annote("Skill", {
    description: "Skill definition used by an agent.",
  })
) {}
