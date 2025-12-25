import type { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import { Organization } from "@beep/shared-domain/entities";
import { user } from "@beep/shared-tables/tables/user.table";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { Table } from "../Table";

export const organizationTypePgEnum = Organization.makeOrganizationTypePgEnum("organization_type_enum");
export const subscriptionTierPgEnum = Organization.makeSubscriptionTierPgEnum("subscription_tier_enum");
export const subscriptionStatusPgEnum = Organization.makeSubscriptionStatusPgEnum("subscription_status_enum");

export const organization = Table.make(SharedEntityIds.OrganizationId)(
  {
    name: pg.text("name").notNull(),
    slug: pg.text("slug").notNull().unique(),
    logo: pg.text("logo"),
    // todo make this typed when actually used
    metadata: pg.text("metadata"),
    // Multi-tenant enhancement fields
    type: organizationTypePgEnum("type").notNull().default(Organization.OrganizationTypeEnum.individual), // 'individual', 'team', 'enterprise'
    ownerUserId: pg
      .text("owner_user_id")
      .$type<SharedEntityIds.UserId.Type>()
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }), // Reference to user who owns this org (relation defined in relations.ts)
    isPersonal: pg.boolean("is_personal").notNull().default(false), // True for auto-created personal orgs
    maxMembers: pg.integer("max_members"), // Maximum members allowed
    // todo make this typed when actually used
    features: pg.jsonb("features").$type<BS.Json.Encoded>(), // JSON string for feature flags
    // todo make this typed when actually used
    settings: pg.jsonb("settings").$type<BS.Json.Encoded>(), // JSON string for org settings
    subscriptionTier: subscriptionTierPgEnum("subscription_tier")
      .notNull()
      .default(Organization.SubscriptionTierEnum.free), // 'free', 'plus', 'pro', etc.
    subscriptionStatus: subscriptionStatusPgEnum("subscription_status")
      .notNull()
      .default(Organization.SubscriptionStatusEnum.active), // 'active', 'canceled', etc.
  },
  (t) => [
    // Index for name-based searches (case-insensitive)
    pg
      .index("organization_name_idx")
      .on(t.name),

    // Index for slug lookups (already unique, but explicit index for performance)
    pg
      .index("organization_slug_idx")
      .on(t.slug),

    // Multi-tenant indexes
    pg
      .index("organization_type_idx")
      .on(t.type),
    pg.index("organization_owner_idx").on(t.ownerUserId),
    pg.index("organization_personal_idx").on(t.isPersonal).where(d.sql`${t.isPersonal} = true`),
    pg.index("organization_subscription_idx").on(t.subscriptionTier, t.subscriptionStatus),
  ]
);
