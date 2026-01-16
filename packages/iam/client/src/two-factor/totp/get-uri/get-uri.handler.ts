import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./get-uri.contract.ts";

/**
 * Handler for getting the TOTP URI.
 *
 * Features:
 * - Retrieves existing TOTP URI for authenticator re-setup
 * - Requires password verification
 * - Does NOT notify $sessionSignal (read-only operation)
 * - Uses consistent span naming: "two-factor/totp/get-uri/handler"
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/totp/index.ts:128-196
 */
export const Handler = createHandler({
  domain: "two-factor/totp",
  feature: "get-uri",
  execute: (encoded) => client.twoFactor.getTotpUri(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: false,
});
