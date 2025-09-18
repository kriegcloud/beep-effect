import { IamEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { organizationTable, Table, userTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const ssoProviderTable = Table.make(IamEntityIds.SsoProviderId)({
  issuer: pg.text("issuer").notNull(),
  oidcConfig: pg.text("oidc_config"),
  samlConfig: pg.text("saml_config"),
  userId: pg
    .text("user_id")
    .$type<SharedEntityIds.UserId.Type>()
    .references(() => userTable.id, { onDelete: "cascade" }),
  providerId: pg.text("provider_id").notNull().unique(),
  organizationId: pg
    .text("organization_id")
    .$type<SharedEntityIds.OrganizationId.Type>()
    .references(() => organizationTable.id, { onDelete: "cascade" }),
  domain: pg.text("domain").notNull(),
});
