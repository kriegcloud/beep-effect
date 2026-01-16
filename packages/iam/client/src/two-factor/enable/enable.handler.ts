import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./enable.contract.ts";

/**
 * Handler for enabling two-factor authentication.
 *
 * Features:
 * - Initializes 2FA setup with TOTP secret and backup codes
 * - Returns TOTP URI for authenticator app
 * - Does NOT notify $sessionSignal (2FA not active until verified)
 * - Uses consistent span naming: "two-factor/enable/handler"
 *
 * Note: Session is only mutated if server has `skipVerificationOnEnable: true`.
 * Default behavior requires verifyTotp to complete setup.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/index.ts:91-202
 */
export const Handler = createHandler({
  domain: "two-factor",
  feature: "enable",
  execute: (encoded) => client.twoFactor.enable(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
