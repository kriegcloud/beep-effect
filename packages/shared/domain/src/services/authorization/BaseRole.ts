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
 * @module @beep/shared-domain/services/authorization/BaseRole
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
 * @since 0.0.0
 * @category DomainModel
 */
export type BaseRole = typeof BaseRole.Type;

/**
 * Guard for {@link BaseRole}.
 *
 * @since 0.0.0
 * @category Guards
 */
export const isBaseRole = S.is(BaseRole);
