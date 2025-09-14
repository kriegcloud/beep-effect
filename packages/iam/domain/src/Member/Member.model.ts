import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import type * as S from "effect/Schema";
import { MemberRole } from "./schemas";

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

    role: MemberRole.annotations({
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

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
