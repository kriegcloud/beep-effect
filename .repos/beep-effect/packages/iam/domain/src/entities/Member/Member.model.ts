import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import { PolicyRecord } from "@beep/shared-domain/Policy";
import * as M from "@effect/sql/Model";
import { MemberRole, MemberRoleEnum, MemberStatus } from "./schemas";

const $I = $IamDomainId.create("entities/Member/Member.model");
/**
 * @description Member model representing user membership in organizations.
 * Maps to the `member` table in the database.
 */
export class Model extends M.Class<Model>($I`MemberModel`)(
  makeFields(IamEntityIds.MemberId, {
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user who is a member",
    }),
    status: BS.toOptionalWithDefault(MemberStatus)(MemberStatus.Enum.inactive),
    role: BS.toOptionalWithDefault(MemberRole)(MemberRoleEnum.member).annotations({
      description: "The member's role within the organization",
    }),
    lastActiveAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "The last time the user was active.",
      })
    ),
    invitedBy: BS.FieldOptionOmittable(
      SharedEntityIds.UserId.annotations({
        description: "ID of the user who invited this member",
      })
    ),
    invitedAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When this member was invited to the organization",
      })
    ),
    joinedAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When this member accepted the invitation and joined",
      })
    ),
    permissions: BS.JsonFromStringOption(
      PolicyRecord.annotations({
        description: "Permissions granted to the member",
      })
    ),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  $I.annotations("MemberModel", {
    title: "Member Model",
    description:
      `Member model representing user membership in organizations.\n` + `Maps to the \`member\` table in the database.`,
  })
) {
  static readonly utils = modelKit(Model);
}
