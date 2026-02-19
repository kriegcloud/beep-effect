/**
 * Exposes the structured metadata schema and namespace used by
 * `@beep/invariant` so downstream layers can validate and type the arguments
 * that accompany each assertion failure.
 *
 * @example
 * ```ts
 * import type * as CommonTypes from "@beep/types/common.types";
 * import * as S from "effect/Schema";
 * import { CallMetadata } from "@beep/invariant";
 *
 * type FailureInput = CommonTypes.Prettify<{ file: string; line: number; args: ReadonlyArray<unknown> }>;
 *
 * const parseMetadata = (input: FailureInput) => S.decodeUnknownSync(CallMetadata)(input);
 * ```
 * @category Invariant/Overview
 * @since 0.1.0
 */

import * as S from "effect/Schema";

/**
 * Structured metadata describing where an invariant was triggered.
 *
 * The schema enforces non-empty file paths, non-negative line numbers, and a
 * serializable argument vector so downstream telemetry can safely log context.
 *
 * @identifier CallMetadata
 * @description Structured metadata for invariant assertion failures (file location, line number, arguments)
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema";
 * import { CallMetadata } from "@beep/invariant";
 *
 * const decode = S.decodeUnknownSync(CallMetadata);
 * const meta = decode({ file: "packages/workspaces/domain/src/Uploader.ts", line: 17, args: ["tenant-1"] });
 * ```
 * @category Invariant/Metadata
 * @since 0.1.0
 */
export const CallMetadata: S.Struct<{
  file: typeof S.NonEmptyString;
  line: S.refine<number, typeof S.NonNegative>;
  args: S.Array$<typeof S.Unknown>;
}> = S.Struct({
  file: S.NonEmptyString,
  line: S.NonNegativeInt,
  args: S.Array(S.Unknown),
});

/**
 * Namespace container that exposes the typed metadata alias associated with
 * the runtime schema, ensuring consumers share structural equality between the
 * parser and inferred type.
 *
 * @example
 * ```ts
 * import type { CallMetadata } from "@beep/invariant";
 *
 * const clone: CallMetadata.Type = {
 *   file: "packages/common/invariant/src/invariant.ts",
 *   line: 90,
 *   args: [],
 * };
 * void clone;
 * ```
 * @category Invariant/Metadata
 * @since 0.1.0
 */
export declare namespace CallMetadata {
  /**
   * Type alias describing the parsed metadata object emitted by `invariant`.
   *
   * @example
   * ```ts
   * import type { CallMetadata } from "@beep/invariant";
   *
   * const meta: CallMetadata.Type = {
   *   file: "packages/common/invariant/src/invariant.ts",
   *   line: 120,
   *   args: [],
   * };
   * void meta;
   * ```
   * @category Invariant/Metadata
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof CallMetadata>;
}
