import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./revoke.contract.ts";

/**
 * Handler for revoking a specific session.
 *
 * Features:
 * - Removes a session by token
 * - Notifies $sessionSignal after success (session state changes)
 * - Uses consistent span naming: "multi-session/revoke/handler"
 */
export const Handler = createHandler({
  domain: "multi-session",
  feature: "revoke",
  execute: (encoded) => client.multiSession.revoke(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
