/**
 * Shared slice entity-id schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity";
import { EntityId } from "./_internal/index.js";

const $I = $SharedDomainId.create("entity-ids/Shared");
const make = EntityId.factory("shared", $I);

/**
 * Entity id for users in the shared slice.
 *
 * @example
 * ```ts
 * import { Shared } from "@beep/shared-domain/entity-ids"
 *
 * const idSchema = Shared.OrganizationId
 *
 * void idSchema
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export const OrganizationId = make("OrganizationId", {
  tableName: "organization",
});

/**
 * Type for {@link OrganizationId}.
 *
 * @example
 * ```ts
 * import type { Shared } from "@beep/shared-domain/entity-ids"
 *
 * const readId = (id: Shared.OrganizationId) => id
 *
 * void readId
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export type OrganizationId = typeof OrganizationId.Type;

/**
 * Entity id for sessions in the shared slice.
 *
 * @example
 * ```ts
 * import { Shared } from "@beep/shared-domain/entity-ids"
 *
 * const idSchema = Shared.SessionId
 *
 * void idSchema
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export const SessionId = make("SessionId", {
  tableName: "session",
});

/**
 * Type for {@link SessionId}.
 *
 * @example
 * ```ts
 * import type { Shared } from "@beep/shared-domain/entity-ids"
 *
 * const readId = (id: Shared.SessionId) => id
 *
 * void readId
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export type SessionId = typeof SessionId.Type;

/**
 * Entity id for organizations in the shared slice.
 *
 * @example
 * ```ts
 * import { Shared } from "@beep/shared-domain/entity-ids"
 *
 * const idSchema = Shared.UserId
 *
 * void idSchema
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export const UserId = make("UserId", {
  tableName: "user",
});

/**
 * Type for {@link UserId}.
 *
 * @example
 * ```ts
 * import type { Shared } from "@beep/shared-domain/entity-ids"
 *
 * const readId = (id: Shared.UserId) => id
 *
 * void readId
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export type UserId = typeof UserId.Type;
