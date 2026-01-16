import { createHandler } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./get-session.contract.ts";
/**
 * Handler for getting the current session.
 *
 * NOTE: This handler doesn't use the factory pattern because:
 * 1. client.getSession() returns `{ data: { session, user } | null }` directly
 *    (not the `{ data, error }` dual-channel like other endpoints)
 * 2. The Success schema expects `{ data: ... }` as input, not just the inner data
 *
 * Features:
 * - Decodes response with Success schema (handles null → Option.none())
 * - Does NOT notify $sessionSignal (read-only operation)
 * - Uses consistent span naming: "core/get-session/handler"
 */
export const Handler = createHandler({
  domain: "core",
  feature: "get-session",
  execute: () => client.getSession(),
  successSchema: Contract.Success,
  mutatesSession: false,
});
