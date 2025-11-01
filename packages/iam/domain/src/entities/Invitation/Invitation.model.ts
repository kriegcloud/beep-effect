import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { InvitationStatus, InvitationStatusEnum } from "./schemas";

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
    status: BS.toOptionalWithDefault(InvitationStatus)(InvitationStatusEnum.pending).annotations({
      description: "Current status of the invitation",
    }),

    /** When the invitation expires */
    expiresAt: BS.DateTimeFromDate({
      description: "When this invitation expires",
    }),

    /** User who sent the invitation */
    inviterId: SharedEntityIds.UserId.annotations({
      description: "ID of the user who sent this invitation",
    }),

    organizationId: BS.FieldOptionOmittable(SharedEntityIds.OrganizationId),
  }),
  {
    title: "Invitation Model",
    description: "Invitation model representing organization and team invitations.",
    schemaId: InvitationModelSchemaId,
  }
) {
  static readonly utils = modelKit(Model);
}
