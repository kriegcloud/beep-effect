import { IamEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable, userTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const oauthAccessTokenTable = OrgTable.make(IamEntityIds.OAuthAccessTokenId)({
  accessToken: pg.text("access_token").unique(),
  refreshToken: pg.text("refresh_token").unique(),
  accessTokenExpiresAt: pg.timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: pg.timestamp("refresh_token_expires_at"),
  clientId: pg.text("client_id"),
  userId: pg
    .text("user_id")
    .$type<SharedEntityIds.UserId.Type>()
    .references(() => userTable.id, { onDelete: "cascade" }),
  scopes: pg.text("scopes"),
});
