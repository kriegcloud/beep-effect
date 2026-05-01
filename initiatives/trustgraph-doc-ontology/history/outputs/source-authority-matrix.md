# Source Authority Matrix

Generated: 2026-04-27T06:50:15.813Z

| Source authority | Role | Authoritative for | Not authoritative for | Evidence path |
| --- | --- | --- | --- | --- |
| Typed JSDoc models | Structural source | tag catalog, standards, AST applicability, derivability, parameter shape metadata | repo policy semantics and runtime enforcement | `tooling/repo-utils/src/JSDoc/` |
| Repo JSDoc policy pattern | Normative policy source | documentation requirements, prohibitions, Effect-specific guidance, example compilation expectations | raw mechanical tag inventory | `.patterns/jsdoc-documentation.md` |
| Docgen checker | Current runtime validator | missing description, example presence, missing @since | semantic rules like Effect @throws prohibition | `tooling/docgen/src/Checker.ts` |
| Docgen analysis operations | Current report/enforcement surface | required public-export tags such as @category, @example, @since | semantic interpretation of function contracts | `tooling/cli/src/commands/Docgen/internal/Operations.ts` |
| Docgen domain models | Artifact vocabulary source | docgen entities, doc records, module/fileoverview surfaces | policy semantics and rule precedence | `tooling/docgen/src/Domain.ts` |
| Repo utils symbol model | Retrieval bridge source | deterministic TypeScript symbol kinds for retrieval and grounding | documentation-specific rule semantics | `tooling/repo-utils/src/TSMorph/TSMorph.model.ts` |

The seed layer uses split authority intentionally: structural tag facts come from the typed JSDoc models, normative rules come from the repo policy document, and current enforcement claims only come from the existing docgen toolchain.
