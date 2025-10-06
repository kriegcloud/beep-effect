import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { MemberRole, MemberRoleEnum, MemberStatus } from "./schemas";
/**
 * @description Member model representing user membership in organizations.
 * Maps to the `member` table in the database.
 */
export class Model extends M.Class<Model>(`MemberModel`)(
  makeFields(IamEntityIds.MemberId, {
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user who is a member",
    }),
    status: BS.toOptionalWithDefault(MemberStatus)(MemberStatus.Enum.inactive),
    role: BS.toOptionalWithDefault(MemberRole)(MemberRoleEnum.member).annotations({
      description: "The member's role within the organization",
    }),
    lastActiveAt: BS.FieldOptionOmittable(
      BS.DateTimeFromDate({
        description: "The last time the user was active.",
      })
    ),
    // todo permissions
    permissions: BS.FieldOptionOmittable(S.String),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "Member Model",
    description:
      `Member model representing user membership in organizations.\n` + `Maps to the \`member\` table in the database.`,
    schemaId: Symbol.for("@beep/iam-domain/MemberModel"),
  }
) {}
