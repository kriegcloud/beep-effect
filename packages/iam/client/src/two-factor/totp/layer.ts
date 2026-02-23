/**
 * @fileoverview
 * Layer composition for TOTP handlers.
 *
 * @module @beep/iam-client/two-factor/totp/layer
 * @category TwoFactor/TOTP
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { GetUri } from "./get-uri";
import { Verify } from "./verify";

/**
 * Wrapper group containing all TOTP wrappers.
 *
 * @category TwoFactor/TOTP
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(GetUri.Wrapper, Verify.Wrapper);

/**
 * Effect layer providing TOTP handlers.
 *
 * @category TwoFactor/TOTP
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  GetUri: GetUri.Handler,
  Verify: Verify.Handler,
});
