import { SharedEntityIds } from "@beep/shared-domain";
import * as pg from "drizzle-orm/pg-core";
import { OrgTable } from "../org-table";
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
  (t) => [
    // Organization ID index for RLS filtering
    pg.index("folder_organization_id_idx").on(t.organizationId),
    pg.index("folder_user_idx").on(t.userId),
  ]
);
