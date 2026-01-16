import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./verify.contract.ts";

/**
 * Handler for verifying an OTP code.
 *
 * Features:
 * - Verifies email/SMS OTP during 2FA-protected sign-in
 * - Alternative to TOTP verification
 * - Notifies $sessionSignal on success (creates session)
 * - Supports trustDevice for 30-day device trust
 * - Uses consistent span naming: "two-factor/otp/verify/handler"
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/otp/index.ts:219-378
 */
export const Handler = createHandler({
  domain: "two-factor/otp",
  feature: "verify",
  execute: (encoded) => client.twoFactor.verifyOtp(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
