import { BS } from "@beep/schema";

export const EntitySourceKit = BS.stringLiteralKit(
  "auto_created",
  "user",
  "agent",
  "admin",
  "third_party",
  "api",
  "script"
);

export class EntitySource extends EntitySourceKit.Schema.annotations({
  schemaId: Symbol.for("@beep/shared-domain/value-objects/EntitySource"),
  identifier: "EntitySource",
  title: "Entity Source",
  description: "Source of an entity",
}) {
  static readonly Options = EntitySourceKit.Options;
  static readonly Enum = EntitySourceKit.Enum;
}

export declare namespace EntitySource {
  export type Type = typeof EntitySource.Type;
  export type Encoded = typeof EntitySource.Encoded;
}
