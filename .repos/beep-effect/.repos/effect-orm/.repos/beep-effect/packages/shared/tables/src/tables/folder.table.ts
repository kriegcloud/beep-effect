import { SharedEntityIds } from "@beep/shared-domain";
import * as pg from "drizzle-orm/pg-core";
import { OrgTable } from "../OrgTable";
import { user } from "./user.table";

export const folder = OrgTable.make(SharedEntityIds.FolderId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    name: pg.text("name").notNull(),
  },
  (t) => [pg.index("folder_user_idx").on(t.userId)]
);
