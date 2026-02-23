/**
 * @fileoverview
 * Layer composition for two-factor handlers.
 *
 * This layer composes the top-level Enable and Disable handlers.
 * Submodule handlers (Backup, OTP, TOTP) have their own dedicated layers.
 *
 * @module @beep/iam-client/two-factor/layer
 * @category TwoFactor
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { Disable } from "./disable";
import { Enable } from "./enable";

/**
 * Wrapper group containing top-level two-factor wrappers.
 *
 * @category TwoFactor
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(Enable.Wrapper, Disable.Wrapper);

/**
 * Effect layer providing top-level two-factor handlers.
 *
 * @category TwoFactor
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  Enable: Enable.Handler,
  Disable: Disable.Handler,
});
