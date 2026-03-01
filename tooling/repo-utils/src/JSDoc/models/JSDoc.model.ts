/**
 * @module @beep/repo-utils/JSDoc/JSDoc.model
 * @description Authoritative, multi-source dataset of all JSDoc, TSDoc, and TypeScript-recognized
 * documentation tags. Designed to serve as the foundation for an Effect/Schema discriminated union
 * used in a code knowledge graph pipeline.
 * Sources:
 *   - JSDoc 3 Official (https://jsdoc.app) — 67 block tags, 2 inline tags
 *   - TSDoc Specification (https://tsdoc.org) — 25 standard tags (Core, Extended, Discretionary)
 *   - TypeScript Compiler (https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
 *   - Google Closure Compiler annotations
 *   - API Extractor / AEDoc extensions
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $RepoUtilsId.create("JSDoc/models/JSDoc.model");

/**
 * Enumerates canonical standards that define a documentation tag.
 *
 * @since 0.0.0
 * @category models
 */
export const Specification = LiteralKit([
  // JSDoc 3.x standard (jsdoc.app)
  "jsdoc3",
  // TSDoc Core — must be supported by all TSDoc tools
  "tsdoc-core",
  // TSDoc Extended — optional but standardized
  "tsdoc-extended",
  // TSDoc Discretionary — syntax standardized, semantics vary
  "tsdoc-discretionary",
  // Recognized by TypeScript compiler in .js files
  "typescript",
  // Google Closure Compiler
  "closure",
  // Microsoft API Extractor / AEDoc
  "api-extractor",
  // TypeDoc-specific extensions
  "typedoc",
  // User-defined / non-standard
  "custom",
]).annotate(
  $I.annote("Specification", {
    description: "Which specification(s) define this tag",
  })
);

/**
 * Union of canonical documentation standards represented by {@link Specification}.
 *
 * @category models
 * @since 0.0.0
 */
export type Specification = typeof Specification.Type;

/**
 * Classifies a tag by its syntactic placement in documentation text.
 *
 * @description The syntactic form of the tag
 * @category models
 * @since 0.0.0
 */
export const TagKind = LiteralKit([
  // @tag content... (top-level, content until next block/modifier tag)
  "block",
  // {@tag content} (embedded within other content)
  "inline",
  // @tag (no content, indicates a quality/flag)
  "modifier",
]).annotate(
  $I.annote("TagKind", {
    description: "The kind of tag",
  })
);

/**
 * Union of supported documentation tag placement kinds.
 *
 * @description The syntactic form of the tag
 * @category models
 * @since 0.0.0
 */
export type TagKind = typeof TagKind.Type;

/**
 * Whether this tag's content can be deterministically derived from the TypeScript AST.
 *
 * This is the KEY field for the knowledge graph pipeline:
 *   - "full"    → Layer 1 (certainty=1.0): 100% derivable from AST, no human input needed
 *   - "partial" → Layer 2 (certainty=0.85-0.95): Structurally derivable but may need human context
 *   - "none"    → Layer 3 (certainty=0.6-0.85): Requires human authoring or LLM inference
 *
 * @since 0.0.0
 * @category models
 */
