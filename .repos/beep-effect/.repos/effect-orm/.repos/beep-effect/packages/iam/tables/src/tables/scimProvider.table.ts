import type { SharedEntityIds } from "@beep/shared-domain";
import { ScimProviderId } from "@beep/shared-domain/entity-ids/iam";
import { organization, Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const scimProvider = Table.make(ScimProviderId)({
  providerId: pg.text("provider_id").notNull().unique(),
  scimToken: pg.text("scim_token").notNull().unique(),
  organizationId: pg
    .text("organization_id")
    .references(() => organization.id, { onDelete: "cascade", onUpdate: "cascade" })
    .$type<SharedEntityIds.OrganizationId.Type>(),
});
