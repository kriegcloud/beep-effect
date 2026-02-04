import type { SharedEntityIds } from "@beep/shared-domain";
import { CommsEntityIds } from "@beep/shared-domain";
import { datetime, Table } from "@beep/shared-tables";
import { user } from "@beep/shared-tables/schema";
import * as pg from "drizzle-orm/pg-core";

export const providerEnum = pg.pgEnum("comms_email_provider_enum", ["google", "microsoft"]);

export const connection = Table.make(CommsEntityIds.ConnectionId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),

    email: pg.text("email").notNull(),

    name: pg.text("name"),

    provider: providerEnum("provider").notNull(),

    accessToken: pg.text("access_token"),

    refreshToken: pg.text("refresh_token"),

    expiresAt: datetime("expires_at"),

    scope: pg.text("scope"),

    syncState: pg.text("sync_state"),
  },
  (t) => [
    pg.index("connection_user_id_idx").on(t.userId),
    pg.uniqueIndex("connection_user_email_provider_idx").on(t.userId, t.email, t.provider),
  ]
);
