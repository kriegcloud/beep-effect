# Docgen TSMorph Quality Gate

## Question

Can repo-local `docgen analyze` output, `@beep/repo-docgen`, `@beep/repo-cli`, and `@beep/repo-utils` TSMorph support a second-stage JSDoc quality review/scoring flow after deterministic findings are clean?

Short answer: yes, but not from the current analyze JSON alone. The existing surfaces are enough to build the flow repo-locally, with `@beep/repo-cli` as the orchestration owner, `@beep/repo-docgen` as the deterministic parser/example-validation source, and `@beep/repo-utils` TSMorph as an enrichment/caching layer. A useful second-stage scorer needs one small data-model extension: carry raw JSDoc/example bodies, and include clean re-export and module-fileoverview subjects if those are in scope.

## Scope

- In scope: current repo evidence under `packages/tooling/tool/docgen`, `packages/tooling/tool/cli/src/commands/Docgen`, `packages/tooling/tool/cli/src/commands/Shared/JSDocCategories.ts`, `packages/tooling/library/repo-utils/src/TSMorph`, and the initiative research contract.
- In scope: whether existing deterministic analysis can become the handoff point for a qualitative review/scoring stage.
- Non-scope: implementation, smoke tests, prototype scripts, local model runs, external model/tool selection, and production-code edits.
- Package identities in this checkout: `@beep/repo-docgen` at `packages/tooling/tool/docgen` (`packages/tooling/tool/docgen/package.json:2`) and `@beep/repo-cli` at `packages/tooling/tool/cli` (`packages/tooling/tool/cli/package.json:2`).

## Repo Evidence

