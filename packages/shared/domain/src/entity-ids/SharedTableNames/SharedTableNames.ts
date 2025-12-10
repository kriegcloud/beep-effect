import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import { AuditLogId, FileId, FolderId, OrganizationId, SessionId, TeamId, UserId } from "../shared";

export class SharedTableName extends BS.StringLiteralKit(
  FileId.tableName,
  TeamId.tableName,
  OrganizationId.tableName,
  UserId.tableName,
  SessionId.tableName,
  AuditLogId.tableName,
  FolderId.tableName
).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SharedTableName"),
  description: "The set of table_names for entityIds within the shared-kernel",
  identifier: "SharedTableName",
  title: "Shared Table Name",
}) {
  static readonly Tagged = SharedTableName.toTagged("tableName");
}

export declare namespace SharedTableName {
  export type Type = S.Schema.Type<typeof SharedTableName>;
  export type Encoded = S.Schema.Encoded<typeof SharedTableName>;
}
