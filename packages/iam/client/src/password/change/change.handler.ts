import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./change.contract.ts";

/**
 * Handler for changing the current user's password.
 *
 * Features:
 * - Requires current password for verification
 * - Optionally revokes other sessions via `revokeOtherSessions`
 * - Notifies $sessionSignal after success
 * - Uses consistent span naming: "password/change/handler"
 */
export const Handler = createHandler({
  domain: "password",
  feature: "change",
  execute: (encoded) => client.changePassword(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