- The initiative is explicitly research-first and not approval to build the scoring/remediation pipeline yet (`initiatives/jsdoc-quality-enforcement/README.md:9`, `initiatives/jsdoc-quality-enforcement/README.md:13`). Reports belong in `research/`, and implementation commitments wait for synthesis and `grill-with-docs` (`initiatives/jsdoc-quality-enforcement/PLAN.md:5`, `initiatives/jsdoc-quality-enforcement/PLAN.md:11`).
- The research template requires the exact sections used here (`initiatives/jsdoc-quality-enforcement/research/README.md:6`, `initiatives/jsdoc-quality-enforcement/research/README.md:11`).
- The spec names the relevant source surfaces, including docgen, repo-cli, and repo-utils TSMorph (`initiatives/jsdoc-quality-enforcement/SPEC.md:27`, `initiatives/jsdoc-quality-enforcement/SPEC.md:35`), and its motivating problem is that required examples can compile while still being low-value (`initiatives/jsdoc-quality-enforcement/SPEC.md:21`).
- The JSDoc standard gives the qualitative target: tags should add information not recoverable from the TypeScript signature (`.patterns/jsdoc-documentation.md:21`), examples must compile (`.patterns/jsdoc-documentation.md:29`), exported symbols require `@example`, `@category`, and `@since` (`.patterns/jsdoc-documentation.md:74`), and conditional tags should appear only when they add semantic value (`.patterns/jsdoc-documentation.md:83`).
- `@beep/repo-docgen` already parses normalized documentation data with description, examples, category, throws, see, since, deprecated, and generic tag maps (`packages/tooling/tool/docgen/src/Domain.ts:96`, `packages/tooling/tool/docgen/src/Domain.ts:116`). Its parser fills those fields from JSDoc (`packages/tooling/tool/docgen/src/Parser.ts:154`) and builds modules from exported interfaces, functions, type aliases, classes, constants, exports, and namespaces (`packages/tooling/tool/docgen/src/Parser.ts:658`).
- `@beep/repo-docgen` is deterministic enforcement/generation infrastructure, not a scoring engine. Its checker enforces description/example/since presence from config (`packages/tooling/tool/docgen/src/Checker.ts:48`, `packages/tooling/tool/docgen/src/Checker.ts:54`, `packages/tooling/tool/docgen/src/Checker.ts:60`) and the core program parses, checks, validates examples, and writes markdown (`packages/tooling/tool/docgen/src/Core.ts:613`, `packages/tooling/tool/docgen/src/Core.ts:623`, `packages/tooling/tool/docgen/src/Core.ts:629`, `packages/tooling/tool/docgen/src/Core.ts:632`).
- `@beep/repo-cli` is already the better owner for the review gate. Its docgen operations define deterministic required tags (`packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:44`), expose analysis models with name, kind, file path, line, present tags, missing tags, category values, category issues, JSDoc presence, context, priority, and declaration source (`packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:213`), and summarize total, fully documented, missing, category, example, and since counts (`packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:239`).
- `docgen analyze` already writes markdown or machine-readable JSON (`packages/tooling/tool/cli/src/commands/Docgen/index.ts:434`, `packages/tooling/tool/cli/src/commands/Docgen/index.ts:459`, `packages/tooling/tool/cli/src/commands/Docgen/index.ts:463`). `docgen check` already gates on deterministic failures by selecting analyses with `summary.missingDocumentation > 0` (`packages/tooling/tool/cli/src/commands/Docgen/index.ts:526`, `packages/tooling/tool/cli/src/commands/Docgen/index.ts:536`).
- The CLI analyzer is docgen-config-aware enough for stage one: it resolves package config, source dir, excludes, required tags, source files, and summaries in `analyzePackageDocumentation` (`packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:1304`, `packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:1310`, `packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:1319`, `packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:1320`).
- Category quality is deterministic today. The canonical category taxonomy is closed (`packages/tooling/tool/cli/src/commands/Shared/JSDocCategories.ts:31`), normalization classifies canonical, alias, rejected, and unknown values (`packages/tooling/tool/cli/src/commands/Shared/JSDocCategories.ts:140`, `packages/tooling/tool/cli/src/commands/Shared/JSDocCategories.ts:311`), and analyze turns rejected/unknown categories into issue messages (`packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:608`).
- The current analyze output is close but incomplete for qualitative scoring. It includes all local direct exported declarations (`packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:957`, `packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:968`) but only includes re-exports when they still have deterministic issues (`packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:819`, `packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:867`). Clean module fileoverview entries are also omitted (`packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:793`).
- The current analyze model also does not carry example bodies as first-class data. It records tag presence and context, not the parsed `@example` text needed to score whether an example is useful (`packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts:213`). `@beep/repo-docgen` has the example bodies in `Domain.Doc.examples` (`packages/tooling/tool/docgen/src/Domain.ts:116`, `packages/tooling/tool/docgen/src/Parser.ts:156`), so the missing data is available in repo code but not exposed in the analyze handoff.
- `@beep/repo-utils` TSMorph has useful second-stage support, especially stable symbol identity and source evidence. Its public index exports the TSMorph model and service (`packages/tooling/library/repo-utils/src/TSMorph/index.ts:1`, `packages/tooling/library/repo-utils/src/TSMorph/index.ts:8`). Its `Symbol` model includes stable id, file path, qualified name, kind, category, signature, docstring, summary, source lines, byte span, and content hash (`packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts:1175`).
- The TSMorph service supports read-only scope, symbol, source, search, diagnostics, and project-inspection operations (`packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:305`). It can read symbol docstrings/signatures/source text and compute content hashes during outline normalization (`packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:508`, `packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:543`, `packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:589`). It also supports custom read-only project inspection over file globs and file paths (`packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:1254`, `packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:1264`, `packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:1296`).
- TSMorph should not be the only subject collector without extension. The current outline collector covers top-level functions/classes/interfaces/type aliases/enums and class members (`packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:624`, `packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:633`, `packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:642`, `packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts:669`), but it does not currently model variable `const` exports, re-exports, or module fileoverviews the same way the docgen analyzer does.

## External Evidence

