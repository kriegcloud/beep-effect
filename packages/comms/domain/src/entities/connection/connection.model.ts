import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/connection/connection.model");

export class Model extends M.Class<Model>($I`ConnectionModel`)(
  makeFields(CommsEntityIds.ConnectionId, {
    userId: SharedEntityIds.UserId.annotations({
      description: "ID of the user who owns this connection",
    }),

    email: BS.EmailBase.annotations({
      description: "Email address associated with this connection",
    }),

    name: S.optional(S.String).annotations({
      description: "Display name for the connection",
    }),

    provider: S.Literal("google", "microsoft").annotations({
      description: "Email provider type",
    }),

    accessToken: BS.FieldSensitiveOptionOmittable(
      S.String.annotations({
        description: "OAuth access token for the provider",
      })
    ),

    refreshToken: BS.FieldSensitiveOptionOmittable(
      S.String.annotations({
        description: "OAuth refresh token for the provider",
      })
    ),

    expiresAt: BS.FieldOptionOmittable(
      BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When the access token expires",
      })
    ),

    scope: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "OAuth scopes granted to this connection",
      })
    ),

    syncState: S.optional(S.String).annotations({
      description: "JSON string containing sync cursor and state information",
    }),
  }),
  $I.annotations("ConnectionModel", {
    title: "Connection Model",
    description: "Email provider OAuth connection for Gmail, Outlook, etc.",
  })
) {
  static readonly utils = modelKit(Model);
}
