import { client } from "@beep/iam-client/adapters";
import { createHandler } from "../../_common/handler.factory.ts";
import * as Contract from "./sign-out.contract.ts";

/**
 * Handler for signing out the current user.
 *
 * Features:
 * - Automatically notifies `$sessionSignal` after successful sign-out
 * - Properly checks for Better Auth errors before decoding response
 * - Uses consistent span naming: "core/sign-out/handler"
 */
export const Handler = createHandler({
  domain: "core",
  feature: "sign-out",
  execute: () => client.signOut(),
  successSchema: Contract.Success,
  mutatesSession: true,
});
