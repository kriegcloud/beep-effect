import { BS } from "@beep/schema";
import { TodoId } from "@beep/shared-domain/entity-ids/tasks";
import type * as S from "effect/Schema";


export class TaskTableName extends BS.StringLiteralKit(TodoId.tableName).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/tasks/TaskTableName"),
  description: "The set of table_names for entities within the tasks bounded context",
  identifier: "TaskTableName",
  title: "Task Table Name",
}) {
  static readonly Tagged = TaskTableName.toTagged("tableName");
}

export declare namespace TaskTableName {
  export type Type = S.Schema.Type<typeof TaskTableName>;
  export type Encoded = S.Schema.Encoded<typeof TaskTableName>;
}
