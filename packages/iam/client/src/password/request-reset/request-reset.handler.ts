import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./request-reset.contract.ts";

/**
 * Handler for requesting a password reset email.
 *
 * Features:
 * - Sends password reset email to the specified address
 * - Does NOT notify $sessionSignal (email-only operation)
 * - Uses consistent span naming: "password/request-reset/handler"
 */
export const Handler = createHandler({
  domain: "password",
  feature: "request-reset",
  execute: (encoded) => client.requestPasswordReset(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
