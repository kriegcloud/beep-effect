import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const scimProvider = OrgTable.make(IamEntityIds.ScimProviderId, { nullableColumn: true })(
  {
    providerId: pg.text("provider_id").notNull().unique(),
    scimToken: pg.text("scim_token").notNull().unique(),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg.index("scim_provider_org_id_idx").on(t.organizationId),
  ]
);
