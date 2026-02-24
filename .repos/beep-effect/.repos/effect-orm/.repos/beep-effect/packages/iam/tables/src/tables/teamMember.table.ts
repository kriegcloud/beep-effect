import type { SharedEntityIds } from "@beep/shared-domain";
import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable, team, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
export const teamMember = OrgTable.make(IamEntityIds.TeamMemberId)(
  {
    teamId: pg
      .text("team_id")
      .notNull()
      .$type<SharedEntityIds.TeamId.Type>()
      .references(() => team.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
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
