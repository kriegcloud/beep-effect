/**
 * @fileoverview
 * Handler for getting an API key.
 *
 * @module @beep/iam-client/api-key/get/handler
 * @category ApiKey
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for getting an API key.
 *
 * @example
 * ```typescript
 * import { ApiKey } from "@beep/iam-client"
 *
 * const result = yield* ApiKey.Get.Handler({
 *   id: "apikey_123"
 * })
 * ```
 *
 * @category ApiKey/Get
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.apiKey.get({ query: encoded }))
);
