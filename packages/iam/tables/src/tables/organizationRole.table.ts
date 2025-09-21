import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
export const organizationRole = OrgTable.make(IamEntityIds.OrganizationRoleId)({
  role: pg.text("role").notNull(),
  permission: pg.text("permission").notNull(),
});
