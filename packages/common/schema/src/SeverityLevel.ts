/**
 * Shared generic severity domains.
 *
 * @since 0.0.0
 * @module @beep/schema/SeverityLevel
 */

import { $SchemaId } from "@beep/identity/packages";
import { LiteralKit } from "./LiteralKit.ts";

const $I = $SchemaId.create("SeverityLevel");

const SeverityLevelBase = LiteralKit(["low", "medium", "high", "critical"] as const);

/**
 * Generic four-level severity scale.
 *
 * @since 0.0.0
 * @category Validation
 */
export const SeverityLevel = SeverityLevelBase.annotate(
  $I.annote("SeverityLevel", {
    description: "Generic four-level severity scale shared across beep packages.",
  })
);

/**
 * Type for {@link SeverityLevel}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SeverityLevel = typeof SeverityLevel.Type;
