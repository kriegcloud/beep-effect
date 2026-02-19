import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { AnyEntityId } from "@beep/shared-domain/entity-ids/any-entity-id";
import * as SharedEntityIds from "@beep/shared-domain/entity-ids/shared";
import { AnyTableName } from "@beep/shared-domain/entity-ids/table-names";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`AuditLogModel`)(
  makeFields(SharedEntityIds.AuditLogId, {
    /** Surrogate 32 bit integer Primary key identifier for the file */
    entityKind: AnyTableName,
    entityId: AnyEntityId,
    action: S.String,
    userSessionId: M.FieldOption(SharedEntityIds.SessionId),
    userId: SharedEntityIds.UserId,
    userEmail: M.Sensitive(
      BS.Email.annotations({
        description: "The user's email address",
      })
    ),
    userIp: M.FieldOption(BS.IP),
    oldValues: M.FieldOption(BS.Json),
    oldValuesJson: M.FieldOption(BS.Json),
    newValues: M.FieldOption(BS.Json),
    newValuesJson: M.FieldOption(BS.Json),
    metadataJson: M.FieldOption(BS.Json),
    metadata: M.FieldOption(BS.Json),
  })
) {
  static readonly utils = modelKit(Model);
}
