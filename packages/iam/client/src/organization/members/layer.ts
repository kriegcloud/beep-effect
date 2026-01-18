/**
 * @fileoverview
 * Organization members layer composition.
 *
 * @module @beep/iam-client/organization/members/layer
 * @category Organization/Members
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import * as List from "./list/mod.ts";
import * as Remove from "./remove/mod.ts";
import * as UpdateRole from "./update-role/mod.ts";

/**
 * Organization members wrapper group.
 *
 * @category Organization/Members
 * @since 0.1.0
 */
export const OrganizationMembersGroup = Wrap.WrapperGroup.make(
  List.Contract.Wrapper,
  Remove.Contract.Wrapper,
  UpdateRole.Contract.Wrapper
);

/**
 * Organization members layer with implemented handlers.
 *
 * @category Organization/Members
 * @since 0.1.0
 */
export const layer = OrganizationMembersGroup.toLayer({
  List: List.Handler,
  Remove: Remove.Handler,
  UpdateRole: UpdateRole.Handler,
});
