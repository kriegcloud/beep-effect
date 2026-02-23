import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { user } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/table";
import * as pg from "drizzle-orm/pg-core";
import { oauthClient } from "./oauth-client.table";

export const oauthConsent = Table.make(IamEntityIds.OAuthConsentId)(
  {
    clientId: pg
      .text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    userId: pg
      .text("user_id")
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    referenceId: pg.text("reference_id"),
    scopes: pg.text("scopes").array().notNull(),
  },
  (t) => [
    pg.index("oauth_consent_client_id_idx").on(t.clientId),
    pg.index("oauth_consent_user_id_idx").on(t.userId),
    pg.uniqueIndex("oauth_consent_client_user_uidx").on(t.clientId, t.userId),
  ]
);
