/**
 * This service can be used to query the GovInfo search engine and return results that are the equivalent
 * to what is returned by the main user interface. You can use field operators, such as congress, publishdate,
 * branch, and others to construct complex queries that will return only matching documents. For additional information, please see our <a href='https://www.govinfo.gov/features/search-service-overview\' target='blank' style='text-decoration:underline'>search service overview.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * The GovInfo search contract schemas: the request payload, the successful and
 * failure response bodies, and the typed errors for the `POST /search` endpoint.
 *
 * @category models
 * @since 0.0.0
 */
export * as Search from "./Search.contract.ts";
/**
 * The GovInfo search HTTP endpoint descriptor binding the `POST /search` route
 * to its request payload and success/error response contracts.
 *
 * @category models
 * @since 0.0.0
 */
export * from "./Search.http.ts";
