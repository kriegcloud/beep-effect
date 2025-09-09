import { SharedEntityIds } from "@beep/shared-domain";
import { Organization } from "@beep/shared-domain/entities";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import { idColumn } from "./id";

export const organizationTypePgEnum = pg.pgEnum("organization_type_enum", Organization.OrganizationType.Options);
export const subscriptionTierPgEnum = pg.pgEnum("subscription_tier_enum", Organization.SubscriptionTier.Options);
export const subscriptionStatusPgEnum = pg.pgEnum("subscription_status_enum", Organization.SubscriptionStatus.Options);

export const organization = pg.pgTable(
  "organization",
  {
    id: idColumn("organization", SharedEntityIds.OrganizationId),
    name: pg.text("name").notNull(),
    slug: pg.text("slug").unique(),
    logo: pg.text("logo"),
    metadata: pg.text("metadata"),

    // Multi-tenant enhancement fields
    type: organizationTypePgEnum().default(Organization.OrganizationTypeEnum.individual), // 'individual', 'team', 'enterprise'
    ownerUserId: pg.text("owner_user_id"), // Reference to user who owns this org (relation defined in relations.ts)
    isPersonal: pg.boolean("is_personal").notNull().default(false), // True for auto-created personal orgs
    maxMembers: pg.integer("max_members"), // Maximum members allowed
    features: pg.jsonb("features"), // JSON string for feature flags
    settings: pg.jsonb("settings"), // JSON string for org settings
    subscriptionTier: subscriptionTierPgEnum().notNull().default(Organization.SubscriptionTierEnum.free), // 'free', 'plus', 'pro', etc.
    subscriptionStatus: subscriptionStatusPgEnum().notNull().default(Organization.SubscriptionStatusEnum.active), // 'active', 'canceled', etc.
    createdAt: pg
      .timestamp("createdAt", { withTimezone: true })
      .notNull()
      .$defaultFn(F.constant(DateTime.toDateUtc(DateTime.unsafeNow()))),
    updatedAt: pg
      .timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .$onUpdateFn(F.constant(DateTime.toDateUtc(DateTime.unsafeNow()))),
    deletedAt: pg.timestamp("deletedAt", { withTimezone: true }),
    createdBy: pg.text("createdBy"),
    updatedBy: pg.text("updatedBy"),
    deletedBy: pg.text("deletedBy"),
    version: pg
      .integer("version")
      .notNull()
      .default(1)
      .$onUpdateFn(() => d.sql`version + 1`),
    source: pg.text("source"), // 'api', 'import', 'migration', etc.
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
