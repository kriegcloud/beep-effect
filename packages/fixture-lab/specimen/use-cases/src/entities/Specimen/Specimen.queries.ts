/**
 * Application queries for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $FixtureLabSpecimenId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $FixtureLabSpecimenId.create("use-cases/entities/Specimen/Specimen.queries");

/**
 * Query requesting the current specimen state.
 *
 * @example
 * ```ts
 * import { GetSpecimen } from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * const query = new GetSpecimen({ id: "specimen-1" })
 * console.log(query.id)
 * ```
 *
 * @category queries
 * @since 0.0.0
 */
export class GetSpecimen extends S.Class<GetSpecimen>($I`GetSpecimen`)(
  {
    id: S.String,
  },
  $I.annote("GetSpecimen", {
    description: "Query requesting the current specimen state.",
  })
) {}
