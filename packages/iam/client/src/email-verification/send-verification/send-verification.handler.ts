import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./send-verification.contract.ts";

/**
 * Handler for sending a verification email.
 *
 * Features:
 * - Sends email verification link to specified address
 * - Does NOT notify $sessionSignal (email-only operation)
 * - Works with or without active session
 * - Uses consistent span naming: "email-verification/send-verification/handler"
 *
 * Source: tmp/better-auth/packages/better-auth/src/api/routes/email-verification.ts:77-204
 */
export const Handler = createHandler({
  domain: "email-verification",
  feature: "send-verification",
  execute: (encoded) => client.sendVerificationEmail(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
