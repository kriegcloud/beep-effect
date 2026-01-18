/**
 * @fileoverview
 * Organization invitations layer composition.
 *
 * @module @beep/iam-client/organization/invitations/layer
 * @category Organization/Invitations
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import * as Accept from "./accept/mod.ts";
import * as Cancel from "./cancel/mod.ts";
import * as Create from "./create/mod.ts";
import * as List from "./list/mod.ts";
import * as Reject from "./reject/mod.ts";

/**
 * Organization invitations wrapper group.
 *
 * @category Organization/Invitations
 * @since 0.1.0
 */
export const OrganizationInvitationsGroup = Wrap.WrapperGroup.make(
  Accept.Contract.Wrapper,
  Cancel.Contract.Wrapper,
  Create.Contract.Wrapper,
  List.Contract.Wrapper,
  Reject.Contract.Wrapper
);

/**
 * Organization invitations layer with implemented handlers.
 *
 * @category Organization/Invitations
 * @since 0.1.0
 */
export const layer = OrganizationInvitationsGroup.toLayer({
  Accept: Accept.Handler,
  Cancel: Cancel.Handler,
  Create: Create.Handler,
  List: List.Handler,
  Reject: Reject.Handler,
});
