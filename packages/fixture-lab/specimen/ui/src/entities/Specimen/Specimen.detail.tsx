/**
 * React detail surface for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { Specimen } from "@beep/fixture-lab-specimen-domain";

/**
 * Props accepted by the specimen detail component.
 *
 * @category components
 * @since 0.0.0
 */
export interface SpecimenDetailProps {
  readonly specimen: Specimen;
}

/**
 * Render a compact specimen status detail.
 *
 * @example
 * ```tsx
 * import { Specimen } from "@beep/fixture-lab-specimen-domain"
 * import { SpecimenDetail } from "@beep/fixture-lab-specimen-ui"
 *
 * const element = <SpecimenDetail
 *   specimen={new Specimen({ id: "specimen-1", label: "Fixture", status: "observed" })}
 * />
 * void element
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const SpecimenDetail = ({ specimen }: SpecimenDetailProps) => (
  <section aria-label="Specimen">
    <h2>{specimen.label}</h2>
    <p>{specimen.status}</p>
  </section>
);
