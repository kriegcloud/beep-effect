/**
 * Domain model for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as FixtureLabSpecimen from "@beep/shared-domain/identity/FixtureLabSpecimen";
import * as EntitySchema from "@beep/schema/EntitySchema";
import * as S from "effect/Schema";
import { SpecimenStatus } from "./Specimen.values.js";

const $I = $FixtureLabSpecimenId.create("domain/entities/Specimen/Specimen.model");

/**
 * Synthetic entity model used to prove generated package topology.
 *
 * @example
 * ```ts
 * import { Specimen } from "@beep/fixture-lab-specimen-domain"
 *
 * console.log(Specimen.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Specimen extends BaseEntity.Class<Specimen>($I`Specimen`)(
  FixtureLabSpecimen.SpecimenId,
  {
    fields: {
      fixtureKey: S.String,
      label: S.String,
      status: SpecimenStatus,
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      label: EntitySchema.persist.text({
        columnName: "label",
      }),
      status: EntitySchema.persist.literal({
        columnName: "status",
      }),
    },
  },
  $I.annote("Specimen", {
    description: "Synthetic entity model used by the architecture automation fixture.",
  })
) {}
