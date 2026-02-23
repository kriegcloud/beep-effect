/**
 * @fileoverview
 * Handler for verifying a backup code.
 *
 * @module @beep/iam-client/two-factor/backup/verify/handler
 * @category TwoFactor/Backup
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for verifying a backup code.
 *
 * Features:
 * - Verifies one-time backup code during 2FA-protected sign-in
 * - Each backup code can only be used once
 * - Notifies $sessionSignal on success (creates session)
 * - Supports trustDevice for 30-day device trust
 * - disableSession option skips session creation
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 *
 * const result = yield* TwoFactor.Backup.Verify.Handler({
 *   code: "backup-code-123"
 * })
 * ```
 *
 * @category TwoFactor/Backup/Verify
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.twoFactor.verifyBackupCode(encoded))
);
