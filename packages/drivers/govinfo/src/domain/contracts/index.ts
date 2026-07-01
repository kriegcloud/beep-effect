/**
 * Contracts entry point for `@beep/govinfo/domain` — re-exports the assembled
 * GovInfo `HttpApi` surface and the `Search` endpoint contract.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * The assembled GovInfo `HttpApi` and its top-level group, wiring the search
 * endpoint into the contract surface consumed by the GovInfo service client.
 *
 * @since 0.0.0
 * @category Contracts
 */
export * from "./Api.ts";
/**
 * The GovInfo `Search` contract namespace: request payload, success/failure
 * responses, and error schemas for the `POST /search` endpoint.
 *
 * @since 0.0.0
 * @category Models
 */
export * as Search from "./Search/Search.contract.ts";
