import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./sign-up-email.contract.ts";

/**
 * Handler for signing up with email and password.
 *
 * Features:
 * - Automatically encodes payload (firstName + lastName → name, validates passwords match)
 * - Properly checks for Better Auth errors before decoding response
 * - Notifies `$sessionSignal` after successful sign-up
 * - Uses consistent span naming: "sign-up/email/handler"
 *
 * The Payload schema's encode transform handles:
 * 1. Password confirmation validation (fails if passwords don't match)
 * 2. Computing `name` from firstName + lastName
 * 3. Mapping redirectTo → callbackURL for Better Auth API
 */
export const Handler = createHandler({
  domain: "sign-up",
  feature: "email",
  execute: (encoded) => client.signUp.email(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
