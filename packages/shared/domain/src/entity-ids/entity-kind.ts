import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import { IamTableNames, SharedTableNames, TaskTableNames } from "./table-names";

export const EntityKindKit = BS.stringLiteralKit(
  ...IamTableNames.IamTableNameKit.Options,
  ...SharedTableNames.SharedTableNameKit.Options,
  ...TaskTableNames.TaskTableNameKit.Options
);

export class EntityKind extends EntityKindKit.Schema.annotations({
  schemaId: Symbol.for("@beep/shared-domain/EntityKind"),
  description: "The set of entity_kinds for entityIds within the shared-kernel",
  title: "Entity Kind",
  identifier: "EntityKind",
}) {
  static readonly Tagged = EntityKindKit.toTagged("__entityKind");
  static readonly Options = EntityKindKit.Options;
  static readonly Enum = EntityKindKit.Enum;
}

export declare namespace EntityKind {
  export type Type = S.Schema.Type<typeof EntityKindKit>;
  export type Encoded = S.Schema.Encoded<typeof EntityKindKit>;
}
