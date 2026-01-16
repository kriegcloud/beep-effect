import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./verify.contract.ts";

/**
 * Handler for verifying a backup code.
 *
 * Features:
 * - Verifies one-time backup code during 2FA-protected sign-in
 * - Each backup code can only be used once
 * - Notifies $sessionSignal on success (creates session)
 * - Supports trustDevice for 30-day device trust
 * - disableSession option skips session creation
 * - Uses consistent span naming: "two-factor/backup/verify/handler"
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/backup-codes/index.ts:190-382
 */
export const Handler = createHandler({
  domain: "two-factor/backup",
  feature: "verify",
  execute: (encoded) => client.twoFactor.verifyBackupCode(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
