import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const person = OrgTable.make(PartyEntityIds.PersonId)({
  partyId: pg.text("party_id").notNull().$type<PartyEntityIds.PartyId.Type>(),
  givenName: pg.text("given_name").notNull(),
  familyName: pg.text("family_name").notNull(),
  preferredName: pg.text("preferred_name").notNull(),
  dateOfBirth: pg.date("date_of_birth").notNull(),
  primaryJobTitle: pg.text("primary_job_title"),
  displayName: pg.text("display_name").notNull(),
});
