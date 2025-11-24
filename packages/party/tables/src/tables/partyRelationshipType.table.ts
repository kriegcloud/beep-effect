import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const partyRelationshipType = OrgTable.make(PartyEntityIds.PartyRelationshipTypeId)({
  code: pg.text("code").notNull().unique(), // e.g. 'PRIMARY_ADVISOR_OF', 'MEMBER_OF_HOUSEHOLD', 'COUNTERPARTY_OF'
  description: pg.text("description"),
  // optional: symmetric vs directional, etc.
});
