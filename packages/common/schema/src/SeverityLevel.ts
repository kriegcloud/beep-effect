/**
 * Shared generic severity domains.
 *
 * @since 0.0.0
 * @module
 */

import { $SchemaId } from "@beep/identity/packages";
import { LiteralKit } from "./LiteralKit.ts";

const $I = $SchemaId.create("SeverityLevel");

const SeverityLevelBase = LiteralKit(["low", "medium", "high", "critical"] as const);

/**
 * Generic four-level severity scale: `"low"`, `"medium"`, `"high"`, `"critical"`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SeverityLevel } from "@beep/schema/SeverityLevel"
 *
 * const level = S.decodeUnknownSync(SeverityLevel)("high")
 * console.log(level) // "high"
 * ```
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
 * @example
 * ```ts
 * import type { SeverityLevel } from "@beep/schema/SeverityLevel"
 *
 * const severity: SeverityLevel = "critical"
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SeverityLevel = typeof SeverityLevel.Type;
