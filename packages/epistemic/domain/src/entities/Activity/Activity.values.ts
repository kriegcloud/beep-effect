/**
 * Activity value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $EpistemicDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $EpistemicDomainId.create("entities/Activity/Activity.values");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Entity-specific fields contributed to the Activity entity.
 *
 * @example
 * ```ts
 * import { ActivityProfileMixin } from "@beep/epistemic-domain"
 *
 * console.log(ActivityProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ActivityProfileMixin = EntityMixin.make($I`ActivityProfileMixin`)(
  {
    fixtureKey: S.String,
    snapshot: UnknownRecord,
  },
  {
    description: "Runtime proof fields owned by the Activity entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the activity.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      snapshot: {
        columnName: "snapshot",
        description: "Structured provenance activity payload retained by the proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Activity profile mixin.
 *
 * @example
 * ```ts
 * import { ActivityProfilePack } from "@beep/epistemic-domain"
 *
 * console.log(ActivityProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ActivityProfilePack = EntityMixin.pack(ActivityProfileMixin);
