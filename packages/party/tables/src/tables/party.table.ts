// import type { SharedEntityIds } from "@beep/shared-domain";

import { PartyType } from "@beep/party-domain/value-objects";
import { BS } from "@beep/schema";
import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const partyTypePgEnum = BS.toPgEnum(PartyType)("party_type_enum");

export const party = OrgTable.make(PartyEntityIds.PartyId)({
  type: partyTypePgEnum("type").notNull(),
  displayName: pg.text("display_name").notNull(),
});
