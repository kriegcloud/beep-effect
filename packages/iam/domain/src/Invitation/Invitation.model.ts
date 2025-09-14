import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export const InvitationModelSchemaId = Symbol.for("@beep/iam-domain/InvitationModel");

/**
 * Invitation model representing organization and team invitations.
 * Maps to the `invitation` table in the database.
 */
export class Model extends M.Class<Model>(`InvitationModel`)(
  makeFields(IamEntityIds.InvitationId, {
    /** Email address of the invitee */
    email: M.Sensitive(
      BS.EmailBase.annotations({
        description: "Email address of the person being invited",
        examples: [BS.EmailBase.make("newuser@example.com")],
      })
    ),

    /** Role to be assigned upon acceptance */
    role: BS.FieldOptionOmittable(
      S.NonEmptyString.annotations({
        description: "Role to be assigned when invitation is accepted",
        examples: ["admin", "member", "viewer"],
      })
    ),

    /** Team invitation is for (optional) */
    teamId: BS.FieldOptionOmittable(
      SharedEntityIds.TeamId.annotations({
        description: "ID of the team this invitation is for (if team-specific)",
      })
    ),

    /** Current status of the invitation */
    status: S.Literal("pending", "rejected", "cancelled", "accepted").annotations({
      description: "Current status of the invitation",
    }),

    /** When the invitation expires */
    expiresAt: BS.DateTimeFromDate({
      description: "When this invitation expires",
    }),

    /** User who sent the invitation */
    inviterId: IamEntityIds.UserId.annotations({
      description: "ID of the user who sent this invitation",
    }),

    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "Invitation Model",
    description: "Invitation model representing organization and team invitations.",
    schemaId: InvitationModelSchemaId,
  }
) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
