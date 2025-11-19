import { BS } from "@beep/schema";
import { CommsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Todo model representing external OAuth provider accounts linked to users.
 * Maps to the `account` table in the database.
 */

export class Model extends M.Class<Model>(`EmailTemplate`)(
  makeFields(CommsEntityIds.EmailTemplateId, {
    name: BS.NameAttribute,
    userId: SharedEntityIds.UserId,
    teamId: BS.FieldOptionOmittable(SharedEntityIds.TeamId),
    subject: BS.FieldOptionOmittable(S.String),
    body: BS.FieldOptionOmittable(S.NonEmptyString),
    to: BS.JsonFromStringOption(S.Array(BS.Email)),
    cc: BS.JsonFromStringOption(S.Array(BS.Email)),
    bcc: BS.JsonFromStringOption(S.Array(BS.Email)),
  })
) {
  static readonly utils = modelKit(Model);
}
