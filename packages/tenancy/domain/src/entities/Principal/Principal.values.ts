/**
 * Tenancy principal value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TenancyDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $TenancyDomainId.create("entities/Principal/Principal.values");

/**
 * Principal kind vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { PrincipalKind } from "@beep/tenancy-domain"
 *
 * console.log(PrincipalKind.is.agent("agent"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PrincipalKind = LiteralKit(["agent", "user"] as const).annotate(
  $I.annote("PrincipalKind", {
    description: "Runtime principal kind represented in the proof seeds.",
  })
);

/**
 * Runtime type for {@link PrincipalKind}.
 *
 * @example
 * ```ts
 * import type { PrincipalKind } from "@beep/tenancy-domain"
 *
 * const value: PrincipalKind = "agent"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PrincipalKind = typeof PrincipalKind.Type;

/**
 * Entity-specific fields contributed to the tenancy Principal entity.
 *
 * @example
 * ```ts
 * import { PrincipalProfileMixin } from "@beep/tenancy-domain"
 *
 * console.log(PrincipalProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PrincipalProfileMixin = EntityMixin.make($I`PrincipalProfileMixin`)(
  {
    agentFixtureKey: S.optionalKey(S.String),
    fixtureKey: S.String,
    kind: PrincipalKind,
    userFixtureKey: S.optionalKey(S.String),
  },
  {
    description: "Runtime proof fields owned by the tenancy Principal entity.",
    fields: {
      agentFixtureKey: {
        columnName: "agent_fixture_key",
        description: "Optional fixture key of the represented agent.",
        nullable: true,
        storageKind: "text",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier used by deterministic runtime scenarios.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      kind: {
        columnName: "kind",
        description: "Runtime principal kind.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      userFixtureKey: {
        columnName: "user_fixture_key",
        description: "Optional fixture key of the represented user.",
        nullable: true,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Principal profile mixin.
 *
 * @example
 * ```ts
 * import { PrincipalProfilePack } from "@beep/tenancy-domain"
 *
 * console.log(PrincipalProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PrincipalProfilePack = EntityMixin.pack(PrincipalProfileMixin);
