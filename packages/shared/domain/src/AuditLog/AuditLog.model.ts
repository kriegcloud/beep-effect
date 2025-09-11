import { BS } from "@beep/schema";
import * as Common from "@beep/shared-domain/common";
import { AnyEntityId, AnyTableName, IamEntityIds, SharedEntityIds } from "@beep/shared-domain/EntityIds";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`AuditLogModel`)({
  /** Primary key identifier for the file */
  id: M.Generated(SharedEntityIds.AuditLogId),
  entityKind: AnyTableName,
  entityId: AnyEntityId,
  action: S.String,
  userSessionId: M.FieldOption(IamEntityIds.SessionId),
  userId: IamEntityIds.UserId,
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
  ...Common.defaultColumns,
}) {}

export namespace Model {
  export type Type = S.Schema.Type<typeof Model>;
  export type Encoded = S.Schema.Encoded<typeof Model>;
}
