import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { party } from "./party.table";
import { partyRoleType } from "./partyRoleType.table";

export const partyRole = OrgTable.make(PartyEntityIds.PartyRoleId)({
  partyId: pg
    .text("party_id")
    .references(() => party.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull()
    .$type<PartyEntityIds.PartyId.Type>(),
  roleTypeId: pg
    .text("role_type_id")
    .references(() => partyRoleType.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    })
    .notNull()
    .$type<PartyEntityIds.PartyRoleTypeId.Type>(),
  contextType: pg.text("context_type").notNull(), // e.g. 'ACCOUNT', 'KNOWLEDGE_BASE', 'TASK'
  contextId: pg.uuid("context_id").notNull(),

  validFrom: pg.timestamp("valid_from", { withTimezone: true }),
  validTo: pg.timestamp("valid_to", { withTimezone: true }),
});
