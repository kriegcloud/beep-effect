import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { datetime } from "@beep/shared-tables/columns";
import { session, user } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/table";
import * as pg from "drizzle-orm/pg-core";
import { oauthClient } from "./oauth-client.table";

export const oauthRefreshToken = Table.make(IamEntityIds.OAuthRefreshTokenId)(
  {
    token: pg.text("token").notNull(),
    clientId: pg
      .text("client_id")
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    sessionId: pg
      .text("session_id")
      .$type<SharedEntityIds.SessionId.Type>()
      .references(() => session.id, { onDelete: "set null" }),
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    referenceId: pg.text("reference_id"),
    expiresAt: datetime("expires_at"),
    revoked: datetime("revoked"),
    scopes: pg.text("scopes").array().notNull(),
  },
  (t) => [
    pg.index("oauth_refresh_token_client_id_idx").on(t.clientId),
    pg.index("oauth_refresh_token_user_id_idx").on(t.userId),
    pg.index("oauth_refresh_token_session_id_idx").on(t.sessionId),
  ]
);
