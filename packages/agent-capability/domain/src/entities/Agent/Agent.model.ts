/**
 * Agent capability agent entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $AgentCapabilityDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability";
import * as EntitySchema from "@beep/schema/EntitySchema";
import * as S from "effect/Schema";
import { AgentMode } from "./Agent.values.js";

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
export class Agent extends BaseEntity.Class<Agent>($I`Agent`)(
  AgentCapability.AgentId,
  {
    fields: {
      fixtureKey: S.String,
      mode: AgentMode,
      name: S.String,
      skillFixtureKey: S.String,
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      mode: EntitySchema.persist.literal({
        columnName: "mode",
      }),
      name: EntitySchema.persist.text({
        columnName: "name",
      }),
      skillFixtureKey: EntitySchema.persist.text({
        columnName: "skill_fixture_key",
      }),
    },
  },
  $I.annote("Agent", {
    description: "Agent definition available to the runtime proof.",
  })
) {}
