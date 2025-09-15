import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { AnyEntityId, AnyTableName, IamEntityIds, SharedEntityIds } from "@beep/shared-domain/EntityIds";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`AuditLogModel`)(
  makeFields(SharedEntityIds.AuditLogId, {
    /** Surrogate 32 bit integer Primary key identifier for the file */
    entityKind: AnyTableName,
    entityId: AnyEntityId,
    action: S.String,
    userSessionId: BS.FieldOptionOmittable(IamEntityIds.SessionId),
    userId: IamEntityIds.UserId,
    userEmail: M.Sensitive(
      BS.Email.annotations({
        description: "The user's email address",
      })
    ),
    userIp: BS.FieldOptionOmittable(BS.IP),
    oldValues: BS.FieldOptionOmittable(BS.Json),
    oldValuesJson: BS.FieldOptionOmittable(BS.Json),
    newValues: BS.FieldOptionOmittable(BS.Json),
    newValuesJson: BS.FieldOptionOmittable(BS.Json),
    metadataJson: BS.FieldOptionOmittable(BS.Json),
    metadata: BS.FieldOptionOmittable(BS.Json),
  })
) {}
