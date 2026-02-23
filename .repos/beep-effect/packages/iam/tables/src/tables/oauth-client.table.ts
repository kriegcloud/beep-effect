import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { user } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/table";
import * as pg from "drizzle-orm/pg-core";

export const oauthClient = Table.make(IamEntityIds.OAuthClientId)(
  {
    clientId: pg.text("client_id").notNull().unique(),
    clientSecret: pg.text("client_secret"),
    disabled: pg.boolean("disabled").notNull().default(false),
    skipConsent: pg.boolean("skip_consent"),
    enableEndSession: pg.boolean("enable_end_session"),
    scopes: pg.text("scopes").array(),
    userId: pg
      .text("user_id")
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    name: pg.text("name"),
    uri: pg.text("uri"),
    icon: pg.text("icon"),
    contacts: pg.text("contacts").array(),
    tos: pg.text("tos"),
    policy: pg.text("policy"),
    softwareId: pg.text("software_id"),
    softwareVersion: pg.text("software_version"),
    softwareStatement: pg.text("software_statement"),
    redirectUris: pg.text("redirect_uris").array().notNull(),
    postLogoutRedirectUris: pg.text("post_logout_redirect_uris").array(),
    tokenEndpointAuthMethod: pg.text("token_endpoint_auth_method"),
    grantTypes: pg.text("grant_types").array(),
    responseTypes: pg.text("response_types").array(),
    public: pg.boolean("public"),
    type: pg.text("type"),
    referenceId: pg.text("reference_id"),
    metadata: pg.jsonb("metadata"),
  },
  (t) => [
    pg.uniqueIndex("oauth_client_client_id_uidx").on(t.clientId),
    pg.index("oauth_client_user_id_idx").on(t.userId),
  ]
);
