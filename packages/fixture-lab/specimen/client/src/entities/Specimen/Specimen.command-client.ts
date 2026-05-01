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
 * @example
 * ```ts
 * import type { SpecimenCommandOperation } from "@beep/fixture-lab-specimen-client"
 *
 * const operation: SpecimenCommandOperation = "observeSpecimen"
 * console.log(operation)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export type SpecimenCommandOperation = "observeSpecimen" | "retireSpecimen";

/**
 * Command request envelopes accepted by the specimen command client.
 *
 * @example
 * ```ts
 * import type { SpecimenCommandRequest } from "@beep/fixture-lab-specimen-client"
 * import { ObserveSpecimen } from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * const request: SpecimenCommandRequest = new ObserveSpecimen({ id: "specimen-1" })
 * console.log(request.id)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export type SpecimenCommandRequest = ObserveSpecimen | RetireSpecimen;

/**
 * Transport boundary used by the specimen command client.
 *
 * @example
 * ```ts
 * import type { SpecimenCommandTransport } from "@beep/fixture-lab-specimen-client"
 *
 * declare const transport: SpecimenCommandTransport
 * console.log(transport)
 * ```
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
 * @example
 * ```ts
 * import type { SpecimenCommandClient } from "@beep/fixture-lab-specimen-client"
 *
 * declare const client: SpecimenCommandClient
 * console.log(client)
 * ```
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
 * declare const specimen: Specimen
 * const client = makeSpecimenCommandClient({
 *   request: () => Effect.succeed(specimen),
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
