import { ScimProviderId } from "@beep/shared-domain/entity-ids/iam";
import { Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const scimProvider = Table.make(ScimProviderId)({
  providerId: pg.text("provider_id").notNull().unique(),
  scimToken: pg.text("scim_token").notNull().unique(),
  organizationId: pg.text("organization_id"),
});
