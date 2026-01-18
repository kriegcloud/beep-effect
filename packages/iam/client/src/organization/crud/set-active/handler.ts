/**
 * @fileoverview
 * Handler for setting the active organization.
 *
 * @module @beep/iam-client/organization/crud/set-active/handler
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for setting the active organization.
 * Changes active organization in session.
 *
 * @category Organization/CRUD/SetActive
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.organization.setActive(encoded))
);
