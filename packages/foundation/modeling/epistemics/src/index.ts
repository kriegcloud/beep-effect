/**
 * Package entry point for `@beep/epistemics`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Claim disposition status value exports.
 *
 * **Example** (Log rejected disposition status)
 *
 * ```ts
 * import { ClaimDispositionStatus } from "@beep/epistemics"
 *
 * console.log(ClaimDispositionStatus.Enum.rejected)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export * from "./ClaimDispositionStatus/index.ts";
/**
 * Claim gate verdict value exports.
 *
 * **Example** (Decode gate severity value)
 *
 * ```ts
 * import { ClaimGateSeverity } from "@beep/epistemics"
 * import * as S from "effect/Schema"
 *
 * const severity = S.decodeUnknownSync(ClaimGateSeverity)("violation")
 * console.log(severity)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export * from "./ClaimGate/index.ts";
/**
 * Edge relation vocabulary exports.
 *
 * **Example** (Log supports edge relation)
 *
 * ```ts
 * import { EdgeRelation } from "@beep/epistemics"
 *
 * console.log(EdgeRelation.Enum.supports)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export * from "./EdgeRelation/index.ts";
/**
 * Evidence span value exports.
 *
 * **Example** (Decode confidence value)
 *
 * ```ts
 * import { Confidence } from "@beep/epistemics"
 * import * as S from "effect/Schema"
 *
 * const confidence = S.decodeUnknownSync(Confidence)(0.88)
 * console.log(confidence)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export * from "./EvidenceSpan/index.ts";
/**
 * Transaction-time interval exports.
 *
 * **Example** (Check whether a record is current)
 *
 * ```ts
 * import { KnowledgeInterval, knownAt } from "@beep/epistemics"
 * import * as DateTime from "effect/DateTime"
 * import * as S from "effect/Schema"
 *
 * const interval = S.decodeUnknownSync(KnowledgeInterval)({ expiredAt: null, recordedAt: 1_000 })
 * console.log(knownAt(interval, DateTime.makeUnsafe(5_000))) // true
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export * from "./KnowledgeInterval/index.ts";
/**
 * Valid-time interval exports.
 *
 * **Example** (Check whether a fact holds)
 *
 * ```ts
 * import { holdsAt, ValidInterval } from "@beep/epistemics"
 * import * as DateTime from "effect/DateTime"
 * import * as S from "effect/Schema"
 *
 * const interval = S.decodeUnknownSync(ValidInterval)({ validFrom: 1_000, validTo: 2_000 })
 * console.log(holdsAt(interval, DateTime.makeUnsafe(2_000))) // false
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export * from "./ValidInterval/index.ts";
