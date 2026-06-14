/**
 * Agents skill entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $AgentsDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Agents from "@beep/shared-domain/identity/Agents";
import * as S from "effect/Schema";

const $I = $AgentsDomainId.create("entities/Skill/Skill.model");

/**
 * Skill definition used by an agent.
 *
 * @example
 * ```ts
 * import { Skill } from "@beep/agents-domain"
 *
 * console.log(Skill.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Skill extends BaseEntity.Class<Skill>($I`Skill`)(
  Agents.SkillId,
  {
    fields: {
      fixtureKey: S.String,
      name: S.String,
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      name: EntitySchema.persist.text({
        columnName: "name",
      }),
    },
  },
  $I.annote("Skill", {
    description: "Skill definition used by an agent.",
  })
) {}
