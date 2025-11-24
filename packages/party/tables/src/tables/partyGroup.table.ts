// import type { SharedEntityIds } from "@beep/shared-domain";

import { GroupType } from "@beep/party-domain/value-objects";
import { BS } from "@beep/schema";
import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { party } from "./party.table";
export const partyGroupTypePgEnum = BS.toPgEnum(GroupType)("party_group_type_enum");

export const partyGroup = OrgTable.make(PartyEntityIds.PartyGroupId)({
  partyId: pg
    .text("party_id")
    .notNull()
    .$type<PartyEntityIds.PartyId.Type>()
    .references(() => party.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  type: partyGroupTypePgEnum("type").notNull(),
  description: pg.text("description"),
});
