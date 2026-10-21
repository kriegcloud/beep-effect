/**
 * JSON quoting for the paths and patterns walker messages report.
 *
 * **Details**
 *
 * One schema codec shared by the defect and error messages of every walker
 * module, so a path with a quote or a newline in it reads unambiguously.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { identity } from "effect/Function";
import * as Result from "effect/Result";
import * as S from "effect/Schema";

const encodeJsonString = S.encodeResult(S.fromJsonString(S.String));

/**
 * Quote a string as a JSON string literal.
 *
 * **Details**
 *
 * Encoding a string to JSON cannot fail, so the codec result is unwrapped in place.
 *
 * **Example** (Quote a path)
 *
 * ```ts
 * import { quoteJson } from "@beep/walker/internal/quote";
 *
 * console.log(quoteJson("src/a b")) // "src/a b"
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const quoteJson = (value: string): string => Result.getOrThrowWith(encodeJsonString(value), identity);
