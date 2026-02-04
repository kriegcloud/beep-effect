import type { SharedEntityIds } from "@beep/shared-domain";
import { CommsEntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import { user } from "@beep/shared-tables/schema";
import * as pg from "drizzle-orm/pg-core";

export const userSettings = Table.make(CommsEntityIds.UserSettingsId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),

    defaultSignature: pg.text("default_signature"),

    timezone: pg.text("timezone"),

    emailsPerPage: pg.integer("emails_per_page"),

    autoMarkRead: pg.boolean("auto_mark_read").notNull().default(true),

    showNotifications: pg.boolean("show_notifications").notNull().default(true),

    compactMode: pg.boolean("compact_mode").notNull().default(false),

    aiSummariesEnabled: pg.boolean("ai_summaries_enabled").notNull().default(true),
  },
  (t) => [
    pg.uniqueIndex("user_settings_user_id_idx").on(t.userId),
  ]
);
