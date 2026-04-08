/**
 * Deterministic path and module-specifier normalization helpers.
 *
 * @since 0.0.0
 * @module @beep/nlp/PathText
 */
import * as Str from "@beep/utils/Str";
import { flow, pipe } from "effect";
import * as A from "effect/Array";
import * as QueryText from "./QueryText.ts";
import * as VariantText from "./VariantText.ts";

const stripLeadingDotSlash = (input: string): string => pipe(input, Str.replace(/^\.\/+/, Str.empty));
const stripTypeScriptExtension = Str.replace(/\.[cm]?tsx?$/i, Str.empty);
const basename = Str.replace(/^.*\//, Str.empty);

const pathFragmentVariants = (input: string): ReadonlyArray<string> => {
  const normalized = normalizePathPhrase(input);
  const withoutDotSlash = stripLeadingDotSlash(normalized);
  const withoutExtension = stripTypeScriptExtension(withoutDotSlash);
  const base = basename(withoutDotSlash);
  const basenameWithoutExtension = stripTypeScriptExtension(base);

  return VariantText.orderedDedupe(
    A.make(normalized, withoutDotSlash, withoutExtension, base, basenameWithoutExtension)
  );
};

/**
 * Normalize a candidate path or module fragment for deterministic lookup.
 *
 * @example
 * ```typescript
 * import * as PathText from "@beep/nlp/PathText"
 *
 * const normalized = PathText.normalizePathPhrase("src\\\\utils\\\\index.ts")
 * console.log(normalized) // "src/utils/index.ts"
 * ```
 *
 * @since 0.0.0
 * @category normalization
 */
export const normalizePathPhrase = flow(QueryText.normalizePhrase, Str.replace(/\\+/g, "/"), Str.replace(/\/+/g, "/"));

/**
 * True when the input is a bounded single-token path or module fragment.
 *
 * @example
 * ```typescript
 * import * as PathText from "@beep/nlp/PathText"
 *
 * console.log(PathText.isPathLike("src/index.ts")) // true
 * console.log(PathText.isPathLike("@beep/utils")) // true
 * console.log(PathText.isPathLike("hello world")) // false
 * ```
 *
 * @since 0.0.0
 * @category predicates
 */
export const isPathLike = (input: string): boolean => /^[A-Za-z0-9_./@-]+$/.test(normalizePathPhrase(input));

/**
 * Generate deterministic file-query variants for source-file lookup.
 *
 * @example
 * ```typescript
 * import * as PathText from "@beep/nlp/PathText"
 *
 * const variants = PathText.filePathVariants("./src/utils/index.ts")
 * console.log(variants.includes("src/utils/index")) // true
 * console.log(variants.includes("index")) // true
 * ```
 *
 * @since 0.0.0
 * @category variants
 */
export const filePathVariants = pathFragmentVariants;

/**
 * Generate deterministic module-specifier variants for import-edge lookup.
 *
 * @example
 * ```typescript
 * import * as PathText from "@beep/nlp/PathText"
 *
 * const variants = PathText.moduleSpecifierVariants("@beep/utils/Str.ts")
 * console.log(variants.includes("@beep/utils/Str")) // true
 * console.log(variants.includes("Str")) // true
 * ```
 *
 * @since 0.0.0
 * @category variants
 */
export const moduleSpecifierVariants = pathFragmentVariants;
