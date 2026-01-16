import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./list-sessions.contract.ts";

/**
 * Handler for listing all device sessions for the current user.
 *
 * Features:
 * - Returns all active sessions across devices
 * - Does NOT notify $sessionSignal (read-only operation)
 * - Uses consistent span naming: "multi-session/list-sessions/handler"
 */
export const Handler = createHandler({
  domain: "multi-session",
  feature: "list-sessions",
  execute: () => client.multiSession.listDeviceSessions({}),
  successSchema: Contract.Success,
  mutatesSession: false,
});
