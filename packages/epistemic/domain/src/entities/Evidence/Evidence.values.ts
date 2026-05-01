/**
 * Evidence value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $EpistemicDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $EpistemicDomainId.create("entities/Evidence/Evidence.values");

/**
 * Entity-specific fields contributed to the Evidence entity.
 *
 * @example
 * ```ts
 * import { EvidenceProfileMixin } from "@beep/epistemic-domain"
 *
 * console.log(EvidenceProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const EvidenceProfileMixin = EntityMixin.make($I`EvidenceProfileMixin`)(
  {
    artifactFixtureKey: S.String,
    spanFixtureKey: S.String,
  },
  {
    description: "Runtime proof fields owned by the Evidence entity.",
    fields: {
      artifactFixtureKey: {
        columnName: "artifact_fixture_key",
        description: "Fixture key of the source artifact.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      spanFixtureKey: {
        columnName: "span_fixture_key",
        description: "Fixture key of the cited source span.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed Evidence profile mixin.
 *
 * @example
 * ```ts
 * import { EvidenceProfilePack } from "@beep/epistemic-domain"
 *
 * console.log(EvidenceProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const EvidenceProfilePack = EntityMixin.pack(EvidenceProfileMixin);
