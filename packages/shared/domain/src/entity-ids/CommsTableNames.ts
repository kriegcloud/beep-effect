import { BS } from "@beep/schema";
import { EmailTemplateId } from "@beep/shared-domain/entity-ids/comms";
import type * as S from "effect/Schema";

export class CommsTableName extends BS.StringLiteralKit(EmailTemplateId.tableName).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/comms/CommsTableName"),
  description: "The set of table_names for entities within the comms bounded context",
  identifier: "CommsTableName",
  title: "Comms Table Name",
}) {
  static readonly Tagged = CommsTableName.toTagged("tableName");
}

export declare namespace CommsTableName {
  export type Type = S.Schema.Type<typeof CommsTableName>;
  export type Encoded = S.Schema.Encoded<typeof CommsTableName>;
}
