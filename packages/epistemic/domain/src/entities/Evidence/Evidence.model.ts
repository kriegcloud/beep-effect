/**
 * Evidence entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $EpistemicDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import * as S from "effect/Schema";

const $I = $EpistemicDomainId.create("entities/Evidence/Evidence.model");

/**
 * Source span evidence reference.
 *
 * @example
 * ```ts
 * import { Evidence } from "@beep/epistemic-domain"
 *
 * console.log(Evidence.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Evidence extends BaseEntity.Class<Evidence>($I`Evidence`)(
  Epistemic.EvidenceId,
  {
    fields: {
      artifactFixtureKey: S.String,
      spanFixtureKey: S.String,
    },
    persisted: {
      artifactFixtureKey: EntitySchema.persist.text({
        columnName: "artifact_fixture_key",
      }),
      spanFixtureKey: EntitySchema.persist.text({
        columnName: "span_fixture_key",
      }),
    },
  },
  $I.annote("Evidence", {
    description: "Source span evidence reference.",
  })
) {}
