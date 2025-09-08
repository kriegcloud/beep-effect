import { IamEntityIds } from "@beep/shared-domain";
import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { user } from "./user.table";

export const ssoProvider = pg.pgTable("sso_provider", {
  id: Common.idColumn("sso_provider", IamEntityIds.SsoProviderId),
  issuer: pg.text("issuer").notNull(),
  oidcConfig: pg.text("oidc_config"),
  samlConfig: pg.text("saml_config"),
  userId: pg.text("user_id").references(() => user.id, { onDelete: "cascade" }),
  providerId: pg.text("provider_id").notNull().unique(),
  domain: pg.text("domain").notNull(),
  ...Common.defaultColumns,
});
