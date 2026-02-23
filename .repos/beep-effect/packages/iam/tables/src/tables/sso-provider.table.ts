import type { SharedEntityIds } from "@beep/shared-domain";
import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const ssoProvider = OrgTable.make(IamEntityIds.SsoProviderId, { nullableColumn: true })(
  {
    issuer: pg.text("issuer").notNull(),
    oidcConfig: pg.text("oidc_config"),
    samlConfig: pg.text("saml_config"),
    userId: pg
      .text("user_id")
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    providerId: pg.text("provider_id").notNull().unique(),
    domain: pg.text("domain").notNull(),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg.index("sso_provider_org_id_idx").on(t.organizationId),
  ]
);
