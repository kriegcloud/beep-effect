import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { userTable } from "./user.table";
export const ssoProviderTable = OrgTable.make(IamEntityIds.SsoProviderId)({
  issuer: pg.text("issuer").notNull(),
  oidcConfig: pg.text("oidc_config"),
  samlConfig: pg.text("saml_config"),
  userId: pg.text("user_id").references(() => userTable.id, { onDelete: "cascade" }),
  providerId: pg.text("provider_id").notNull().unique(),
  domain: pg.text("domain").notNull(),
});
