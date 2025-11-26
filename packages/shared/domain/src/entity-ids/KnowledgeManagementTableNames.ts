import { BS } from "@beep/schema";
import { KnowledgePageId } from "@beep/shared-domain/entity-ids/knowledge-management";
import type * as S from "effect/Schema";

export class KnowledgeManagementTableName extends BS.StringLiteralKit(KnowledgePageId.tableName).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/knowledge-management/KnowledgeManagementTableName"),
  description: "The set of table_names for entities within the knowledge-management bounded context",
  identifier: "KnowledgeManagementTableName",
  title: "Knowledge Management Table Name",
}) {
  static readonly Tagged = KnowledgeManagementTableName.toTagged("tableName");
}

export declare namespace KnowledgeManagementTableName {
  export type Type = S.Schema.Type<typeof KnowledgeManagementTableName>;
  export type Encoded = S.Schema.Encoded<typeof KnowledgeManagementTableName>;
}
