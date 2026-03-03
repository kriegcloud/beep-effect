import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $RepoUtilsId.create("JSDoc/models/Specification.model");

/**
 * Enumerates canonical standards that define a documentation tag.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Specification = LiteralKit([
  // JSDoc 3.x standard (jsdoc.app)
  "jsdoc3",
  // TSDoc Core — must be supported by all TSDoc tools
  "tsdocCore",
  // TSDoc Extended — optional but standardized
  "tsdocExtended",
  // TSDoc Discretionary — syntax standardized, semantics vary
  "tsdocDiscretionary",
  // Recognized by TypeScript compiler in .js files
  "typescript",
  // Google Closure Compiler
  "closure",
  // Microsoft API Extractor / AEDoc
  "apiExtractor",
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
 * @category DomainModel
 * @since 0.0.0
 */
export type Specification = typeof Specification.Type;
