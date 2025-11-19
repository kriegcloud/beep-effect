import { BS } from "@beep/schema";

export class EntitySource extends BS.StringLiteralKit(
  "auto_created",
  "user",
  "agent",
  "admin",
  "third_party",
  "api",
  "script"
).annotations({
  schemaId: Symbol.for("@beep/shared-domain/value-objects/EntitySource"),
  identifier: "EntitySource",
  title: "Entity Source",
  description: "Source of an entity",
}) {}

export declare namespace EntitySource {
  export type Type = typeof EntitySource.Type;
  export type Encoded = typeof EntitySource.Encoded;
}
