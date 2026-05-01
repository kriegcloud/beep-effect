/**
 * Value schemas for the synthetic `fixture-lab/Specimen` entity.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("domain/entities/Specimen/Specimen.values");

/**
 * Lifecycle status for a synthetic specimen.
 *
 * @example
 * ```ts
 * import { SpecimenStatus } from "@beep/fixture-lab-specimen-domain"
 *
 * const isObserved = SpecimenStatus.is.observed("observed")
 * console.log(isObserved)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SpecimenStatus = LiteralKit(["draft", "observed", "retired"] as const).annotate(
  $I.annote("SpecimenStatus", {
    description: "Lifecycle status for the synthetic Specimen concept.",
  })
);

/**
 * Decoded lifecycle status for a synthetic specimen.
 *
 * @example
 * ```ts
 * import type { SpecimenStatus } from "@beep/fixture-lab-specimen-domain"
 *
 * const status: SpecimenStatus = "draft"
 * console.log(status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SpecimenStatus = typeof SpecimenStatus.Type;

/**
 * Entity-specific fields contributed to the fixture-lab Specimen entity.
 *
 * @example
 * ```ts
 * import { SpecimenProfileMixin } from "@beep/fixture-lab-specimen-domain"
 *
 * console.log(SpecimenProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SpecimenProfileMixin = EntityMixin.make($I`SpecimenProfileMixin`)(
  {
    fixtureKey: S.String,
    label: S.String,
    status: SpecimenStatus,
  },
  {
    description: "Synthetic fixture fields owned by the Specimen entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier used by synthetic slice tests.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      label: {
        columnName: "label",
        description: "Display label for the synthetic specimen.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      status: {
        columnName: "status",
        description: "Lifecycle status for the synthetic specimen.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Specimen profile mixin.
 *
 * @example
 * ```ts
 * import { SpecimenProfilePack } from "@beep/fixture-lab-specimen-domain"
 *
 * console.log(SpecimenProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SpecimenProfilePack = EntityMixin.pack(SpecimenProfileMixin);
