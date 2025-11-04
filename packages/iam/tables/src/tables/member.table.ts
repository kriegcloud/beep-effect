import { Member } from "@beep/iam-domain/entities";
import type { SharedEntityIds } from "@beep/shared-domain";
import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const memberRoleEnum = Member.makeMemberRolePgEnum("member_role_enum");
export const memberStatusEnum = Member.makeMemberStatusPgEnum("member_status_enum");
export const member = OrgTable.make(IamEntityIds.MemberId)(
  {
    userId: pg.text("user_id").$type<SharedEntityIds.UserId.Type>().notNull(), // Reference to user.id (relation defined in relations.ts)
    role: memberRoleEnum("role").notNull().default(Member.MemberRoleEnum.member),
    // Enhanced member tracking fields
    status: memberStatusEnum("status").notNull().default("active"), // 'active', 'invited', 'suspended', 'inactive'
    // todo make not null
    invitedBy: pg.text("invited_by"), // User ID who sent the invitation (relation defined in relations.ts)
    // todo make not null
    invitedAt: pg.timestamp("invited_at", { withTimezone: true }), // When invitation was sent
    // todo make not null
    joinedAt: pg.timestamp("joined_at", { withTimezone: true }), // When user accepted/joined
    lastActiveAt: pg.timestamp("last_active_at", { withTimezone: true }), // Last activity timestamp
    // todo make not null (and finish permissions implementation)
    permissions: pg.text("permissions"), // JSON string for member-specific permissions
  },
  (t) => [
    // Foreign key indexes for join performance
    pg
      .index("member_organization_id_idx")
      .on(t.organizationId),
    pg.index("member_user_id_idx").on(t.userId),

    // Composite index for organization-user queries (ensures uniqueness)
    pg
      .uniqueIndex("member_org_user_unique_idx")
      .on(t.organizationId, t.userId),

    // Composite index for organization-role queries (find all admins in org)
    pg
      .index("member_org_role_idx")
      .on(t.organizationId, t.role),

    // Index for role-based queries across organizations
    pg
      .index("member_role_idx")
      .on(t.role),

    // Enhanced tracking indexes
    pg
      .index("member_status_idx")
      .on(t.status),
    pg.index("member_org_status_idx").on(t.organizationId, t.status),
    pg.index("member_invited_by_idx").on(t.invitedBy),
    pg.index("member_last_active_idx").on(t.lastActiveAt),
  ]
);
