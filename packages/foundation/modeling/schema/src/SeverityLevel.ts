/**
 * Shared generic severity domains.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $SchemaId } from "@beep/identity/packages";
import { LiteralKit } from "./LiteralKit/index.ts";

const $I = $SchemaId.create("SeverityLevel");

const SeverityLevelBase = LiteralKit(["low", "medium", "high", "critical"]);

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
 * @category validation
 */
export const SeverityLevel = SeverityLevelBase.pipe(
  $I.annoteSchema("SeverityLevel", {
    description: "Generic four-level severity scale shared across beep packages.",
  })
);

/**
 * Type for {@link SeverityLevel}.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SeverityLevel } from "@beep/schema/SeverityLevel"
 *
 * const severity: SeverityLevel = S.decodeUnknownSync(SeverityLevel)("critical")
 * console.log(severity) // "critical"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type SeverityLevel = typeof SeverityLevel.Type;
