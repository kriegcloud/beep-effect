import { BS } from "@beep/schema";
import { UserHotkeyId } from "@beep/shared-domain/entity-ids/customization";
import type * as S from "effect/Schema";

export class CustomizationTableName extends BS.StringLiteralKit(UserHotkeyId.tableName).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/customization/CustomizationTableName"),
  description: "The set of table_names for entities within the customization bounded context",
  identifier: "CustomizationTableName",
  title: "Knowledge Management Table Name",
}) {
  static readonly Tagged = CustomizationTableName.toTagged("tableName");
}

export declare namespace CustomizationTableName {
  export type Type = S.Schema.Type<typeof CustomizationTableName>;
  export type Encoded = S.Schema.Encoded<typeof CustomizationTableName>;
}
