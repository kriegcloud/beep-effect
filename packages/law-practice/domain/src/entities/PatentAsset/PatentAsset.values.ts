/**
 * Patent asset value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $LawPracticeDomainId.create("entities/PatentAsset/PatentAsset.values");

/**
 * Patent asset status vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { PatentAssetStatus } from "@beep/law-practice-domain"
 *
 * console.log(PatentAssetStatus.is.pre_filing("pre_filing"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PatentAssetStatus = LiteralKit(["pre_filing"] as const).annotate(
  $I.annote("PatentAssetStatus", {
    description: "Patent asset status vocabulary represented in proof seeds.",
  })
);

/**
 * Runtime type for {@link PatentAssetStatus}.
 *
 * @example
 * ```ts
 * import type { PatentAssetStatus } from "@beep/law-practice-domain"
 *
 * const value: PatentAssetStatus = "pre_filing"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PatentAssetStatus = typeof PatentAssetStatus.Type;

/**
 * Entity-specific fields contributed to the PatentAsset entity.
 *
 * @example
 * ```ts
 * import { PatentAssetProfileMixin } from "@beep/law-practice-domain"
 *
 * console.log(PatentAssetProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PatentAssetProfileMixin = EntityMixin.make($I`PatentAssetProfileMixin`)(
  {
    fixtureKey: S.String,
    matterFixtureKey: S.String,
    status: PatentAssetStatus,
    title: S.String,
  },
  {
    description: "Runtime proof fields owned by the PatentAsset entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the patent asset.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      matterFixtureKey: {
        columnName: "matter_fixture_key",
        description: "Fixture key of the matter that owns the patent asset.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      status: {
        columnName: "status",
        description: "Patent asset status.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      title: {
        columnName: "title",
        description: "Patent asset title.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed PatentAsset profile mixin.
 *
 * @example
 * ```ts
 * import { PatentAssetProfilePack } from "@beep/law-practice-domain"
 *
 * console.log(PatentAssetProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PatentAssetProfilePack = EntityMixin.pack(PatentAssetProfileMixin);
