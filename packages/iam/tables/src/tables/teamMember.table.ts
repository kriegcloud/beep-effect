import { Common, team } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { user } from "./user.table";

export const teamMember = pg.pgTable(
  "team_member",
  {
    id: pg.text("id").primaryKey(),
    teamId: pg
      .text("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade", onUpdate: "cascade" }),
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    ...Common.defaultColumns,
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
