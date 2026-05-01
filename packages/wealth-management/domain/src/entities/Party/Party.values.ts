/**
 * Party value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $WealthManagementDomainId.create("entities/Party/Party.values");

/**
 * Fixture party type vocabulary.
 *
 * @example
 * ```ts
 * import { PartyType } from "@beep/wealth-management-domain"
 *
 * console.log(PartyType.is.person("person"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PartyType = LiteralKit(["person"] as const).annotate(
  $I.annote("PartyType", {
    description: "Closed fixture type vocabulary for parties.",
  })
);

/**
 * Runtime type for {@link PartyType}.
 *
 * @example
 * ```ts
 * import type { PartyType } from "@beep/wealth-management-domain"
 *
 * const value: PartyType = "person"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PartyType = typeof PartyType.Type;

/**
 * Party profile mixin contributed through EntityMixin metadata.
 *
 * @example
 * ```ts
 * import { PartyProfileMixin } from "@beep/wealth-management-domain"
 *
 * console.log(PartyProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PartyProfileMixin = EntityMixin.make($I`PartyProfileMixin`)(
  {
    displayName: S.String,
    fixtureKey: S.String,
    partyType: PartyType,
  },
  {
    description: "Persisted fields owned by the party entity.",
    fields: {
      displayName: {
        columnName: "display_name",
        description: "Display name for the party.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Deterministic fixture key for the party.",
        indexHints: [EntityMixin.IndexHint.unique],
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      partyType: {
        columnName: "party_type",
        description: "Fixture party type.",
        indexHints: [EntityMixin.IndexHint.lookup],
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Party profile pack used by entity and table constructors.
 *
 * @example
 * ```ts
 * import { PartyProfilePack } from "@beep/wealth-management-domain"
 *
 * console.log(PartyProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PartyProfilePack = EntityMixin.pack(PartyProfileMixin);
