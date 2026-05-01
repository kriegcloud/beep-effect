/**
 * Legal contact value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $LawPracticeDomainId.create("entities/LegalContact/LegalContact.values");

/**
 * Legal contact role vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { LegalContactRole } from "@beep/law-practice-domain"
 *
 * console.log(LegalContactRole.is.founder("founder"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const LegalContactRole = LiteralKit(["founder"] as const).annotate(
  $I.annote("LegalContactRole", {
    description: "Legal contact role vocabulary represented in proof seeds.",
  })
);

/**
 * Runtime type for {@link LegalContactRole}.
 *
 * @example
 * ```ts
 * import type { LegalContactRole } from "@beep/law-practice-domain"
 *
 * const value: LegalContactRole = "founder"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LegalContactRole = typeof LegalContactRole.Type;

/**
 * Entity-specific fields contributed to the LegalContact entity.
 *
 * @example
 * ```ts
 * import { LegalContactProfileMixin } from "@beep/law-practice-domain"
 *
 * console.log(LegalContactProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const LegalContactProfileMixin = EntityMixin.make($I`LegalContactProfileMixin`)(
  {
    displayName: S.String,
    fixtureKey: S.String,
    legalClientFixtureKey: S.String,
    role: LegalContactRole,
  },
  {
    description: "Runtime proof fields owned by the LegalContact entity.",
    fields: {
      displayName: {
        columnName: "display_name",
        description: "Legal contact display name.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the legal contact.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      legalClientFixtureKey: {
        columnName: "legal_client_fixture_key",
        description: "Fixture key of the legal client for this contact.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      role: {
        columnName: "role",
        description: "Legal contact role.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed LegalContact profile mixin.
 *
 * @example
 * ```ts
 * import { LegalContactProfilePack } from "@beep/law-practice-domain"
 *
 * console.log(LegalContactProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const LegalContactProfilePack = EntityMixin.pack(LegalContactProfileMixin);
