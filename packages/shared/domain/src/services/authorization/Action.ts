/**
 * Action - Authorization action types
 *
 * Defines all the actions that can be performed in the system,
 * used for permission checking and ABAC policy evaluation.
 *
 * @module @beep/shared-domain/services/authorization/Action
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("services/authorization/Action");

/**
 * Action - An authorization action that can be performed
 *
 * Actions follow the pattern "{resource}:{verb}" where:
 * - resource: The type of entity being acted upon
 * - verb: The operation being performed (create, read, update, delete, etc.)
 *
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
 */
export type Action = typeof Action.Type;

/**
 * Type guard for Action using Schema.is
 */
export const isAction = S.is(Action);
