import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const partyIdentifierType = OrgTable.make(PartyEntityIds.PartyIdentifierTypeId)({
  code: pg.text("code").notNull().unique(),
  description: pg.text("description"),
  issuerSystem: pg.text("issuer_system"),
});
