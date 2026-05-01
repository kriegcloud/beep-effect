/**
 * Write-table contract for the synthetic `fixture-lab/Specimen` entity.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { SpecimenStatus } from "@beep/fixture-lab-specimen-domain";
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("tables/entities/Specimen/Specimen.table");

/**
 * Persisted specimen row shape.
 *
 * @example
 * ```ts
 * import { SpecimenTableRow } from "@beep/fixture-lab-specimen-tables"
 *
 * const row = new SpecimenTableRow({
 *   id: "specimen-1",
 *   label: "Fixture",
 *   status: "draft",
 * })
 * console.log(row.status)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export class SpecimenTableRow extends S.Class<SpecimenTableRow>($I`SpecimenTableRow`)(
  {
    id: S.String,
    label: S.String,
    status: SpecimenStatus,
  },
  $I.annote("SpecimenTableRow", {
    description: "Persisted specimen row shape for the synthetic fixture.",
  })
) {}

/**
 * SQL table name reserved for the specimen write model.
 *
 * @example
 * ```ts
 * import { specimenTableName } from "@beep/fixture-lab-specimen-tables"
 *
 * console.log(specimenTableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const specimenTableName = "fixture_lab_specimen";

/**
 * Minimal column contract for the specimen write-model table.
 *
 * @example
 * ```ts
 * import { specimenTableColumns } from "@beep/fixture-lab-specimen-tables"
 *
 * console.log(specimenTableColumns.status)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const specimenTableColumns = {
  id: "text primary key",
  label: "text not null",
  status: "text not null",
};
