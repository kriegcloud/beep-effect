/**
 * @fileoverview
 * Handler for listing organizations.
 *
 * @module @beep/iam-client/organization/crud/list/handler
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for listing organizations.
 *
 * @category Organization/CRUD/List
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((_encoded) => client.organization.list())
);
