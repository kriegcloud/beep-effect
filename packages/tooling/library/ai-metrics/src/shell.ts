/**
 * Shell rendering helpers for AI metrics operator commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as Str from "effect/String";

/**
 * Quote a value as one POSIX shell token.
 *
 * @example
 * ```ts
 * import { shellQuote } from "@beep/repo-ai-metrics"
 *
 * console.log(shellQuote("op://vault/item/field"))
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const shellQuote = (value: string): string => `'${Str.replace(/'/gu, "'\\''")(value)}'`;
