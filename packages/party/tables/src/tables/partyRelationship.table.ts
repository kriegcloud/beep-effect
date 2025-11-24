import type { BS } from "@beep/schema";
import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { party } from "./party.table";
import { partyRelationshipType } from "./partyRelationshipType.table";
import { partyRoleType } from "./partyRoleType.table";
export const partyRelationship = OrgTable.make(PartyEntityIds.PartyRelationshipId)({
  fromPartyId: pg
    .text("from_party_id")
    .references(() => party.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull()
    .$type<PartyEntityIds.PartyId.Type>(),

  toPartyId: pg
    .text("to_party_id")
    .references(() => party.id, { onDelete: "cascade" })
    .notNull()
    .$type<PartyEntityIds.PartyId.Type>(),

  relationshipTypeId: pg
    .text("relationship_type_id")
    .references(() => partyRelationshipType.id, {
      onDelete: "restrict",
    })
    .$type<PartyEntityIds.PartyRelationshipTypeId.Type>()
    .notNull(),

  // Optional: if you want to tie specific role types to each side:
  fromRoleTypeId: pg
    .uuid("from_role_type_id")
    .references(() => partyRoleType.id, { onDelete: "set null" })
    .$type<PartyEntityIds.PartyRoleTypeId.Type>(),
  toRoleTypeId: pg
    .text("to_role_type_id")
    .references(() => partyRoleType.id, { onDelete: "set null" })
    .$type<PartyEntityIds.PartyRoleTypeId.Type>(),

  validFrom: pg.timestamp("valid_from", { withTimezone: true }),
  validTo: pg.timestamp("valid_to", { withTimezone: true }),

  // For sales priority, relationship health, etc.
  priority: pg.text("priority"),
  status: pg.text("status"),
  metadata: pg.jsonb("metadata").$type<BS.Json.Type | null>(),
});
