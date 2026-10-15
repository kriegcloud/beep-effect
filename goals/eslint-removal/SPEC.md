# Remove ESLint from the repository

## Objective

Remove the obsolete ESLint installation after lanes A #1753 and B #1791,
retaining law enforcement and documentation/deprecated-API coverage on oxlint.

## Non-Goals

Compiler changes, rule redesign, historical packet rewriting, git publication,
private-workspace changesets, or post-merge lifecycle completion in this lane.

## Source Hierarchy

User lane envelope, AGENTS.md, governing standards, this SPEC, PLAN, GOAL.

## Target Surfaces

Root dependency catalog/devDependencies/lockfile, repo-configs source and tests,
CLI law consumers/lint inputs/cache pilot and tests, Turbo/Biome/Fallow configuration,
current toolchain/cache docs, dated memory decision note and RSC opportunity note.

## Constraints

- No git staging, commits, pushes, gh, or Yeet commands; orchestrator owns publication.
- Heavy local verification uses beep-heavy with the user-manager environment.
- Preserve Effect 4.0.4, tsc-rs 0.6.0, and effect-tsgo 0.51.1 roles.
- Generated artifacts change only through their owning command when required.
- Packet remains active pending orchestrator merge and closeout.

## Acceptance Criteria

- [x] Verify local origin/main lint workers execute oxlint before removal.
- [x] Delete ESLint config, docs export/rule, parser/plugins and orphan rule helpers.
- [x] Retain law data/runtime under laws/ and internal/laws/, updating consumers and inputs.
- [x] Remove obsolete ESLint environment and active config/test consumers.
- [x] Required package/root verification run; caused failures fixed, remaining failures independently attributed.
- [ ] Orchestrator reviews, publishes and closes the packet after merge.

## Verification Matrix

Four full package-verifies: @beep/repo-configs, @beep/repo-cli, @beep/lint-rules,
@beep/shared-domain. Build dependency dists first. Root docs, deprecated APIs --full,
laws, check; sherif, config sync, package scripts, policy fingerprint, cache audit,
effect-vitest, schema-first, fallow dead-code/audit, observability catalog,
retired-effect-paths, changeset graph. Exact command results live in the B2 lane report.

## Decision Log

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-15 | Proceed at b2c9ac9817 (local origin/main), after confirming both workers invoke oxlint. | No runEslintWorker remains; docs #1791 and deprecated-API #1753 migrations landed. | Restore deleted ESLint files/dependencies from the parent revision if either lane is reverted. |
| 2026-10-15 | Delete DocsESLintConfig, RequireCategoryTagRule, root config and their config-only tests/exports. | Existing lint-rules/test/docs.test.ts covers category, TSDoc syntax, params and returns; removed tests assert an unused config implementation. | Restore files and exports together from the parent revision. |
| 2026-10-15 | Delete RuleHelpers and RuleAstSchemas rather than move them. | Their sole production consumer is the removed category rule; import-kind tests only exercise that obsolete helper. | Restore both helpers and tests with the category rule. |
| 2026-10-15 | Move law runtime/hotspots/Shared to laws/ and schemas/codegen/snapshot to internal/laws/. | Preserve public/internal separation and behavior without an ESLint namespace. | Reverse directory moves, importer strings, export maps and declared inputs together. |
| 2026-10-15 | Remove eslint, both plugins, @typescript-eslint/parser and repo-configs @types/estree. | All direct consumers are deleted; other packages retain their own ESTree needs. | Restore manifest entries and run bun install. |
| 2026-10-15 | Replace ESLint profile cache canaries with VITE_COSMOS_SPIKE and update fixtures to current oxlint config. | Preserve generic declared-environment hash coverage with a real retained global env; removal alone violated signed-pilot control cardinality. | Restore canaries only when a real task again consumes that variable. |
| 2026-10-15 | Regenerate config aliases, policy fingerprint and reviewed cache baseline. | Explicit laws export map and input moves affect generated aliases and cache declarations. No qualification widened. | Restore previous maps/inputs and re-run owners with a reviewed baseline request. |
| 2026-10-15 | Keep historical packets untouched except the requested RSC dated note. | Historical evidence remains valid for its recorded revision. | Remove only the new dated notes. |

| 2026-10-15 | Retain transitive @eslint/core and typescript-estree support packages. | @shadcn/lint depends on core; detective-typescript uses typescript-estree. They are required by retained non-ESLint tools, not executable ESLint lanes. | Remove only when those parent tools replace their dependencies. |

## Stop Conditions

Stop with a report if a lint lane still executes ESLint, spend is needed, or a
verified blocker prevents further progress. Verification failures are attributed
before repair. The orchestrator owns any broader inherited fixes.
