import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import { AuditLogId, FileId, OrganizationId, TeamId, UserId } from "../shared";

export const SharedTableNameKit = BS.stringLiteralKit(
  FileId.tableName,
  TeamId.tableName,
  OrganizationId.tableName,
  UserId.tableName,
  AuditLogId.tableName
);

export class SharedTableName extends SharedTableNameKit.Schema.annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SharedTableName"),
  description: "The set of table_names for entityIds within the shared-kernel",
  identifier: "SharedTableName",
  title: "Shared Table Name",
}) {
  static readonly Tagged = SharedTableNameKit.toTagged("tableName");
  static readonly Enum = SharedTableNameKit.Enum;
  static readonly Options = SharedTableNameKit.Options;
  static readonly is = SharedTableNameKit.is;
}

export declare namespace SharedTableName {
  export type Type = S.Schema.Type<typeof SharedTableName>;
  export type Encoded = S.Schema.Encoded<typeof SharedTableName>;
}
