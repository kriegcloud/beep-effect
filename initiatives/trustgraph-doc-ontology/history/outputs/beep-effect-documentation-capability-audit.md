# Documentation Rule Capability Audit

Generated: 2026-04-05T03:14:49.850Z

| Rule | Classification | Current support surface | Evidence |
| --- | --- | --- | --- |
| Require one @param line per declared parameter | possible with glue | external rule engine | .patterns/jsdoc-documentation.md<br/>tooling/repo-utils/src/JSDoc/ |
| Require @returns for documented functions and methods | possible with glue | external rule engine | .patterns/jsdoc-documentation.md<br/>tooling/repo-utils/src/JSDoc/ |
| Only use @throws when a function can actually throw | possible with glue | external rule engine | .patterns/jsdoc-documentation.md<br/>tooling/repo-utils/src/JSDoc/ |
| Do not use @throws for Effect error channels | possible with glue | external rule engine | .patterns/jsdoc-documentation.md |
| Require @example on documented public entries | supported now | docgen checker, docgen analysis | tooling/docgen/src/Checker.ts<br/>tooling/cli/src/commands/Docgen/internal/Operations.ts |
| Examples must compile via bun run docgen | supported now | docgen CLI | .patterns/jsdoc-documentation.md |
| Require @since on public exports | supported now | docgen checker, docgen analysis | tooling/docgen/src/Checker.ts<br/>tooling/cli/src/commands/Docgen/internal/Operations.ts |
| Require @category on public exports | supported now | docgen analysis | tooling/cli/src/commands/Docgen/internal/Operations.ts<br/>.patterns/jsdoc-documentation.md |
| Require description text on documented entries | supported now | docgen checker | tooling/docgen/src/Checker.ts |

## Classification Notes

- `supported now` means the repo already has direct runtime or analysis checks for the rule.
- `possible with glue` means the ontology can model the rule today, but enforcement needs an external validator or semantic rule engine.
- `not realistically supported today` is reserved for semantics that do not fit the current ontology feature without disproportionate custom work.
