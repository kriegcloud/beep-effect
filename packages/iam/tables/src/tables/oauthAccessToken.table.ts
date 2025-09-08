import { IamEntityIds } from "@beep/shared-domain";
import { Common } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { user } from "./user.table";

export const oauthAccessToken = pg.pgTable("oauth_access_token", {
  id: Common.idColumn("oauth_access_token", IamEntityIds.OAuthAccessTokenId),
  accessToken: pg.text("access_token").unique(),
  refreshToken: pg.text("refresh_token").unique(),
  accessTokenExpiresAt: pg.timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: pg.timestamp("refresh_token_expires_at"),
  clientId: pg.text("client_id"),
  userId: pg.text("user_id").references(() => user.id, { onDelete: "cascade" }),
  scopes: pg.text("scopes"),
  ...Common.defaultColumns,
});
