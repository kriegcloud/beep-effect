/**
 * Action - Authorization action types
 *
 * Defines all the actions that can be performed in the system,
 * used for permission checking and ABAC policy evaluation.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("services/authorization/Action");

/**
 * Action - An authorization action that can be performed
 *
 * Actions follow the `resource:verb` pattern where:
 * - resource: The type of entity being acted upon
 * - verb: The operation being performed (create, read, update, delete, etc.)
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Action } from "@beep/shared-domain/services/authorization/Action"
 *
 * const isAction = S.is(Action)
 * const canManageMembers = isAction("organization:manage_members")
 *
 * void canManageMembers
 * ```
 *
 * @category domain model
 * @since 0.0.0
 */
export const Action = LiteralKit([
  // Organization actions
  "organization:manage_settings",
  "organization:manage_members",
  "organization:delete",
  "organization:transfer_ownership",
]).pipe(
  $I.annoteSchema("Action", {
    description: "An authorization action that can be performed in the system",
    documentation:
      'Actions follow the pattern "{resource}:{verb}" where:\n- resource: The type of entity being acted upon\n- verb: The operation being performed (create, read, update, delete, etc.)',
  })
);
/**
 * The Action type
 *
 * @example
 * ```ts
 * import type { Action } from "@beep/shared-domain/services/authorization/Action"
 *
 * const action: Action = "organization:manage_members"
 *
 * void action
 * ```
 *
 * @category domain model
 * @since 0.0.0
 */
export type Action = typeof Action.Type;

/**
 * Type guard for Action using Schema.is
 *
 * @example
 * ```ts
 * import { isAction } from "@beep/shared-domain/services/authorization/Action"
 *
 * const valid = isAction("organization:delete")
 *
 * void valid
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isAction = S.is(Action);
