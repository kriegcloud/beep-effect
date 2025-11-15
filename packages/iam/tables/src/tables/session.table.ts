import type { SharedEntityIds } from "@beep/shared-domain";
import { IamEntityIds } from "@beep/shared-domain";
import { organization, Table, team, user } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
export const session = Table.make(IamEntityIds.SessionId)(
  {
    expiresAt: pg.timestamp("expires_at").notNull(),
    token: pg.text("token").notNull().unique(),
    ipAddress: pg.text("ip_address"),
    userAgent: pg.text("user_agent"),
    userId: pg
      .text("user_id")
      .$type<typeof SharedEntityIds.UserId.Type>()
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    impersonatedBy: pg
      .text("impersonated_by")
      .$type<typeof SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "set null", onUpdate: "cascade" }),
    activeOrganizationId: pg
      .text("active_organization_id")
      .notNull()
      .$type<typeof SharedEntityIds.OrganizationId.Type>()
      .references(() => organization.id, {
        onDelete: "set null",
        onUpdate: "cascade",
      }),
    activeTeamId: pg
      .text("active_team_id")
      .$type<typeof SharedEntityIds.TeamId.Type>()
      .references(() => team.id, { onDelete: "set null", onUpdate: "cascade" }),
  },
  (t) => [
    // Temporal constraint - session must expire after it was created
    pg.check("session_expires_after_created_check", d.sql`${t.expiresAt} > ${t.createdAt}`),

    // Critical indexes for authentication performance
    pg
      .index("session_token_idx")
      .on(t.token), // Already unique, but explicit for performance
    pg
      .index("session_user_id_idx")
      .on(t.userId), // Foreign key index

    // Index for session cleanup (expired sessions)
    pg
      .index("session_expires_at_idx")
      .on(t.expiresAt),

    // Composite index for user session management
    pg
      .index("session_user_expires_idx")
      .on(t.userId, t.expiresAt),

    // Indexes for organization/team context switching
    pg
      .index("session_active_org_idx")
      .on(t.activeOrganizationId),
    pg.index("session_active_team_idx").on(t.activeTeamId),

    // Index for impersonation queries
    pg
      .index("session_impersonated_by_idx")
      .on(t.impersonatedBy),

    // Composite index for active sessions by user in organization
    pg
      .index("session_user_org_active_idx")
      .on(t.userId, t.activeOrganizationId, t.expiresAt),
  ]
);
