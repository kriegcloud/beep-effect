/**
 * Pattern inspection utilities.
 *
 * @since 0.0.0
 * @module
 */

import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { EntityPatternElement, LiteralPatternElement, PatternElement, POSPatternElement } from "./Pattern.ts";

/**
 * Check whether an element is a POS element.
 *
 * @example
 * ```ts
 * import { isPOSElement } from "@beep/nlp/Core/PatternOperations"
 *
 * console.log(isPOSElement)
 * ```
 *
 * @since 0.0.0
 * @category Predicates
 */
export const isPOSElement = (element: PatternElement): element is POSPatternElement =>
  P.isTagged(element, "POSPatternElement");

/**
 * Check whether an element is an entity element.
 *
 * @example
 * ```ts
 * import { isEntityElement } from "@beep/nlp/Core/PatternOperations"
 *
 * console.log(isEntityElement)
 * ```
 *
 * @since 0.0.0
 * @category Predicates
 */
export const isEntityElement = (element: PatternElement): element is EntityPatternElement =>
  P.isTagged(element, "EntityPatternElement");

/**
 * Check whether an element is a literal element.
 *
 * @example
 * ```ts
 * import { isLiteralElement } from "@beep/nlp/Core/PatternOperations"
 *
 * console.log(isLiteralElement)
 * ```
 *
 * @since 0.0.0
 * @category Predicates
 */
export const isLiteralElement = (element: PatternElement): element is LiteralPatternElement =>
  P.isTagged(element, "LiteralPatternElement");

/**
 * Extract element values as a readonly array.
 *
 * @example
 * ```ts
 * import { extractElementValues } from "@beep/nlp/Core/PatternOperations"
 *
 * console.log(extractElementValues)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const extractElementValues = (element: PatternElement): ReadonlyArray<string> => element.value;

/**
 * Create a bracket-string content slice if the input is bracketed.
 *
 * @example
 * ```ts
 * import { extractBracketContent } from "@beep/nlp/Core/PatternOperations"
 *
 * console.log(extractBracketContent)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const extractBracketContent = (value: string): O.Option<string> =>
  Str.startsWith("[")(value) && Str.endsWith("]")(value) ? O.some(Str.slice(1, -1)(value)) : O.none();

/**
 * Split bracket content into trimmed segments.
 *
 * @example
 * ```ts
 * import { splitBracketValues } from "@beep/nlp/Core/PatternOperations"
 *
 * console.log(splitBracketValues)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const splitBracketValues = (content: string): ReadonlyArray<string> => A.map(Str.split(content, "|"), Str.trim);

/**
 * Join values into bracket-string form.
 *
 * @example
 * ```ts
 * import { joinBracketValues } from "@beep/nlp/Core/PatternOperations"
 *
 * console.log(joinBracketValues)
 * ```
 *
 * @since 0.0.0
 * @category Accessors
 */
export const joinBracketValues = (values: ReadonlyArray<string>): string => `[${A.join(values, "|")}]`;
