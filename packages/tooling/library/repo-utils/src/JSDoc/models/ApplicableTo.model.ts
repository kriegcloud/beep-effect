/**
 * JSDoc metadata models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $RepoUtilsId.create("JSDoc/models/ApplicableTo.model");

/**
 * AST-level attachment surface for a documentation tag.
 *
 * @example
 * ```ts
 * import { ApplicableTo } from "@beep/repo-utils/JSDoc/models/ApplicableTo.model"
 *
 * void ApplicableTo
 * ```
 * @category models
 * @since 0.0.0
 */
export const ApplicableTo = LiteralKit([
  "function",
  "method",
  "class",
  "classStaticBlock",
  "interface",
  "typeAlias",
  "enum",
  "enumMember",
  "variable",
  "constant",
  "property",
  "accessor",
  "constructor",
  "parameter", // nested within @callback/@typedef
  "signature",
  "indexSignature",
  "typeParameter",
  "tupleMember",
  "exportSpecifier",
  "identifier",
  "statement",
  "expression",
  "module", // ES module or CJS module
  "namespace",
  "file", // file-level comment
  "event",
  "mixin",
  "any", // can attach to anything
]).annotate(
  $I.annote("ApplicableTo", {
    description: "AST-level attachment surface for a documentation tag.",
  })
);

/**
 * JSDoc model export.
 *
 * @example
 * ```ts
 * import type { ApplicableTo } from "@beep/repo-utils/JSDoc/models/ApplicableTo.model"
 *
 * type Example = ApplicableTo
 * const accept = <A extends Example>(value: A): A => value
 * void accept
 * ```
 * @category models
 * @since 0.0.0
 */
export type ApplicableTo = typeof ApplicableTo.Type;
