import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";

const $I = $IamDomainId.create("entities/TeamMember/TeamMember.model");

/**
 * Team Member model representing user membership in teams.
 * Maps to the `teamMember` table in the database.
 */
export class Model extends M.Class<Model>($I`TeamMemberModel`)(
  makeFields(IamEntityIds.TeamMemberId, {
    /** Team this membership belongs to */
    teamId: SharedEntityIds.TeamId.annotations({
      description: "ID of the team this membership belongs to",
    }),

    /** User who is a member of the team */
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user who is a team member",
    }),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  $I.annotations("TeamMemberModel", {
    title: "Team Member Model",
    description: "Team Member model representing user membership in teams.",
  })
) {
  static readonly utils = modelKit(Model);
}
