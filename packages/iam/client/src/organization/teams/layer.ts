/**
 * @fileoverview
 * Organization teams layer composition.
 *
 * @module @beep/iam-client/organization/teams/layer
 * @category Organization/Teams
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import * as AddMember from "../add-team-member/mod.ts";
import * as Create from "../create-team/mod.ts";
import * as List from "../list-teams/mod.ts";
import * as ListUserTeams from "../list-user-teams/mod.ts";
import * as Remove from "../remove-team/mod.ts";
import * as RemoveMember from "../remove-team-member/mod.ts";
import * as SetActive from "../set-active-team/mod.ts";
import * as Update from "../update-team/mod.ts";

/**
 * Organization teams wrapper group.
 *
 * @category Organization/Teams
 * @since 0.1.0
 */
export const OrganizationTeamsGroup = Wrap.WrapperGroup.make(
	Create.Contract.Wrapper,
	List.Contract.Wrapper,
	Update.Contract.Wrapper,
	Remove.Contract.Wrapper,
	SetActive.Contract.Wrapper,
	ListUserTeams.Contract.Wrapper,
	AddMember.Contract.Wrapper,
	RemoveMember.Contract.Wrapper,
);

/**
 * Organization teams layer with implemented handlers.
 *
 * @category Organization/Teams
 * @since 0.1.0
 */
export const layer = OrganizationTeamsGroup.toLayer({
	CreateTeam: Create.Handler,
	ListTeams: List.Handler,
	UpdateTeam: Update.Handler,
	RemoveTeam: Remove.Handler,
	SetActiveTeam: SetActive.Handler,
	ListUserTeams: ListUserTeams.Handler,
	AddTeamMember: AddMember.Handler,
	RemoveTeamMember: RemoveMember.Handler,
});
