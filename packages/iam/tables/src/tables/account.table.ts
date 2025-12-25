import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { datetime } from "@beep/shared-tables/columns";
import { user } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/Table";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

export const account = Table.make(IamEntityIds.AccountId)(
  {
    accountId: pg.text("account_id").notNull(),
    providerId: pg.text("provider_id").notNull(),
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    accessToken: pg.text("access_token"),
    refreshToken: pg.text("refresh_token"),
    idToken: pg.text("id_token"),
    accessTokenExpiresAt: datetime("access_token_expires_at"),
    refreshTokenExpiresAt: datetime("refresh_token_expires_at"),
    scope: pg.text("scope"),
    password: pg.text("password"),
  },
  (t) => [
    // Foreign key index for user lookups
    pg
      .index("account_user_id_idx")
      .on(t.userId),

    // Unique constraint to prevent duplicate accounts per provider
    pg
      .uniqueIndex("account_provider_account_unique_idx")
      .on(t.providerId, t.accountId),

    // Index for provider-based queries
    pg
      .index("account_provider_id_idx")
      .on(t.providerId),

    // Composite index for user-provider queries (find user's accounts per provider)
    pg
      .index("account_user_provider_idx")
      .on(t.userId, t.providerId),

    // Index for token expiration cleanup
    pg
      .index("account_access_token_expires_idx")
      .on(t.accessTokenExpiresAt)
      .where(d.sql`${t.accessTokenExpiresAt} IS NOT NULL`),

    pg
      .index("account_refresh_token_expires_idx")
      .on(t.refreshTokenExpiresAt)
      .where(d.sql`${t.refreshTokenExpiresAt} IS NOT NULL`),
  ]
);
