/**
 * Command client for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { Specimen } from "@beep/fixture-lab-specimen-domain";
import { ObserveSpecimen, RetireSpecimen, type SpecimenNotFound } from "@beep/fixture-lab-specimen-use-cases/public";
import { Effect } from "effect";

/**
 * Remote command operation names supported by the specimen client.
 *
 * @category clients
 * @since 0.0.0
 */
export type SpecimenCommandOperation = "observeSpecimen" | "retireSpecimen";

/**
 * Command request envelopes accepted by the specimen command client.
 *
 * @category clients
 * @since 0.0.0
 */
export type SpecimenCommandRequest = ObserveSpecimen | RetireSpecimen;

/**
 * Transport boundary used by the specimen command client.
 *
 * @category clients
 * @since 0.0.0
 */
export interface SpecimenCommandTransport {
  readonly request: (
    operation: SpecimenCommandOperation,
    body: SpecimenCommandRequest
  ) => Effect.Effect<Specimen, SpecimenNotFound>;
}

/**
 * Command methods exposed by the specimen client facade.
 *
 * @category clients
 * @since 0.0.0
 */
export interface SpecimenCommandClient {
  readonly observeSpecimen: (id: string) => Effect.Effect<Specimen, SpecimenNotFound>;
  readonly retireSpecimen: (id: string) => Effect.Effect<Specimen, SpecimenNotFound>;
}

/**
 * Create a specimen command client facade over a transport boundary.
 *
 * @example
 * ```ts
 * import { makeSpecimenCommandClient } from "@beep/fixture-lab-specimen-client"
 * import { Specimen } from "@beep/fixture-lab-specimen-domain"
 * import { Effect } from "effect"
 *
 * const client = makeSpecimenCommandClient({
 *   request: () => Effect.succeed(new Specimen({ id: "specimen-1", label: "Fixture", status: "observed" })),
 * })
 * const program = client.observeSpecimen("specimen-1")
 * void program
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeSpecimenCommandClient = (transport: SpecimenCommandTransport): SpecimenCommandClient => ({
  observeSpecimen: Effect.fn("SpecimenCommandClient.observeSpecimen")((id: string) =>
    transport.request("observeSpecimen", new ObserveSpecimen({ id }))
  ),
  retireSpecimen: Effect.fn("SpecimenCommandClient.retireSpecimen")((id: string) =>
    transport.request("retireSpecimen", new RetireSpecimen({ id }))
  ),
});
