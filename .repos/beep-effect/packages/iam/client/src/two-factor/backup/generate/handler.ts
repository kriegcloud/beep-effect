/**
 * @fileoverview
 * Handler for generating new backup codes.
 *
 * @module @beep/iam-client/two-factor/backup/generate/handler
 * @category TwoFactor/Backup
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for generating new backup codes.
 *
 * Features:
 * - Generates new backup codes, replacing any existing ones
 * - Requires password verification
 * - Does NOT notify $sessionSignal (no session change)
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 *
 * const result = yield* TwoFactor.Backup.Generate.Handler({
 *   password: Redacted.make("password123")
 * })
 * ```
 *
 * @category TwoFactor/Backup/Generate
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.twoFactor.generateBackupCodes(encoded))
);
