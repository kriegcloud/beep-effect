import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const TeamMemberModelSchemaId = Symbol.for("@beep/iam-domain/TeamMemberModel");

/**
 * Team Member model representing user membership in teams.
 * Maps to the `teamMember` table in the database.
 */
export class Model extends M.Class<Model>(`TeamMemberModel`)(
  makeFields(IamEntityIds.TeamMemberId, {
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
    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "Team Member Model",
    description: "Team Member model representing user membership in teams.",
    schemaId: TeamMemberModelSchemaId,
  }
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
