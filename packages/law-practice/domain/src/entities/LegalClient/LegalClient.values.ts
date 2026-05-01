/**
 * Legal client value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $LawPracticeDomainId.create("entities/LegalClient/LegalClient.values");

/**
 * Legal client status vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { LegalClientStatus } from "@beep/law-practice-domain"
 *
 * console.log(LegalClientStatus.is.active_client("active_client"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const LegalClientStatus = LiteralKit(["active_client"] as const).annotate(
  $I.annote("LegalClientStatus", {
    description: "Legal client status vocabulary represented in proof seeds.",
  })
);

/**
 * Runtime type for {@link LegalClientStatus}.
 *
 * @example
 * ```ts
 * import type { LegalClientStatus } from "@beep/law-practice-domain"
 *
 * const value: LegalClientStatus = "active_client"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LegalClientStatus = typeof LegalClientStatus.Type;

/**
 * Entity-specific fields contributed to the LegalClient entity.
 *
 * @example
 * ```ts
 * import { LegalClientProfileMixin } from "@beep/law-practice-domain"
 *
 * console.log(LegalClientProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const LegalClientProfileMixin = EntityMixin.make($I`LegalClientProfileMixin`)(
  {
    displayName: S.String,
    fixtureKey: S.String,
    status: LegalClientStatus,
  },
  {
    description: "Runtime proof fields owned by the LegalClient entity.",
    fields: {
      displayName: {
        columnName: "display_name",
        description: "Legal client display name.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the legal client.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      status: {
        columnName: "status",
        description: "Legal client status.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed LegalClient profile mixin.
 *
 * @example
 * ```ts
 * import { LegalClientProfilePack } from "@beep/law-practice-domain"
 *
 * console.log(LegalClientProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const LegalClientProfilePack = EntityMixin.pack(LegalClientProfileMixin);
