import { SharedEntityIds } from "@beep/shared-domain";
import * as pg from "drizzle-orm/pg-core";
import { defaultColumns, idColumn } from "./common";
export const team = pg.pgTable(
  "team",
  {
    id: idColumn("organization", SharedEntityIds.OrganizationId),
    name: pg.text("name").notNull(),
    description: pg.text("description"),
    slug: pg.text("slug").unique(),
    metadata: pg.text("metadata"),
    logo: pg.text("logo"),
    ...defaultColumns,
  },
  (t) => [
    // Foreign key index for join performance
    pg
      .index("team_organization_id_idx")
      .on(t.organizationId),

    // Composite index for organization-team name queries (ensures unique names per org)
    pg
      .uniqueIndex("team_org_name_unique_idx")
      .on(t.organizationId, t.name),

    // Index for team name searches within organizations
    pg
      .index("team_name_idx")
      .on(t.name),
  ]
);
