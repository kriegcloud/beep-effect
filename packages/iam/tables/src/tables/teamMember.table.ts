import { IamEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable, teamTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { userTable } from "./user.table";
export const teamMemberTable = OrgTable.make(IamEntityIds.TeamMemberId)(
  {
    teamId: pg
      .text("team_id")
      .notNull()
      .$type<SharedEntityIds.TeamId.Type>()
      .references(() => teamTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: pg
      .text("user_id")
      .notNull()
      .$type<IamEntityIds.UserId.Type>()
      .references(() => userTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (t) => [
    // Foreign key indexes for join performance
    pg
      .index("team_member_team_id_idx")
      .on(t.teamId),
    pg.index("team_member_user_id_idx").on(t.userId),

    // Unique constraint to prevent duplicate memberships
    pg
      .uniqueIndex("team_member_team_user_unique_idx")
      .on(t.teamId, t.userId),

    // Composite index for team member queries
    pg
      .index("team_member_team_user_idx")
      .on(t.teamId, t.userId),
  ]
);
