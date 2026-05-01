/**
 * Client facade composer for the synthetic `fixture-lab/Specimen` slice.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { Specimen } from "@beep/fixture-lab-specimen-domain";
import type { SpecimenNotFound } from "@beep/fixture-lab-specimen-use-cases/public";
import type { Effect } from "effect";
import {
  makeSpecimenCommandClient,
  type SpecimenCommandClient,
  type SpecimenCommandOperation,
  type SpecimenCommandRequest,
} from "./Specimen.command-client.js";
import {
  makeSpecimenQueryClient,
  type SpecimenQueryClient,
  type SpecimenQueryOperation,
  type SpecimenQueryRequest,
} from "./Specimen.query-client.js";

/**
 * Remote operation names supported by the combined specimen client.
 *
 * @example
 * ```ts
 * import type { SpecimenClientOperation } from "@beep/fixture-lab-specimen-client"
 *
 * const operation: SpecimenClientOperation = "getSpecimen"
 * console.log(operation)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export type SpecimenClientOperation = SpecimenCommandOperation | SpecimenQueryOperation;

/**
 * Request envelopes accepted by the combined specimen client.
 *
 * @example
 * ```ts
 * import type { SpecimenClientRequest } from "@beep/fixture-lab-specimen-client"
 * import { GetSpecimen } from "@beep/fixture-lab-specimen-use-cases/public"
 *
 * const request: SpecimenClientRequest = new GetSpecimen({ id: "specimen-1" })
 * console.log(request.id)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export type SpecimenClientRequest = SpecimenCommandRequest | SpecimenQueryRequest;

/**
 * Transport boundary used by the combined specimen client facade.
 *
 * @example
 * ```ts
 * import { Specimen } from "@beep/fixture-lab-specimen-domain"
 * import type { SpecimenClientTransport } from "@beep/fixture-lab-specimen-client"
 * import { Effect } from "effect"
 *
 * declare const specimen: Specimen
 * const transport: SpecimenClientTransport = {
 *   request: () => Effect.succeed(specimen),
 * }
 * void transport
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export interface SpecimenClientTransport {
  readonly request: (
    operation: SpecimenClientOperation,
    body: SpecimenClientRequest
  ) => Effect.Effect<Specimen, SpecimenNotFound>;
}

/**
 * Combined client facade methods exposed to UI and application callers.
 *
 * @example
 * ```ts
 * import type { SpecimenClient } from "@beep/fixture-lab-specimen-client"
 *
 * declare const client: SpecimenClient
 * console.log(client)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export interface SpecimenClient extends SpecimenCommandClient, SpecimenQueryClient {}

/**
 * Create a combined specimen client facade over a transport boundary.
 *
 * @example
 * ```ts
 * import { makeSpecimenClient } from "@beep/fixture-lab-specimen-client"
 * import { Specimen } from "@beep/fixture-lab-specimen-domain"
 * import { Effect } from "effect"
 *
 * declare const specimen: Specimen
 * const client = makeSpecimenClient({
 *   request: () => Effect.succeed(specimen),
 * })
 * const program = client.getSpecimen("specimen-1")
 * void program
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeSpecimenClient = (transport: SpecimenClientTransport): SpecimenClient => ({
  ...makeSpecimenQueryClient(transport),
  ...makeSpecimenCommandClient(transport),
});
