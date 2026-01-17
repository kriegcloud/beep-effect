import { client } from "@beep/iam-client/adapters";
import * as Common from "../../_common";
import * as Contract from "./contract.ts";
/**
 * Handler for signing out the current user.
 *
 * Features:
 * - Automatically notifies `$sessionSignal` after successful sign-out
 * - Properly checks for Better Auth errors before decoding response
 * - Uses consistent span naming: "core/sign-out/handler"
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.signOut())
);
