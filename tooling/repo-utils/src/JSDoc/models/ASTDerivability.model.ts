import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

/* cspell:ignore Derivability */

const $I = $RepoUtilsId.create("JSDoc/models/ASTDerivability.model");
/**
 * Whether this tag's content can be deterministically derived from the TypeScript AST.
 *
 * This is the KEY field for the knowledge graph pipeline:
 *   - "full"    → Layer 1 (certainty=1.0): 100% derivable from AST, no human input needed
 *   - "partial" → Layer 2 (certainty=0.85-0.95): Structurally derivable but may need human context
 *   - "none"    → Layer 3 (certainty=0.6-0.85): Requires human authoring or LLM inference
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ASTDerivability = LiteralKit(["full", "partial", "none"]).annotate(
  $I.annote("ASTDerivability", {
    description: "Whether this tag's content can be deterministically derived from the TypeScript AST.",
    documentation:
      'Whether this tag\'s content can be deterministically derived from the TypeScript AST.\nThis is the KEY field for the knowledge graph pipeline:\n  - "full"    → Layer 1 (certainty=1.0): 100% derivable from AST, no human input needed\n  - "partial" → Layer 2 (certainty=0.85-0.95): Structurally derivable but may need human context\n  - "none"    → Layer 3 (certainty=0.6-0.85): Requires human authoring or LLM inference',
  })
);

/**
 * @since 0.0.0
 */
export type ASTDerivability = typeof ASTDerivability.Type;
