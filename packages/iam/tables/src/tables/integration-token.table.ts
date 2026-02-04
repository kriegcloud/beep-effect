import type { SharedEntityIds } from "@beep/shared-domain";
import { IntegrationsEntityIds } from "@beep/shared-domain";
import { datetime, OrgTable, user } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

/**
 * Integration tokens table for storing OAuth tokens.
 * Used by IntegrationTokenStore service for Google, Microsoft, Slack, etc.
 */
export const integrationToken = OrgTable.make(IntegrationsEntityIds.IntegrationTokenId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),

    provider: pg.text("provider").notNull(),

    accessToken: pg.text("access_token").notNull(),

    refreshToken: pg.text("refresh_token"),

    scopes: pg.text("scopes"),

    expiresAt: datetime("expires_at"),

    tokenType: pg.text("token_type").notNull().default("Bearer"),

    isActive: pg.boolean("is_active").notNull().default(true),

    lastRefreshedAt: datetime("last_refreshed_at"),

    revokedAt: datetime("revoked_at"),
  },
  (t) => [
    pg.index("integration_token_organization_id_idx").on(t.organizationId),

    pg.index("integration_token_user_id_idx").on(t.userId),

    pg.uniqueIndex("integration_token_org_user_provider_active_idx")
      .on(t.organizationId, t.userId, t.provider)
      .where(d.sql`${t.isActive} = true`),

    pg.index("integration_token_active_idx")
      .on(t.isActive)
      .where(d.sql`${t.isActive} = true`),

    pg.index("integration_token_expires_at_idx").on(t.expiresAt),

    pg.index("integration_token_provider_idx").on(t.provider),
  ]
);
