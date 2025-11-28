/**
 * Defines the `InvariantViolation` error used across the invariant runtime so
 * callers can throw or narrow violations with consistent metadata.
 *
 * @example
 * ```ts
 * import type * as CommonTypes from "@beep/types/common.types";
 * import { InvariantViolation } from "@beep/invariant";
 *
 * type FailureMeta = CommonTypes.Prettify<{ readonly file: string; readonly line: number }>;
 *
 * const raiseInvariant = (meta: FailureMeta) => {
 *   throw new InvariantViolation({
 *     ...meta,
 *     message: "BUG: invalid branch",
 *     args: [],
 *   });
 * };
 * ```
 * @category Invariant/Overview
 * @since 0.1.0
 */

/**
 * Tagged error thrown by `invariant` when a runtime assertion fails.
 *
 * Each violation includes the trimmed source file, the originating line number,
 * and a serializable snapshot of the arguments that triggered the failure. This
 * makes it easy for higher-level layers to map violations onto HTTP or domain
 * primitives without losing the debugging breadcrumbs.
 *
 * @example
 * ```ts
 * import { InvariantViolation } from "@beep/invariant";
 *
 * const guard = (count: number) => {
 *   if (count <= 0) {
 *     throw new InvariantViolation({
 *       message: "count must be positive",
 *       file: "packages/documents/domain/src/counters/Increment.ts",
 *       line: 18,
 *       args: [count],
 *     });
 *   }
 *   return count;
 * };
 * ```
 * @category Invariant/Errors
 * @since 0.1.0
 */
export class InvariantViolation extends Error {
  /**
   * Trimmed file path recorded with the violation.
   *
   * @since 0.1.0
   */
  readonly file?: string | undefined;
  /**
   * Line number (0- or 1-based depending on host runtime) captured at the callsite.
   *
   * @since 0.1.0
   */
  readonly line?: number | undefined;
  /**
   * Serialized arguments that were passed into the invariant call.
   *
   * @since 0.1.0
   */
  readonly args?: ReadonlyArray<unknown> | undefined;
  constructor(args: {
    readonly message: string;
    /**
     * File where the invariant was defined/called (best-effort trimmed path).
     *
     * @since 0.1.0
     */
    readonly file?: string | undefined;
    /**
     * Line number (0-based or 1-based depending on environment; treat as opaque).
     *
     * @since 0.1.0
     */
    readonly line?: number | undefined;
    /**
     * Best-effort, JSON-serializable view of extra args (may be lossy).
     *
     * @since 0.1.0
     */
    readonly args?: ReadonlyArray<unknown> | undefined;
  }) {
    super(args.message);
    this.file = args.file;
    this.line = args.line;
    this.args = args.args;
    // NOTE: Restores prototype chain (https://stackoverflow.com/a/48342359).
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
