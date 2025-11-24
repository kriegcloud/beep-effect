import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const partyRoleType = OrgTable.make(PartyEntityIds.PartyRoleTypeId)({
  code: pg.text("code").notNull().unique(),
  description: pg.text("description"),
});
