/**
 * @fileoverview
 * Organization roles layer composition.
 *
 * @module @beep/iam-client/organization/roles/layer
 * @category Organization/Roles
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import * as Create from "../create-role/mod.ts";
import * as Delete from "../delete-role/mod.ts";
import * as Get from "../get-role/mod.ts";
import * as List from "../list-roles/mod.ts";
import * as Update from "../update-role/mod.ts";

/**
 * Organization roles wrapper group.
 *
 * @category Organization/Roles
 * @since 0.1.0
 */
export const OrganizationRolesGroup = Wrap.WrapperGroup.make(
	Create.Contract.Wrapper,
	Delete.Contract.Wrapper,
	Get.Contract.Wrapper,
	List.Contract.Wrapper,
	Update.Contract.Wrapper,
);

/**
 * Organization roles layer with implemented handlers.
 *
 * @category Organization/Roles
 * @since 0.1.0
 */
export const layer = OrganizationRolesGroup.toLayer({
	CreateRole: Create.Handler,
	DeleteRole: Delete.Handler,
	GetRole: Get.Handler,
	ListRoles: List.Handler,
	UpdateRole: Update.Handler,
});
