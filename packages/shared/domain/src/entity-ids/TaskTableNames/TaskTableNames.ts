import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import { TodoId } from "@beep/shared-domain/entity-ids/tasks";
export const TaskTableNameKit = BS.stringLiteralKit(
  TodoId.tableName
);

export class TaskTableName extends TaskTableNameKit.Schema.annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/tasks/TaskTableName"),
  description: "The set of table_names for entities within the tasks bounded context",
  identifier: "TaskTableName",
  title: "Task Table Name",
}) {
  static readonly Tagged = TaskTableNameKit.toTagged("tableName");
  static readonly Enum = TaskTableNameKit.Enum;
  static readonly Options = TaskTableNameKit.Options;
  static readonly is = TaskTableNameKit.is;
}

export declare namespace TaskTableName {
  export type Type = S.Schema.Type<typeof TaskTableName>;
  export type Encoded = S.Schema.Encoded<typeof TaskTableName>;
}