import type { UserHotkey } from "@beep/customization-domain/entities";
import type { SharedEntityIds } from "@beep/shared-domain";
import { CustomizationEntityIds } from "@beep/shared-domain";
import { Table, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
export const userHotkey = Table.make(CustomizationEntityIds.UserHotkeyId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    shortcuts: pg.jsonb("shortcuts").notNull().$type<typeof UserHotkey.Model.select.fields.shortcuts.Encoded>(),
  },
  (t) => [pg.index("user_hotkeys_shortcuts_idx").on(t.shortcuts)]
);
