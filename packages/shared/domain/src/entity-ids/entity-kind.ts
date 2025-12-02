import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import { DocumentsTableNames, IamTableNames, SharedTableNames } from "./table-names";

export class EntityKind extends BS.StringLiteralKit(
  ...IamTableNames.IamTableName.Options,
  ...SharedTableNames.SharedTableName.Options,
  ...DocumentsTableNames.DocumentsTableName.Options
).annotations({
  schemaId: Symbol.for("@beep/shared-domain/EntityKind"),
  description: "The set of entity_kinds for entityIds within the shared-kernel",
  title: "Entity Kind",
  identifier: "EntityKind",
}) {
  static readonly Tagged = EntityKind.toTagged("__entityKind");
}

export declare namespace EntityKind {
  export type Type = S.Schema.Type<typeof EntityKind>;
  export type Encoded = S.Schema.Encoded<typeof EntityKind>;
}
