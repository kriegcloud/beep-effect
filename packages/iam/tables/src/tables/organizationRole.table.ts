import { IamEntityIds } from "@beep/shared-domain";
import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const organizationRole = pg.pgTable("organization_role", {
  id: Common.idColumn("organization_role", IamEntityIds.OrganizationRoleId),
  role: pg.text("role").notNull(),
  permission: pg.text("permission").notNull(),
  ...Common.defaultColumns,
});
