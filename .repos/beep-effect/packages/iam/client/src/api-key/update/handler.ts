/**
 * @fileoverview
 * Handler for updating an API key.
 *
 * @module @beep/iam-client/api-key/update/handler
 * @category ApiKey
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for updating an API key.
 *
 * @example
 * ```typescript
 * import { ApiKey } from "@beep/iam-client"
 *
 * const result = yield* ApiKey.Update.Handler({
 *   keyId: "apikey_123",
 *   name: "Updated Key Name",
 *   enabled: true
 * })
 * ```
 *
 * @category ApiKey/Update
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.apiKey.update(encoded))
);
