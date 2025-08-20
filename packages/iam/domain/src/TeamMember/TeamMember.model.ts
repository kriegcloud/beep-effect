import {Common, IamEntityIds, SharedEntityIds} from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Team Member model representing user membership in teams.
 * Maps to the `teamMember` table in the database.
 */
export class Model extends M.Class<Model>(`TeamMemberModel`)({
  /** Primary key identifier for the team membership */
  id: M.Generated(IamEntityIds.TeamMemberId),

  /** Team this membership belongs to */
  teamId: SharedEntityIds.TeamId.annotations({
    description: "ID of the team this membership belongs to",
  }),

  /** User who is a member of the team */
  userId: IamEntityIds.UserId.annotations({
    description: "ID of the user who is a team member",
  }),

  /** Member's role in the team */
  role: S.Literal("member", "admin", "owner").annotations({
    description: "The member's role within the team",
  }),

  // Default columns include organizationId
  ...Common.defaultColumns,
}) {
}
