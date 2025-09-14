import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import type * as S from "effect/Schema";
import { MemberRole } from "./schemas";

export const MemberModelSchemaId = Symbol.for("@beep/iam-domain/MemberModel");

/**
 * @description Member model representing user membership in organizations.
 * Maps to the `member` table in the database.
 */
export class Model extends M.Class<Model>(`MemberModel`)(
  {
    /** Primary key identifier for the membership */
    id: M.Generated(IamEntityIds.MemberId),
    _rowId: M.Generated(IamEntityIds.MemberId.privateSchema),
    userId: IamEntityIds.UserId.annotations({
      description: "ID of the user who is a member",
    }),

    role: MemberRole.annotations({
      description: "The member's role within the organization",
    }),
    ...Common.defaultColumns,
  },
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
