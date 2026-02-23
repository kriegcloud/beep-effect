/**
 * @fileoverview
 * Layer composition for backup handlers.
 *
 * @module @beep/iam-client/two-factor/backup/layer
 * @category TwoFactor/Backup
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { Generate } from "./generate";
import { Verify } from "./verify";

/**
 * Wrapper group containing all backup wrappers.
 *
 * @category TwoFactor/Backup
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(Generate.Wrapper, Verify.Wrapper);

/**
 * Effect layer providing backup handlers.
 *
 * @category TwoFactor/Backup
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  Generate: Generate.Handler,
  Verify: Verify.Handler,
});
