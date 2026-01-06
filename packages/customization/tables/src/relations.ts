import * as d from "drizzle-orm";
import { user, userHotkey } from "./tables";

export const userHotkeyRelations = d.relations(userHotkey, ({ one }) => ({
  user: one(user, {
    fields: [userHotkey.userId],
    references: [user.id],
  }),
}));

export const userRelations = d.relations(user, ({ many }) => ({
  hotkeys: many(userHotkey, {
    relationName: "userHotkeys",
  }),
}));
