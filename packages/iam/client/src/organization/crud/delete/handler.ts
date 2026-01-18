/**
 * @fileoverview
 * Handler for deleting an organization.
 *
 * @module @beep/iam-client/organization/crud/delete/handler
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for deleting an organization.
 *
 * @category Organization/CRUD/Delete
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.delete(encoded))
);
