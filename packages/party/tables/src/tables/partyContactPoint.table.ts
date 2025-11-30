import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { contactPoint } from "./contactPoint.table";
import { party } from "./party.table";

export const partyContactPoint = OrgTable.make(PartyEntityIds.PartyContactPointId)({
  partyId: pg
    .text("party_id")
    .notNull()
    .$type<PartyEntityIds.PartyId.Type>()
    .references(() => party.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<PartyEntityIds.PartyId.Type>(),
  contactPointId: pg
    .text("contact_point_id")
    .notNull()
    .references(() => contactPoint.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .$type<typeof PartyEntityIds.ContactPointId.Type>(),
  isPrimary: pg.boolean("is_primary").notNull().default(false),
});
