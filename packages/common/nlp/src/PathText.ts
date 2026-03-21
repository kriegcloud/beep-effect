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
 * @since 0.0.0
 * @category Normalization
 */
export const normalizePathPhrase = flow(QueryText.normalizePhrase, Str.replace(/\\+/g, "/"), Str.replace(/\/+/g, "/"));

/**
 * True when the input is a bounded single-token path or module fragment.
 *
 * @since 0.0.0
 * @category Predicates
 */
export const isPathLike = (input: string): boolean => /^[A-Za-z0-9_./@-]+$/.test(normalizePathPhrase(input));

/**
 * Generate deterministic file-query variants for source-file lookup.
 *
 * @since 0.0.0
 * @category Variants
 */
export const filePathVariants = pathFragmentVariants;

/**
 * Generate deterministic module-specifier variants for import-edge lookup.
 *
 * @since 0.0.0
 * @category Variants
 */
export const moduleSpecifierVariants = pathFragmentVariants;
