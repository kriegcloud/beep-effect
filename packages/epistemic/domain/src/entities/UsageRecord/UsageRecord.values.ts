/**
 * Usage Record value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $EpistemicDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $EpistemicDomainId.create("entities/UsageRecord/UsageRecord.values");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Entity-specific fields contributed to the UsageRecord entity.
 *
 * @example
 * ```ts
 * import { UsageRecordProfileMixin } from "@beep/epistemic-domain"
 *
 * console.log(UsageRecordProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const UsageRecordProfileMixin = EntityMixin.make($I`UsageRecordProfileMixin`)(
  {
    fixtureKey: S.String,
    snapshot: UnknownRecord,
  },
  {
    description: "Runtime proof fields owned by the UsageRecord entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the usage record.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      snapshot: {
        columnName: "snapshot",
        description: "Structured usage payload retained by the proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed UsageRecord profile mixin.
 *
 * @example
 * ```ts
 * import { UsageRecordProfilePack } from "@beep/epistemic-domain"
 *
 * console.log(UsageRecordProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const UsageRecordProfilePack = EntityMixin.pack(UsageRecordProfileMixin);
