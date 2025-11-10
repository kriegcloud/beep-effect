import type { SharedEntityIds } from "@beep/shared-domain";
import { TaskEntityIds } from "@beep/shared-domain";
import { OrgTable, team, user } from "@beep/shared-tables";

import * as pg from "drizzle-orm/pg-core";

export const todo = OrgTable.make(TaskEntityIds.TodoId)(
  {
    title: pg.text("title").notNull(),
    description: pg.text("description"),
    completed: pg.boolean("completed").notNull().default(false),
    author: pg
      .text("author")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    team: pg
      .text("team")
      .$type<SharedEntityIds.TeamId.Type>()
      .references(() => team.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (t) => [
    // Index for email-based invitation lookups
    pg
      .index("todo_title_idx")
      .on(t.title),
  ]
);
