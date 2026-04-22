/**
 * Base organization membership roles.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("services/authorization/BaseRole");

/**
 * BaseRole - Base role for organization membership
 *
 * Defines the hierarchical access levels within an organization:
 * - 'owner': Organization creator/owner with full access, can delete org and transfer ownership
 * - 'admin': Organization administrator with full data operations and member management
 * - 'member': Standard user with access based on functional roles assigned
 * - 'viewer': Read-only access to view data and reports only
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { BaseRole } from "@beep/shared-domain/services/authorization/BaseRole"
 *
 * const isBaseRole = S.is(BaseRole)
 * const isOwner = isBaseRole("owner")
 *
 * void isOwner
 * ```
 *
 * @category domain model
 * @since 0.0.0
 */
export const BaseRole = LiteralKit(["owner", "admin", "member", "viewer"]).pipe(
  $I.annoteSchema("BaseRole", {
    description: "The base organization role granted to a member.",
    documentation:
      "Defines the hierarchical access levels within an organization:\n- `owner`: Organization creator/owner with full access, can delete org and transfer ownership\n- `admin`: Organization administrator with full data operations and member management\n- `member`: Standard user with access based on functional roles assigned\n- `viewer`: Read-only access to view data and reports only",
  })
);

/**
 * Type for {@link BaseRole}.
 *
 * @example
 * ```ts
 * import type { BaseRole } from "@beep/shared-domain/services/authorization/BaseRole"
 *
 * const role: BaseRole = "admin"
 *
 * void role
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export type BaseRole = typeof BaseRole.Type;

/**
 * Guard for {@link BaseRole}.
 *
 * @example
 * ```ts
 * import { isBaseRole } from "@beep/shared-domain/services/authorization/BaseRole"
 *
 * const valid = isBaseRole("viewer")
 *
 * void valid
 * ```
 *
 * @since 0.0.0
 * @category guards
 */
export const isBaseRole = S.is(BaseRole);
