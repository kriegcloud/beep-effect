/**
 * Matter value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $LawPracticeDomainId.create("entities/Matter/Matter.values");

/**
 * Matter type vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { MatterType } from "@beep/law-practice-domain"
 *
 * console.log(MatterType.is.patent_application("patent_application"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const MatterType = LiteralKit(["patent_application"] as const).annotate(
  $I.annote("MatterType", {
    description: "Legal matter type vocabulary represented in proof seeds.",
  })
);

/**
 * Runtime type for {@link MatterType}.
 *
 * @example
 * ```ts
 * import type { MatterType } from "@beep/law-practice-domain"
 *
 * const value: MatterType = "patent_application"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type MatterType = typeof MatterType.Type;

/**
 * Entity-specific fields contributed to the Matter entity.
 *
 * @example
 * ```ts
 * import { MatterProfileMixin } from "@beep/law-practice-domain"
 *
 * console.log(MatterProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const MatterProfileMixin = EntityMixin.make($I`MatterProfileMixin`)(
  {
    displayName: S.String,
    fixtureKey: S.String,
    legalClientFixtureKey: S.String,
    matterType: MatterType,
  },
  {
    description: "Runtime proof fields owned by the Matter entity.",
    fields: {
      displayName: {
        columnName: "display_name",
        description: "Matter display name.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the matter.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      legalClientFixtureKey: {
        columnName: "legal_client_fixture_key",
        description: "Fixture key of the client that owns the matter.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      matterType: {
        columnName: "matter_type",
        description: "Type of legal matter.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Matter profile mixin.
 *
 * @example
 * ```ts
 * import { MatterProfilePack } from "@beep/law-practice-domain"
 *
 * console.log(MatterProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const MatterProfilePack = EntityMixin.pack(MatterProfileMixin);
