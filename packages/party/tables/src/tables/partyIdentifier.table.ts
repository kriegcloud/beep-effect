import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { party } from "./party.table.ts";
import { partyIdentifierType } from "./partyIdentifierType.table.ts";

export const partyIdentifier = OrgTable.make(PartyEntityIds.PartyIdentifierId)({
  partyId: pg
    .text("party_id")
    .notNull()
    .$type<PartyEntityIds.PartyId.Type>()
    .references(() => party.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<PartyEntityIds.PartyId.Type>(),
  identifierTypeId: pg
    .text("identifier_type_id")
    .references(() => partyIdentifierType.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull()
    .$type<PartyEntityIds.PartyIdentifierTypeId.Type>(),
  value: pg.text("value").notNull(),
});
