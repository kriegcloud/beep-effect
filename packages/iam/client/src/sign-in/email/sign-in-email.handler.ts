import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./sign-in-email.contract.ts";

/**
 * Handler for signing in with email and password.
 *
 * Features:
 * - Automatically encodes payload before sending to Better Auth
 * - Properly checks for Better Auth errors before decoding response
 * - Notifies `$sessionSignal` after successful sign-in
 * - Uses consistent span naming: "sign-in/email/handler"
 */
export const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
