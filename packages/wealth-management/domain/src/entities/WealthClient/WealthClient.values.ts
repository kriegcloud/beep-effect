/**
 * Wealth-client value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $WealthManagementDomainId.create("entities/WealthClient/WealthClient.values");

/**
 * Fixture wealth-client status vocabulary.
 *
 * @example
 * ```ts
 * import { WealthClientStatus } from "@beep/wealth-management-domain"
 *
 * console.log(WealthClientStatus.is.active_client("active_client"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const WealthClientStatus = LiteralKit(["active_client"] as const).annotate(
  $I.annote("WealthClientStatus", {
    description: "Closed fixture status vocabulary for wealth clients.",
  })
);

/**
 * Runtime type for {@link WealthClientStatus}.
 *
 * @example
 * ```ts
 * import type { WealthClientStatus } from "@beep/wealth-management-domain"
 *
 * const value: WealthClientStatus = "active_client"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type WealthClientStatus = typeof WealthClientStatus.Type;

/**
 * Wealth-client profile mixin contributed through EntityMixin metadata.
 *
 * @example
 * ```ts
 * import { WealthClientProfileMixin } from "@beep/wealth-management-domain"
 *
 * console.log(WealthClientProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const WealthClientProfileMixin = EntityMixin.make($I`WealthClientProfileMixin`)(
  {
    displayName: S.String,
    fixtureKey: S.String,
    householdFixtureKey: S.String,
    partyFixtureKey: S.String,
    status: WealthClientStatus,
  },
  {
    description: "Persisted fields owned by the wealth client entity.",
    fields: {
      displayName: {
        columnName: "display_name",
        description: "Display name for the wealth client.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Deterministic fixture key for the wealth client.",
        indexHints: [EntityMixin.IndexHint.unique],
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      householdFixtureKey: {
        columnName: "household_fixture_key",
        description: "Fixture key for the household associated with this client.",
        indexHints: [EntityMixin.IndexHint.lookup],
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      partyFixtureKey: {
        columnName: "party_fixture_key",
        description: "Fixture key for the party represented by this client.",
        indexHints: [EntityMixin.IndexHint.lookup],
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      status: {
        columnName: "status",
        description: "Fixture status for the wealth client.",
        indexHints: [EntityMixin.IndexHint.lookup],
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Wealth-client profile pack used by entity and table constructors.
 *
 * @example
 * ```ts
 * import { WealthClientProfilePack } from "@beep/wealth-management-domain"
 *
 * console.log(WealthClientProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const WealthClientProfilePack = EntityMixin.pack(WealthClientProfileMixin);
