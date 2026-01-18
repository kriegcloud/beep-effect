/**
 * @fileoverview
 * Handler for creating a new organization.
 *
 * @module @beep/iam-client/organization/crud/create/handler
 * @category Organization/CRUD
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for creating a new organization.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.CRUD.Create.Handler({
 *   name: "My Org",
 *   slug: "my-org"
 * })
 * ```
 *
 * @category Organization/CRUD/Create
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) =>
    client.organization.create({
      ...encoded,
      isPersonal: Boolean(encoded.isPersonal),
    })
  )
);
