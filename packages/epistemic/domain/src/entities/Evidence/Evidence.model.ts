/**
 * Evidence entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { EvidenceSpan } from "@beep/epistemic-domain/values";
import { $EpistemicDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import * as S from "effect/Schema";

const $I = $EpistemicDomainId.create("entities/Evidence/Evidence.model");

/**
 * Source span evidence reference. Carries the ported v3 {@link EvidenceSpan}
 * char-offset primitive (`startChar`/`endChar`/`quote`/`confidence`) alongside
 * its existing fixture-key refs; the span is persisted as a JSONB column so the
 * fractional `confidence` survives (there is no float storage kind).
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
      span: EvidenceSpan,
    },
    persisted: {
      artifactFixtureKey: EntitySchema.persist.text({
        columnName: "artifact_fixture_key",
      }),
      spanFixtureKey: EntitySchema.persist.text({
        columnName: "span_fixture_key",
      }),
      span: EntitySchema.persist.jsonb({
        columnName: "span",
      }),
    },
  },
  $I.annote("Evidence", {
    description: "Source span evidence reference.",
  })
) {}
