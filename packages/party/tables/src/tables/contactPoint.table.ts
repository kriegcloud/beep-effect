import { ContactPointType } from "@beep/party-domain/value-objects";
import { BS } from "@beep/schema";
import { PartyEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const contactPointTypePgEnum = BS.toPgEnum(ContactPointType)("contact_point_type_enum");

export const contactPoint = OrgTable.make(PartyEntityIds.ContactPointId)({
  type: contactPointTypePgEnum("type").notNull(),
  value: pg.text("value").notNull(),
  // e.g. 'WORK', 'HOME', 'BILLING', 'LEGAL', 'PRIMARY'
  usage: pg.text("usage"),
});
