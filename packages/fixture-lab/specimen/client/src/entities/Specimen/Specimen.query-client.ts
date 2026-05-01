/**
 * Query client for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { Specimen } from "@beep/fixture-lab-specimen-domain";
import { GetSpecimen, type SpecimenNotFound } from "@beep/fixture-lab-specimen-use-cases/public";
import { Effect } from "effect";

/**
 * Remote query operation names supported by the specimen client.
 *
 * @example
 * ```ts
 * import type { SpecimenQueryOperation } from "@beep/fixture-lab-specimen-client"
 *
 * const operation: SpecimenQueryOperation = "getSpecimen"
 * console.log(operation)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export type SpecimenQueryOperation = "getSpecimen";

/**
 * Query request envelopes accepted by the specimen query client.
 *
 * @example
 * ```ts
 * import type { SpecimenQueryRequest } from "@beep/fixture-lab-specimen-client"
 * import { GetSpecimen } from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * const request: SpecimenQueryRequest = new GetSpecimen({ id: "specimen-1" })
 * console.log(request.id)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export type SpecimenQueryRequest = GetSpecimen;

/**
 * Transport boundary used by the specimen query client.
 *
 * @example
 * ```ts
 * import type { SpecimenQueryTransport } from "@beep/fixture-lab-specimen-client"
 *
 * declare const transport: SpecimenQueryTransport
 * console.log(transport)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export interface SpecimenQueryTransport {
  readonly request: (
    operation: SpecimenQueryOperation,
    body: SpecimenQueryRequest
  ) => Effect.Effect<Specimen, SpecimenNotFound>;
}

/**
 * Query methods exposed by the specimen client facade.
 *
 * @example
 * ```ts
 * import type { SpecimenQueryClient } from "@beep/fixture-lab-specimen-client"
 *
 * declare const client: SpecimenQueryClient
 * console.log(client)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export interface SpecimenQueryClient {
  readonly getSpecimen: (id: string) => Effect.Effect<Specimen, SpecimenNotFound>;
}

/**
 * Create a specimen query client facade over a transport boundary.
 *
 * @example
 * ```ts
 * import { makeSpecimenQueryClient } from "@beep/fixture-lab-specimen-client"
 * import { Specimen } from "@beep/fixture-lab-specimen-domain"
 * import { Effect } from "effect"
 *
 * declare const specimen: Specimen
 * const client = makeSpecimenQueryClient({
 *   request: () => Effect.succeed(specimen),
 * })
 * const program = client.getSpecimen("specimen-1")
 * void program
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeSpecimenQueryClient = (transport: SpecimenQueryTransport): SpecimenQueryClient => ({
  getSpecimen: Effect.fn("SpecimenQueryClient.getSpecimen")((id: string) =>
    transport.request("getSpecimen", new GetSpecimen({ id }))
  ),
});
