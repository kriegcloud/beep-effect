import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $SharedDomainId.create("values/EntitySource.value");

export class EntitySource extends BS.StringLiteralKit(
  "auto_created",
  "user",
  "agent",
  "admin",
  "third_party",
  "api",
  "script"
).annotations({
  ...$I.annotations("EntitySource", {
    title: "Entity Source",
    description: "Source of an entity",
  }),
}) {}

export declare namespace EntitySource {
  export type Type = typeof EntitySource.Type;
  export type Encoded = typeof EntitySource.Encoded;
}
