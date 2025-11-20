import { BS } from "@beep/schema";
import * as CommsTableNames from "@beep/shared-domain/entity-ids/CommsTableNames";
import { TaskTableNames } from "@beep/shared-domain/entity-ids/TaskTableNames";
import type * as S from "effect/Schema";
import { IamTableNames } from "./IamTableNames";
import { SharedTableNames } from "./SharedTableNames";

export class AnyTableName extends BS.StringLiteralKit(
  ...IamTableNames.IamTableName.Options,
  ...SharedTableNames.SharedTableName.Options,
  ...TaskTableNames.TaskTableName.Options,
  ...CommsTableNames.CommsTableName.Options
).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/AnyTableName"),
  description: "The set of table_names for entityIds within the shared-kernel and iam domain slices",
  identifier: "AnyTableName",
  title: "Any Table Name",
}) {
  static readonly Tagged = AnyTableName.toTagged("tableName");
}

export declare namespace AnyTableName {
  export type Type = S.Schema.Type<typeof AnyTableName>;
  export type Encoded = S.Schema.Encoded<typeof AnyTableName>;
}

export { SharedTableNames, IamTableNames, TaskTableNames, CommsTableNames };
