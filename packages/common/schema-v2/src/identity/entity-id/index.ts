/**
 * EntityId factories (schema + Drizzle helpers) plus runtime annotations.
 *
 * @example
 * import { SnakeTag } from "@beep/schema-v2/primitives/string/string";
 * import { make } from "@beep/schema-v2/identity/entity-id";
 *
 * const PersonId = make(SnakeTag.make("people"), { brand: "PersonId", annotations: { description: "PK" } });
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export * from "./entity-id";
/**
 * UUID literal schemas used across entity id helpers.
 *
 * @example
 * import { UUIDLiteral } from "@beep/schema-v2/identity/entity-id";
 *
 * const parse = UUIDLiteral.make;
 *
 * @category Identity/EntityId
 * @since 0.1.0
 */
export * from "./uuid";
