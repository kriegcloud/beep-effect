import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./send.contract.ts";

/**
 * Handler for sending an OTP code via email/SMS.
 *
 * Features:
 * - Sends one-time password to user's email/phone
 * - Alternative to TOTP for 2FA verification
 * - Does NOT notify $sessionSignal (email-only operation)
 * - Uses consistent span naming: "two-factor/otp/send/handler"
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/otp/index.ts:157-217
 */
export const Handler = createHandler({
  domain: "two-factor/otp",
  feature: "send",
  execute: (encoded) => client.twoFactor.sendOtp(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
