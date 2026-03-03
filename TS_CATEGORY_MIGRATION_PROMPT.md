# TS Category Migration Prompt

You are Codex working in `/home/elpresidank/YeeBois/projects/beep-effect3`.

Goal:
Migrate every non-canonical `@category` tag in first-party repo content to the canonical TS taxonomy.

Source of truth:
`tooling/repo-utils/src/JSDoc/models/TSCategory.model.ts`

Canonical categories (exact spellings only):

- DomainModel
- DomainLogic
- PortContract
- Validation
- Utility
- UseCase
- Presentation
- DataAccess
- Integration
- Configuration
- CrossCutting
- Uncategorized

Constraints:

1. Follow `AGENTS.md` and CODEBASE LAWS.
2. Only change first-party content (including `.patterns/**`, `.claude/**`, `specs/**`, `packages/**`, `tooling/**`, and other repo-owned files).
3. Do not edit mirrored/vendor/generated trees: `.repos/**`, `node_modules/**`, `dist/**`, build artifacts.
4. Make precise edits only to `@category` tags (no broad replace that touches unrelated prose/code).
5. If mapping is ambiguous, use `Uncategorized` and report it.
6. No behavior changes; this is a taxonomy/doc-tag migration.

Suggested mapping heuristics:

- constructors/types/models/value objects -> DomainModel
- guards/refinements/parsers/schemas -> Validation
- pure business transforms/rules/equivalence/order logic -> DomainLogic
- service interfaces/contracts -> PortContract
- wiring/layers/config/constants/env setup -> Configuration
- commands/workflows/handlers/orchestration -> UseCase
- UI/routes/controllers -> Presentation
- db/fs/persistence adapters -> DataAccess
- external API/SDK adapters -> Integration
- shared concerns (errors/logging/auth/metrics) -> CrossCutting
- generic helpers -> Utility

Process:

1. Discover repo laws first:

   - `bun run beep docs laws`
   - `bun run beep docs skills`
   - `bun run beep docs policies`

2. Scan for `@category` usage and identify invalid values in first-party scope.
3. Patch files with targeted edits.
4. Re-scan until no invalid values remain.

Required verification:

1. Invalid-category check (first-party scope):
   `rg -n -uu -P '^\s*\*?\s*@category\s+(?!DomainModel\b|DomainLogic\b|PortContract\b|Validation\b|Utility\b|UseCase\b|Presentation\b|DataAccess\b|Integration\b|Configuration\b|CrossCutting\b|Uncategorized\b).*' .patterns .claude specs packages tooling`
   Expect: no matches.

2. Legacy-token check in key guidance surfaces:
   `rg -n -uu --glob '.patterns/**/*.md' --glob '.claude/**/*.md' --glob 'specs/**/*.md' '@category\s+(constructors|Constructors|combinators|Combinators|schemas|Schemas|services|Services|layers|Layers|errors|Errors|types|constants|commands|getters|guards|refinements|symbols|models|FileSystem|IO|Package Management|kg-publish|category_name|\[CategoryName\]|<category>)' .`
   Expect: no matches.

3. If any `.ts`/`.tsx` files were touched:

   - `bun run docgen`

4. If any agent instruction surfaces were touched:

   - `bun run agents:pathless:check`

Additional execution requirements:

1. Build an inventory before edits:

   - `rg -n -uu -P '^\s*\*?\s*@category\s+([A-Za-z][A-Za-z0-9]*)' .patterns .claude specs packages tooling`
   - Also produce unique values list:
     `rg -o -uu -P '@category\s+\K([A-Za-z][A-Za-z0-9]*)' .patterns .claude specs packages tooling | sort -u`

2. Edit strategy:

   - Prefer targeted file edits.
   - Re-check after each batch:
     `rg -n -uu -P '^\s*\*?\s*@category\s+(?!DomainModel\b|DomainLogic\b|PortContract\b|Validation\b|Utility\b|UseCase\b|Presentation\b|DataAccess\b|Integration\b|Configuration\b|CrossCutting\b|Uncategorized\b).*' .patterns .claude specs packages tooling`
   - Stop only when this returns zero matches.

3. Safety boundaries:

   - Never run replacements across `.`.
   - Never include `.repos`, `node_modules`, `dist`, `.turbo`, `coverage`, `build`, `tmp` in mutation commands.

4. Final report must include:

   - `Changed files:` one path per line.
   - `Category mappings performed:` old -> new with count.
   - `Ambiguous -> Uncategorized:` with one-line rationale each.
   - `Verification:` paste command + result summary (`0 matches` / failure details).

Output format:

- Summary of changes.
- Exact list of changed files.
- Ambiguous mappings and rationale (if any).
- Verification commands run + results.
