import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import { MemberRole, MemberRoleEnum } from "./schemas";

export const MemberModelSchemaId = Symbol.for("@beep/iam-domain/MemberModel");

/**
 * @description Member model representing user membership in organizations.
 * Maps to the `member` table in the database.
 */
export class Model extends M.Class<Model>(`MemberModel`)(
  makeFields(IamEntityIds.MemberId, {
    userId: IamEntityIds.UserId.annotations({
      description: "ID of the user who is a member",
    }),

    role: BS.toOptionalWithDefault(MemberRole)(MemberRoleEnum.member).annotations({
      description: "The member's role within the organization",
    }),
    organizationId: SharedEntityIds.OrganizationId,
  }),
  {
    title: "Member Model",
    description:
      `Member model representing user membership in organizations.\n` + `Maps to the \`member\` table in the database.`,
    schemaId: MemberModelSchemaId,
  }
) {}
