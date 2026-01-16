import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./disable.contract.ts";

/**
 * Handler for disabling two-factor authentication.
 *
 * Features:
 * - Disables 2FA for the current user
 * - Requires password verification
 * - Notifies $sessionSignal (session refreshed with updated user data)
 * - Uses consistent span naming: "two-factor/disable/handler"
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/index.ts:218-295
 */
export const Handler = createHandler({
  domain: "two-factor",
  feature: "disable",
  execute: (encoded) => client.twoFactor.disable(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
