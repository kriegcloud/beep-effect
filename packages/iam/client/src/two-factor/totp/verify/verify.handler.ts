import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./verify.contract.ts";

/**
 * Handler for verifying a TOTP code.
 *
 * Features:
 * - Verifies TOTP code from authenticator app
 * - Completes 2FA setup OR verifies during 2FA-protected sign-in
 * - Notifies $sessionSignal on success (creates/updates session)
 * - Supports trustDevice for 30-day device trust
 * - Uses consistent span naming: "two-factor/totp/verify/handler"
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/totp/index.ts:199-295
 */
export const Handler = createHandler({
  domain: "two-factor/totp",
  feature: "verify",
  execute: (encoded) => client.twoFactor.verifyTotp(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
