import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./set-active.contract.ts";

/**
 * Handler for setting a specific session as active.
 *
 * Features:
 * - Switches to a different session by token
 * - Notifies $sessionSignal after success (session state changes)
 * - Uses consistent span naming: "multi-session/set-active/handler"
 */
export const Handler = createHandler({
  domain: "multi-session",
  feature: "set-active",
  execute: (encoded) => client.multiSession.setActive(encoded),
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
