/**
 * Shared schemas for primitive Next.js configuration helper types.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import { $RepoConfigsId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoConfigsId.create("next/models/Shared.schema");

const FileSizeScale = LiteralKit(["k", "K", "m", "M", "g", "G", "t", "T", "p", "P"] as const);
const FileSizeByte = LiteralKit(["b", "B"] as const);

/**
 * File-size suffix accepted by Next.js size limit strings.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { FileSizeSuffix } from "@beep/repo-configs/next/models/Shared.schema"
 *
 * const program = S.decodeUnknownEffect(FileSizeSuffix)("mb")
 * void Effect.runPromise(program)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FileSizeSuffix = S.TemplateLiteral([FileSizeScale, FileSizeByte]).pipe(
  $I.annoteSchema("FileSizeSuffix", {
    description: "File-size suffix accepted by Next.js size limit strings.",
    documentation: "Matches Next.js FileSizeSuffix: one of k/K/m/M/g/G/t/T/p/P followed by b or B.",
  })
);

/**
 * File-size suffix accepted by Next.js size limit strings.
 *
 * @example
 * ```ts
 * import type { FileSizeSuffix } from "@beep/repo-configs/next/models/Shared.schema"
 *
 * const suffix = "MB" satisfies FileSizeSuffix
 * void suffix
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type FileSizeSuffix = typeof FileSizeSuffix.Type;

const SizeLimitText = S.TemplateLiteral([S.Number, FileSizeSuffix]);

/**
 * Numeric or suffixed string size limit accepted by Next.js.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { SizeLimit } from "@beep/repo-configs/next/models/Shared.schema"
 *
 * const program = S.decodeUnknownEffect(SizeLimit)("2mb")
 * void Effect.runPromise(program)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const SizeLimit = S.Union([S.Number, SizeLimitText]).pipe(
  $I.annoteSchema("SizeLimit", {
    description: "Numeric or suffixed string size limit accepted by Next.js.",
    documentation: "Matches Next.js SizeLimit: a number or a string shaped as `${number}${FileSizeSuffix}`.",
  })
);

/**
 * Numeric or suffixed string size limit accepted by Next.js.
 *
 * @example
 * ```ts
 * import type { SizeLimit } from "@beep/repo-configs/next/models/Shared.schema"
 *
 * const limit = "2mb" satisfies SizeLimit
 * void limit
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SizeLimit = typeof SizeLimit.Type;
