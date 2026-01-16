import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./generate.contract.ts";

/**
 * Handler for generating new backup codes.
 *
 * Features:
 * - Generates new backup codes, replacing any existing ones
 * - Requires password verification
 * - Does NOT notify $sessionSignal (no session change)
 * - Uses consistent span naming: "two-factor/backup/generate/handler"
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/backup-codes/index.ts:398-489
 */
export const Handler = createHandler({
  domain: "two-factor/backup",
  feature: "generate",
  execute: (encoded) => client.twoFactor.generateBackupCodes(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
