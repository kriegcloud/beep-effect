import { PartyOrganizationType } from "@beep/party-domain/value-objects";
import { BS } from "@beep/schema";
import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const partyOrganizationTypePgEnum = BS.toPgEnum(PartyOrganizationType)("party_organization_type_enum");

export const partyOrganization = OrgTable.make(PartyEntityIds.PartyOrganizationId)({
  partyId: pg.text("party_id").notNull().$type<PartyEntityIds.PartyId.Type>(),
  legalName: pg.text("legal_name").notNull(),
  organizationType: partyOrganizationTypePgEnum("organization_type").notNull(),
  registrationNumber: pg.text("registration_number"),
  taxIdMasked: pg.text("tax_id_masked"),
  industry: pg.text("industry"),
});
