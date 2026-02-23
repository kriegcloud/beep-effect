import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/shared/table-names");

export class TableName extends BS.StringLiteralKit(
  Ids.FileId.tableName,
  Ids.TeamId.tableName,
  Ids.OrganizationId.tableName,
  Ids.UserId.tableName,
  Ids.SessionId.tableName,
  Ids.AuditLogId.tableName,
  Ids.FolderId.tableName,
  Ids.UploadSessionId.tableName,
  Ids.AgentId.tableName
).annotations(
  $I.annotations("SharedTableName", {
    description: "A sql table name for an entity within the shared domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
