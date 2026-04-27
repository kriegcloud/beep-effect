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
 * @category clients
 * @since 0.0.0
 */
export type SpecimenClientOperation = SpecimenCommandOperation | SpecimenQueryOperation;

/**
 * Request envelopes accepted by the combined specimen client.
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
 * const transport: SpecimenClientTransport = {
 *   request: () => Effect.succeed(new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" })),
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
 * const client = makeSpecimenClient({
 *   request: () => Effect.succeed(new Specimen({ id: "specimen-1", label: "Fixture", status: "draft" })),
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
