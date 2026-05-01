/**
 * Agent value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentCapabilityDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

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
export const AgentMode = LiteralKit(["deterministic_fixture"] as const).annotate(
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

/**
 * Entity-specific fields contributed to the Agent entity.
 *
 * @example
 * ```ts
 * import { AgentProfileMixin } from "@beep/agent-capability-domain"
 *
 * console.log(AgentProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const AgentProfileMixin = EntityMixin.make($I`AgentProfileMixin`)(
  {
    fixtureKey: S.String,
    mode: AgentMode,
    name: S.String,
    skillFixtureKey: S.String,
  },
  {
    description: "Runtime proof fields owned by the Agent entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the agent.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      mode: {
        columnName: "mode",
        description: "Execution mode used by the proof agent.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      name: {
        columnName: "name",
        description: "Display name for the agent.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      skillFixtureKey: {
        columnName: "skill_fixture_key",
        description: "Fixture key of the skill configured for the agent.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Agent profile mixin.
 *
 * @example
 * ```ts
 * import { AgentProfilePack } from "@beep/agent-capability-domain"
 *
 * console.log(AgentProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const AgentProfilePack = EntityMixin.pack(AgentProfileMixin);
