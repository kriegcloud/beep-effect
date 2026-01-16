import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./reset.contract.ts";

/**
 * Handler for resetting a password with a token.
 *
 * Features:
 * - Validates reset token and sets new password
 * - Does NOT create a session (user must sign in afterward)
 * - Uses consistent span naming: "password/reset/handler"
 */
export const Handler = createHandler({
  domain: "password",
  feature: "reset",
  execute: (encoded) => client.resetPassword(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
