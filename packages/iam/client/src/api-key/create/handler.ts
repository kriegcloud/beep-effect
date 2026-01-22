/**
 * @fileoverview
 * Handler for creating an API key.
 *
 * @module @beep/iam-client/api-key/create/handler
 * @category ApiKey
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for creating an API key.
 *
 * @example
 * ```typescript
 * import { ApiKey } from "@beep/iam-client"
 *
 * const result = yield* ApiKey.Create.Handler({
 *   name: "My API Key"
 * })
 * // result.apiKey contains the key (only returned on create)
 * ```
 *
 * @category ApiKey/Create
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.apiKey.create(encoded))
);
