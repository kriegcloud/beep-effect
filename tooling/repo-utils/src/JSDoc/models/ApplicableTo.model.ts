import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $RepoUtilsId.create("JSDoc/models/ApplicableTo.model");

/**
 * AST-level attachment surface for a documentation tag.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 */
export type ApplicableTo = typeof ApplicableTo.Type;
