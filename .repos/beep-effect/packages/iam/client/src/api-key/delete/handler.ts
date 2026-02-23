/**
 * @fileoverview
 * Handler for deleting an API key.
 *
 * @module @beep/iam-client/api-key/delete/handler
 * @category ApiKey
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for deleting an API key.
 *
 * @example
 * ```typescript
 * import { ApiKey } from "@beep/iam-client"
 *
 * const result = yield* ApiKey.Delete.Handler({
 *   keyId: "apikey_123"
 * })
 * // result.success is true if key was deleted
 * ```
 *
 * @category ApiKey/Delete
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.apiKey.delete(encoded))
);
