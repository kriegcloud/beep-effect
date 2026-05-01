/**
 * Read-model table contract for the synthetic `fixture-lab/Specimen` entity.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { SpecimenStatus } from "@beep/fixture-lab-specimen-domain";
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("tables/entities/Specimen/Specimen.read-model-table");

/**
 * Read-model row projected for specimen queries.
 *
 * @example
 * ```ts
 * import { SpecimenReadModel } from "@beep/fixture-lab-specimen-tables"
 * import * as O from "effect/Option"
 *
 * const row = new SpecimenReadModel({
 *   id: "specimen-1",
 *   label: "Fixture",
 *   observedAtIso: O.none(),
 *   status: "draft",
 * })
 * console.log(row.id)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export class SpecimenReadModel extends S.Class<SpecimenReadModel>($I`SpecimenReadModel`)(
  {
    id: S.String,
    label: S.String,
    status: SpecimenStatus,
    observedAtIso: S.OptionFromNullOr(S.String),
  },
  $I.annote("SpecimenReadModel", {
    description: "Read-model row projected for specimen queries.",
  })
) {}

/**
 * SQL table name reserved for the specimen read model.
 *
 * @example
 * ```ts
 * import { specimenReadModelTableName } from "@beep/fixture-lab-specimen-tables"
 *
 * console.log(specimenReadModelTableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const specimenReadModelTableName = "fixture_lab_specimen_read_model";

/**
 * Minimal column contract for the specimen read-model table.
 *
 * @example
 * ```ts
 * import { specimenReadModelColumns } from "@beep/fixture-lab-specimen-tables"
 *
 * console.log(specimenReadModelColumns.status)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const specimenReadModelColumns = {
  id: "text primary key",
  label: "text not null",
  status: "text not null",
  observedAtIso: "timestamp null",
};
