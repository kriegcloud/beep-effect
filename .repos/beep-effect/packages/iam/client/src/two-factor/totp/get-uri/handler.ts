/**
 * @fileoverview
 * Handler for getting the TOTP URI.
 *
 * @module @beep/iam-client/two-factor/totp/get-uri/handler
 * @category TwoFactor/TOTP
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for getting the TOTP URI.
 *
 * Features:
 * - Retrieves existing TOTP URI for authenticator re-setup
 * - Requires password verification
 * - Does NOT notify $sessionSignal (read-only operation)
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 *
 * const result = yield* TwoFactor.TOTP.GetUri.Handler({
 *   password: Redacted.make("password123")
 * })
 * ```
 *
 * @category TwoFactor/TOTP/GetUri
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.twoFactor.getTotpUri(encoded))
);
