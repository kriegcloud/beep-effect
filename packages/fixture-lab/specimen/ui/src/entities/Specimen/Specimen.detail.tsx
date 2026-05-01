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
 * @example
 * ```tsx
 * import type { Specimen } from "@beep/fixture-lab-specimen-domain"
 * import type { SpecimenDetailProps } from "@beep/fixture-lab-specimen-ui"
 *
 * declare const specimen: Specimen
 * const props: SpecimenDetailProps = { specimen }
 * console.log(props)
 * ```
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
 * declare const specimen: Specimen
 * const element = <SpecimenDetail specimen={specimen} />
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
