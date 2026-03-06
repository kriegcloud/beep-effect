import { $SharedDomainId } from "@beep/identity";
import { EntityId } from "./internal/index.js";

const $I = $SharedDomainId.create("entity-ids/Shared");
const make = EntityId.factory("shared", $I);

/**
 * Entity id for organizations in the shared slice.
 *
 * @since 0.0.0
 */
export const OrganizationId = make("OrganizationId", {
  tableName: "organization",
});

/**
 * Type for {@link OrganizationId}.
 *
 * @since 0.0.0
 */
export type OrganizationId = typeof OrganizationId.Type;

/**
 * Entity id for sessions in the shared slice.
 *
 * @since 0.0.0
 */
export const SessionId = make("SessionId", {
  tableName: "session",
});

/**
 * Type for {@link SessionId}.
 *
 * @since 0.0.0
 */
export type SessionId = typeof SessionId.Type;
