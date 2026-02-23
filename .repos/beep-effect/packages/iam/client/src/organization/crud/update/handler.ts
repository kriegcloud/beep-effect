/**
 * @fileoverview
 * Handler for updating an organization.
 *
 * @module @beep/iam-client/organization/crud/update/handler
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for updating an organization.
 *
 * @category Organization/CRUD/Update
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.update(encoded))
);
