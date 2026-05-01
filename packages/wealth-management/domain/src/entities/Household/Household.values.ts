/**
 * Household value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $WealthManagementDomainId.create("entities/Household/Household.values");

/**
 * Fixture household status vocabulary.
 *
 * @example
 * ```ts
 * import { HouseholdStatus } from "@beep/wealth-management-domain"
 *
 * console.log(HouseholdStatus.is.active("active"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const HouseholdStatus = LiteralKit(["active"] as const).annotate(
  $I.annote("HouseholdStatus", {
    description: "Closed fixture status vocabulary for households.",
  })
);

/**
 * Runtime type for {@link HouseholdStatus}.
 *
 * @example
 * ```ts
 * import type { HouseholdStatus } from "@beep/wealth-management-domain"
 *
 * const value: HouseholdStatus = "active"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HouseholdStatus = typeof HouseholdStatus.Type;

/**
 * Household profile mixin contributed through EntityMixin metadata.
 *
 * @example
 * ```ts
 * import { HouseholdProfileMixin } from "@beep/wealth-management-domain"
 *
 * console.log(HouseholdProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const HouseholdProfileMixin = EntityMixin.make($I`HouseholdProfileMixin`)(
  {
    displayName: S.String,
    fixtureKey: S.String,
    status: HouseholdStatus,
  },
  {
    description: "Persisted fields owned by the household entity.",
    fields: {
      displayName: {
        columnName: "display_name",
        description: "Display name for the household.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Deterministic fixture key for the household.",
        indexHints: [EntityMixin.IndexHint.unique],
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      status: {
        columnName: "status",
        description: "Fixture status for the household.",
        indexHints: [EntityMixin.IndexHint.lookup],
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Household profile pack used by entity and table constructors.
 *
 * @example
 * ```ts
 * import { HouseholdProfilePack } from "@beep/wealth-management-domain"
 *
 * console.log(HouseholdProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const HouseholdProfilePack = EntityMixin.pack(HouseholdProfileMixin);
