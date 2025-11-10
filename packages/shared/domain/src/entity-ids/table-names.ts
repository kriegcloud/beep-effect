import { BS } from "@beep/schema";
import { TaskTableNames } from "@beep/shared-domain/entity-ids/TaskTableNames";
import type * as S from "effect/Schema";
import { IamTableNames } from "./IamTableNames";
import { SharedTableNames } from "./SharedTableNames";

export const AnyTableNameKit = BS.stringLiteralKit(
  ...IamTableNames.IamTableNameKit.Options,
  ...SharedTableNames.SharedTableNameKit.Options,
  ...TaskTableNames.TaskTableNameKit.Options
);

export class AnyTableName extends AnyTableNameKit.Schema.annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/AnyTableName"),
  description: "The set of table_names for entityIds within the shared-kernel and iam domain slices",
  identifier: "AnyTableName",
  title: "Any Table Name",
}) {
  static readonly Tagged = AnyTableNameKit.toTagged("tableName");
  static readonly Enum = AnyTableNameKit.Enum;
  static readonly Options = AnyTableNameKit.Options;
}

export declare namespace AnyTableName {
  export type Type = S.Schema.Type<typeof AnyTableName>;
  export type Encoded = S.Schema.Encoded<typeof AnyTableName>;
}

export { SharedTableNames, IamTableNames, TaskTableNames };
