/**
 * @fileoverview
 * Handler for getting full organization details.
 *
 * @module @beep/iam-client/organization/crud/get-full/handler
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for getting full organization details.
 *
 * @category Organization/CRUD/GetFull
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.getFullOrganization(encoded))
);
