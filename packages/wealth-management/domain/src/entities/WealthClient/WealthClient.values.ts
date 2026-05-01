/**
 * Wealth-client value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $WealthManagementDomainId.create("entities/WealthClient/WealthClient.values");

/**
 * Fixture wealth-client status vocabulary.
 *
 * @example
 * ```ts
 * import { WealthClientStatus } from "@beep/wealth-management-domain"
 *
 * console.log(WealthClientStatus.is.active_client("active_client"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const WealthClientStatus = LiteralKit(["active_client"] as const).annotate(
  $I.annote("WealthClientStatus", {
    description: "Closed fixture status vocabulary for wealth clients.",
  })
);

/**
 * Runtime type for {@link WealthClientStatus}.
 *
 * @example
 * ```ts
 * import type { WealthClientStatus } from "@beep/wealth-management-domain"
 *
 * const value: WealthClientStatus = "active_client"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type WealthClientStatus = typeof WealthClientStatus.Type;
