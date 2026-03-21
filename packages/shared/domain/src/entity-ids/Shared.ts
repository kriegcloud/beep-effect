import { $SharedDomainId } from "@beep/identity";
import { EntityId } from "./_internal/index.js";

const $I = $SharedDomainId.create("entity-ids/Shared");
const make = EntityId.factory("shared", $I);

/**
 * Entity id for organizations in the shared slice.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const OrganizationId = make("OrganizationId", {
  tableName: "organization",
});

/**
 * Type for {@link OrganizationId}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OrganizationId = typeof OrganizationId.Type;

/**
 * Entity id for sessions in the shared slice.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SessionId = make("SessionId", {
  tableName: "session",
});

/**
 * Type for {@link SessionId}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SessionId = typeof SessionId.Type;

/**
 * Entity id for organizations in the shared slice.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const UserId = make("UserId", {
  tableName: "user",
});

/**
 * Type for {@link UserId}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type UserId = typeof UserId.Type;
