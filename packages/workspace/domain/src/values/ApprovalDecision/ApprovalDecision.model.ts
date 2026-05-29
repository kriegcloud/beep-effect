/**
 * Workspace approval decision value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $WorkspaceDomainId.create("values/ApprovalDecision/ApprovalDecision.model");

/**
 * Review decision vocabulary for approval gates.
 *
 * @example
 * ```ts
 * import { ApprovalDecision } from "@beep/workspace-domain"
 *
 * console.log(ApprovalDecision.is.pending("pending"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ApprovalDecision = LiteralKit(["pending"]).pipe(
  $I.annoteSchema("ApprovalDecision", {
    description: "Review decision vocabulary for candidate approval gates.",
  })
);

/**
 * Runtime type for {@link ApprovalDecision}.
 *
 * @example
 * ```ts
 * import type { ApprovalDecision } from "@beep/workspace-domain"
 *
 * const value: ApprovalDecision = "pending"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ApprovalDecision = typeof ApprovalDecision.Type;
