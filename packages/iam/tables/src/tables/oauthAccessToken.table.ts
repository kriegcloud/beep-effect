import type { SharedEntityIds } from "@beep/shared-domain";
import { IamEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

export const oauthAccessToken = OrgTable.make(IamEntityIds.OAuthAccessTokenId)({
  accessToken: pg.text("access_token").unique(),
  refreshToken: pg.text("refresh_token").unique(),
  accessTokenExpiresAt: pg.timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: pg.timestamp("refresh_token_expires_at"),
  clientId: pg.text("client_id"),
  userId: pg
    .text("user_id")
    .$type<SharedEntityIds.UserId.Type>()
    .references(() => user.id, { onDelete: "cascade" }),
  scopes: pg.text("scopes"),
});
