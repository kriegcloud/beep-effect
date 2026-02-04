import type { SharedEntityIds } from "@beep/shared-domain";
import { CommsEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import { user } from "@beep/shared-tables/schema";
import * as pg from "drizzle-orm/pg-core";

export const userHotkeys = Table.make(CommsEntityIds.UserHotkeysId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),

    hotkeyMap: pg.text("hotkey_map").notNull(),
  },
  (t) => [
    pg.uniqueIndex("user_hotkeys_user_id_idx").on(t.userId),
  ]
);