None used. Repo evidence was sufficient for this feasibility decision, and the task explicitly excluded smoke tests, prototype scripts, and local model runs.

## Options

1. Keep only the deterministic gate.
   - Lowest implementation cost, but it does not address the initiative's motivating problem: low-value examples that still satisfy `@example` and compile.

2. Add a CLI-native second-stage review after `docgen check` is clean.
   - `@beep/repo-cli` continues to own package discovery, `docgen.json` loading, source scanning, deterministic analysis, JSON/report output, and gating. The second stage consumes an enriched analysis subject list and writes a separate quality report/score.

3. Make `@beep/repo-utils` TSMorph the primary scorer substrate.
   - This gives stable symbol ids, hashes, source spans, docstrings, diagnostics, and cacheable symbol evidence, but it needs collector extensions or custom inspection to avoid missing const exports, re-exports, and module fileoverviews.

4. Move qualitative scoring into `@beep/repo-docgen`.
   - This is closest to parsed `Doc` and example bodies, but it mixes generation/example validation with subjective review policy and makes the docgen package responsible for a workflow the CLI already orchestrates.

## Tradeoffs And Risks

- Current analyze JSON is enough for deterministic gating but not enough for meaningful example scoring until it carries parsed example bodies or raw JSDoc.
- Clean re-exports and clean module fileoverviews disappear from current analysis output, so a second stage would silently skip them unless the analyzer emits all review subjects.
- There are already three ts-morph paths: `@beep/repo-docgen` parser, direct ts-morph usage in `@beep/repo-cli` docgen operations, and `@beep/repo-utils` TSMorph. A second-stage design should choose one owner to avoid drift.
- Scoring is partly subjective. It needs report-only adoption first, a visible rubric version, stable evidence anchors, and a way to distinguish deterministic failures from advisory quality findings.
- TSMorph hashes and symbol ids are good for caching, but the current TSMorph outline shape is not docgen-equivalent. Using it as the primary source without extension risks false negatives.
- Adding quality scores to the existing deterministic `DocgenPackageAnalysis` shape could blur gate semantics. A separate `DocgenQualityReview` document keeps deterministic checks clean.

## Recommendation

Use option 2 with selective option 3 enrichment.

Design the future flow as a second-stage `@beep/repo-cli` review command that runs only after deterministic analysis is clean. The first stage should remain `docgen check` or equivalent logic using `summary.missingDocumentation === 0`. The second stage should consume an enriched analysis subject list and emit a separate quality report containing rubric version, subject anchors, score, rationale, and advisory findings.

Before scoring, extend the CLI-side analysis handoff or add a sibling quality-subject model that includes raw/parsed JSDoc, parsed `@example` bodies, description text, symbol signature, declaration source, and content hash. Reuse `@beep/repo-docgen` parsing behavior where it already has `Domain.Doc.examples`; use `@beep/repo-utils` TSMorph for stable symbol/source evidence, cache keys, diagnostics, and read-only project inspection when the CLI analyzer needs more context.

Do not put qualitative scoring inside `@beep/repo-docgen` initially. Keep that package focused on parsing, deterministic checks, example validation, and markdown generation. Also do not promote a hard quality fail immediately; start report-only, then add thresholds after the rubric has been challenged against real packages.

## Open Questions

- Should the second stage score only `@example` usefulness, or the whole JSDoc block against the `.patterns/jsdoc-documentation.md` value rule?
- Are clean re-exports and module fileoverview docs review subjects, or should the first scorer target direct exported declarations only?
- What score shape is useful: numeric score, pass/warn/fail tiers, typed finding codes, or all three?
- Should advisory quality reports live beside package `JSDOC_ANALYSIS.*` files, under initiative/history outputs, or in a central repo report path?
- What minimum evidence should every scored subject carry: raw JSDoc, parsed examples, declaration source, symbol id, content hash, source link, package name, and rubric version?
- When should quality findings become blocking: never, package opt-in, changed-files only, or repo-wide after a report-only burn-in?
