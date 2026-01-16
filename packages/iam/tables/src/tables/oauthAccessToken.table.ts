import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { datetime } from "@beep/shared-tables/columns";
import { session, user } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/table";
import * as pg from "drizzle-orm/pg-core";
import { oauthClient } from "./oauthClient.table";
import { oauthRefreshToken } from "./oauthRefreshToken.table";

export const oauthAccessToken = Table.make(IamEntityIds.OAuthAccessTokenId)(
  {
    token: pg.text("token").unique(),
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
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    referenceId: pg.text("reference_id"),
    refreshId: pg
      .text("refresh_id")
      .$type<IamEntityIds.OAuthRefreshTokenId.Type>()
      .references(() => oauthRefreshToken.id, { onDelete: "cascade" }),
    expiresAt: datetime("expires_at"),
    scopes: pg.text("scopes").array().notNull(),
  },
  (t) => [
    pg.index("oauth_access_token_client_id_idx").on(t.clientId),
    pg.index("oauth_access_token_user_id_idx").on(t.userId),
    pg.index("oauth_access_token_session_id_idx").on(t.sessionId),
  ]
);
