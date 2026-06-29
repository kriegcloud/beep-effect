import { HttpApiEndpoint, HttpApiSchema } from "effect/unstable/httpapi";
import * as Contract from "./Search.contract.ts";

/**
 * HTTP endpoint descriptor for GovInfo search.
 *
 * @example
 * ```ts
 * import { Http } from "@beep/govinfo/domain/contracts/Search/Search.http"
 *
 * console.log(Http)
 * ```
 *
 * @category endpoints
 * @since 0.0.0
 */
export const Http = HttpApiEndpoint.post("search", "/search", {
  payload: Contract.Payload,
  error: Contract.Failure,
  success: Contract.Success.pipe(HttpApiSchema.status(200)),
});
