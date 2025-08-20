import { Common, IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * @description Member model representing user membership in organizations.
 * Maps to the `member` table in the database.
 */
export class Model extends M.Class<Model>(`Member.Model`)(
  {
    /** Primary key identifier for the membership */
    id: M.Generated(IamEntityIds.MemberId),

    userId: IamEntityIds.UserId.annotations({
      description: "ID of the user who is a member",
    }),

    role: S.Literal("admin", "member", "viewer", "owner").annotations({
      description: "The member's role within the organization",
    }),
    ...Common.defaultColumns,
  },
  {
    title: "Member Model",
    description:
      `Member model representing user membership in organizations.\n` +
      `Maps to the \`member\` table in the database.`,
    documentation: ``,
  },
) {}
