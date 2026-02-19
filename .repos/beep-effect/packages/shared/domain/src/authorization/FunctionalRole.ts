/**
 * FunctionalRole - Additive roles for organization members
 *
 * Users with the 'member' base role can be assigned functional roles
 * that grant specific capabilities:
 *
 * - 'controller': Period lock/unlock, consolidation run/approval, full financial oversight
 * - 'finance_manager': Period soft close, account management, exchange rates, elimination rules
 * - 'accountant': Create/edit/post journal entries, reconciliation
 * - 'period_admin': Open/close periods, create adjustment periods
 * - 'consolidation_manager': Manage consolidation groups, elimination rules
 *
 * @module authorization/FunctionalRole
 */
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

/**
 * FunctionalRole - Additive role that grants specific capabilities
 *
 * These roles are independent of the base role and can be combined.
 * A user can have multiple functional roles simultaneously.
 */
export const FunctionalRole = BS.StringLiteralKit(
  "controller",
  "finance_manager",
  "accountant",
  "period_admin",
  "consolidation_manager"
).annotations({
  identifier: "FunctionalRole",
  title: "Functional Role",
  description: "A functional role that grants specific capabilities within an organization",
});

/**
 * The FunctionalRole type
 */
export type FunctionalRole = typeof FunctionalRole.Type;

/**
 * Type guard for FunctionalRole using Schema.is
 */
export const isFunctionalRole = S.is(FunctionalRole);

/**
 * Schema for an array of FunctionalRoles
 */
export const FunctionalRoles = S.Array(FunctionalRole).annotations({
  identifier: "FunctionalRoles",
  title: "Functional Roles",
  description: "An array of functional roles assigned to a user",
});

/**
 * The FunctionalRoles type (array of functional roles)
 */
export type FunctionalRoles = typeof FunctionalRoles.Type;
