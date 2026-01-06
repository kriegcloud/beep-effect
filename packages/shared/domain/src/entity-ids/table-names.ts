import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as CustomizationTableNames from "./CustomizationTableNames";
import * as DocumentsTableNames from "./DocumentsTableNames";
import { IamTableNames } from "./IamTableNames";
import { SharedTableNames } from "./SharedTableNames";
export class AnyTableName extends BS.StringLiteralKit(
  ...IamTableNames.IamTableName.Options,
  ...SharedTableNames.SharedTableName.Options,
  ...DocumentsTableNames.DocumentsTableName.Options,
  ...CustomizationTableNames.CustomizationTableName.Options
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

export { SharedTableNames, DocumentsTableNames, IamTableNames, CustomizationTableNames };
