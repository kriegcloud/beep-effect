/**
 * Skill value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentCapabilityDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $AgentCapabilityDomainId.create("entities/Skill/Skill.values");

/**
 * Entity-specific fields contributed to the Skill entity.
 *
 * @example
 * ```ts
 * import { SkillProfileMixin } from "@beep/agent-capability-domain"
 *
 * console.log(SkillProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SkillProfileMixin = EntityMixin.make($I`SkillProfileMixin`)(
  {
    fixtureKey: S.String,
    name: S.String,
  },
  {
    description: "Runtime proof fields owned by the Skill entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the skill.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      name: {
        columnName: "name",
        description: "Display name for the skill.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Skill profile mixin.
 *
 * @example
 * ```ts
 * import { SkillProfilePack } from "@beep/agent-capability-domain"
 *
 * console.log(SkillProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SkillProfilePack = EntityMixin.pack(SkillProfileMixin);
