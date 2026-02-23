/**
 * @fileoverview
 * Handler for listing API keys.
 *
 * @module @beep/iam-client/api-key/list/handler
 * @category ApiKey
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for listing API keys.
 *
 * @example
 * ```typescript
 * import { ApiKey } from "@beep/iam-client"
 *
 * const result = yield* ApiKey.List.Handler({})
 * // result.apiKeys contains array of API keys
 * ```
 *
 * @category ApiKey/List
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.apiKey.list())
);
