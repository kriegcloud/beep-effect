/**
 * Aggregates the runtime assertion helpers, tagged errors, and metadata types
 * that make up the `@beep/invariant` package so downstream code can consume
 * them through a single namespace import.
 *
 * @example
 * ```ts
 * import type * as CommonTypes from "@beep/types/common.types";
 * import { invariant, InvariantViolation } from "@beep/invariant";
 *
 * type Payload = CommonTypes.Prettify<{ readonly token: string | null }>;
 *
 * export const assertToken = (payload: Payload) => {
 *   try {
 *     invariant(payload.token, "token missing", {
 *       file: "packages/common/invariant/src/index.ts",
 *       line: 21,
 *       args: [payload],
 *     });
 *   } catch (error) {
 *     if (error instanceof InvariantViolation) {
 *       console.error(error.message);
 *     }
 *   }
 * };
 * ```
 * @category Invariant/Overview
 * @since 0.1.0
 */
/**
 * Re-exports the tagged error surface so downstream packages can type-narrow
 * runtime failures thrown by `invariant`.
 *
 * @example
 * ```ts
 * import type * as CommonTypes from "@beep/types/common.types";
 * import { InvariantViolation } from "@beep/invariant";
 *
 * const assertPositive = (count: CommonTypes.Prettify<{ readonly value: number }>) => {
 *   if (count.value <= 0) {
 *     throw new InvariantViolation({
 *       message: "value must be positive",
 *       file: "packages/common/invariant/src/index.ts",
 *       line: 39,
 *       args: [count],
 *     });
 *   }
 * };
 * ```
 * @category Invariant/Exports
 * @since 0.1.0
 */
export * from "@beep/invariant/error";

/**
 * Re-exports the assertion helpers, ensuring importing from `@beep/invariant`
 * yields the full helper surface without deep paths.
 *
 * @example
 * ```ts
 * import type * as CommonTypes from "@beep/types/common.types";
 * import { invariant } from "@beep/invariant";
 *
 * type Settings = CommonTypes.DeepPartial<{ readonly token: string | null }>;
 * const settings: Settings = { token: "token_456" };
 *
 * invariant(settings.token, "token missing", {
 *   file: "packages/common/invariant/src/index.ts",
 *   line: 60,
 *   args: [settings],
 * });
 * ```
 * @category Invariant/Exports
 * @since 0.1.0
 */
export * from "@beep/invariant/invariant";

/**
 * Re-exports the metadata schema and namespace so callers can import both the
 * parser and related types without drilling into internal paths.
 *
 * @example
 * ```ts
 * import type * as CommonTypes from "@beep/types/common.types";
 * import * as S from "effect/Schema";
 * import { CallMetadata } from "@beep/invariant";
 *
 * const decode = S.decodeUnknownSync(CallMetadata);
 * const meta = decode({
 *   file: "packages/common/invariant/src/index.ts",
 *   line: 78,
 *   args: [],
 * });
 * const snapshot: CommonTypes.Prettify<typeof meta> = meta;
 * void snapshot;
 * ```
 * @category Invariant/Exports
 * @since 0.1.0
 */
export * from "@beep/invariant/meta";
