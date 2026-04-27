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
 * @category clients
 * @since 0.0.0
 */
export type SpecimenQueryOperation = "getSpecimen";

/**
 * Query request envelopes accepted by the specimen query client.
 *
 * @category clients
 * @since 0.0.0
 */
export type SpecimenQueryRequest = GetSpecimen;

/**
 * Transport boundary used by the specimen query client.
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
 * const client = makeSpecimenQueryClient({
 *   request: () => Effect.succeed(new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" })),
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
