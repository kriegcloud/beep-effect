import { IamEntityIds } from "@beep/shared-domain";
import { Common, team } from "@beep/shared-tables";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { user } from "./user.table";
export const invitation = pg.pgTable(
  "invitation",
  {
    id: Common.idColumn("invitation", IamEntityIds.InvitationId),
    email: pg.text("email").notNull(),
    role: pg.text("role"),
    teamId: pg.text("team_id").references(() => team.id, { onDelete: "cascade", onUpdate: "cascade" }),
    status: pg.text("status").default("pending").notNull(),
    expiresAt: pg.timestamp("expires_at").notNull(),
    inviterId: pg
      .text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    ...Common.defaultColumns,
  },
  (t) => [
    // Foreign key indexes for join performance
    pg
      .index("invitation_organization_id_idx")
      .on(t.organizationId),
    pg.index("invitation_inviter_id_idx").on(t.inviterId),

    // Index for email-based invitation lookups
    pg
      .index("invitation_email_idx")
      .on(t.email),

    // Composite index for organization-email invitations (prevent duplicates for pending status)
    pg
      .uniqueIndex("invitation_org_email_unique_idx")
      .on(t.organizationId, t.email)
      .where(d.sql`${t.status} = 'pending'`),

    // Index for status-based queries
    pg
      .index("invitation_status_idx")
      .on(t.status),

    // Index for cleanup of expired invitations
    pg
      .index("invitation_expires_at_idx")
      .on(t.expiresAt),

    // Index for pending invitations (removed NOW() predicate - filter at query time instead)
    pg
      .index("invitation_pending_idx")
      .on(t.organizationId, t.status, t.expiresAt)
      .where(d.sql`${t.status} = 'pending'`),

    // Index for team-based invitations (if teamId is used)
    pg
      .index("invitation_team_id_idx")
      .on(t.teamId)
      .where(d.sql`${t.teamId} IS NOT NULL`),
  ]
);
