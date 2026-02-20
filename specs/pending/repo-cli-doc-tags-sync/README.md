# Repo CLI Doc Tag Sync (`@module` + `@since`)

## Status
ACTIVE

## Owner
@elpresidank

## Created
2026-02-20

## Purpose
Create a new `@beep/repo-cli` command that standardizes file-level `@module` tags and synchronizes `@since` tags based on package version + git diff changes.

## Why This Spec Exists
Current source files commonly use bare `@module` tags (no value), for example:
- `tooling/repo-utils/src/DependencyIndex.ts`
- `tooling/cli/src/commands/root.ts`

That weakens deterministic module identity for search/indexing and pushes cognitive load onto humans/agents. We also want a repeatable way to keep `@since` values aligned with the owning package version when symbols actually change.

## Primary Goal
Add one command in `@beep/repo-cli` that can:
1. Fill/repair file-level `@module` values using package name + module-relative path.
2. Sync `@since` tags to `package.json` version for changed symbols only (based on git diff).
3. Run in `--check` mode for CI/lint enforcement and `--write` mode for autofix.

## Scope
### In Scope
- New command wiring in `tooling/cli/src/commands/` + registration in root command tree
- AST-based traversal (ts-morph) for exported declarations and file-level docs
- Git diff line-range detection for selective `@since` updates
- Dry-run/check/write modes
- Tests covering module derivation, since-sync behavior, and idempotency
- Script integration for local lint/quality workflow

### Out of Scope
- Rewriting prose descriptions
- Introducing version bump automation
- Mutating files outside configured workspace package `src/**/*.ts`
- Enforcing style on non-TypeScript files

## Target Command Contract (initial proposal)
Command name can be finalized during design, but default proposal is:
- `beep doc-tags-sync`

Flags to evaluate and finalize:
- `--package <name|path>`: target one package; default all workspace packages
- `--check`: no writes, fail non-zero on drift
- `--write`: apply fixes
- `--dry-run`: report planned edits
- `--base-ref <gitRef>`: baseline for diff calculation (default `HEAD`)
- `--staged`: use staged diff (`--cached`) instead of working tree
- `--all`: ignore diff and sync all eligible symbols/files

## `@module` Contract
Canonical module value:
- `<package-name>/<module-path-from-src-without-ext>`

Normalization rules:
1. Start from absolute file path under `<packageDir>/src`.
2. Convert to POSIX separators.
3. Remove `src/` prefix and extension (`.ts` / `.tsx`).
4. Collapse trailing `/index` to parent module path.
5. Prefix with package name from that package's `package.json`.

Examples:
- `tooling/repo-utils/src/DependencyIndex.ts` -> `@beep/repo-utils/DependencyIndex`
- `tooling/repo-utils/src/schemas/PackageJson.ts` -> `@beep/repo-utils/schemas/PackageJson`
- `tooling/repo-utils/src/index.ts` -> `@beep/repo-utils`
- `tooling/cli/src/commands/create-package/index.ts` -> `@beep/repo-cli/commands/create-package`

## `@since` Contract
For each changed exported symbol:
1. Resolve owning package version from `<packageDir>/package.json`.
2. Use git diff hunks to detect changed line ranges per file.
3. If symbol span intersects changed lines, set/add `@since <package-version>` on that symbol JSDoc.
4. If symbol is unchanged, preserve existing `@since`.
5. If symbol has no JSDoc, create minimal compliant JSDoc block only when required by existing lint rules.

File-level `@since` handling:
- Keep file-level `@since` present.
- In diff mode, update file-level `@since` only when file header/module block was changed or added.

## Required Research Inputs (Phase 0)
Downstream Codex must complete this research before coding:
1. Compare naming/layout patterns across:
   - `.repos/effect-smol/packages/*/src`
   - `.repos/beep-effect/tooling/cli/src/commands/*`
   - current repo `tooling/*/src`
2. Validate `@effect/docgen` behavior with valued `@module` tags.
3. Confirm how current extractor consumes module docs:
   - `tooling/codebase-search/src/extractor/JsDocExtractor.ts`
4. Confirm existing lint/verification hooks:
   - `eslint.config.mjs`
   - `lefthook.yml`
   - root `package.json` scripts
5. Identify edge cases:
   - files with `@packageDocumentation`
   - nested `index.ts`
   - files without exported declarations
   - internal/test files excluded from sync

## Execution Plan For Another Codex Instance

### Phase 0: Research
Deliverable: `specs/pending/repo-cli-doc-tags-sync/outputs/research.md`

Must include:
- Proposed canonical module naming policy (and why)
- Diff strategy tradeoffs (`working tree` vs `staged` vs `base..head`)
- Known parser/update pitfalls with ts-morph JSDoc editing
- Compatibility notes with effect-smol conventions

### Phase 1: Design
Deliverable: `specs/pending/repo-cli-doc-tags-sync/outputs/design.md`

Must include:
- Command UX (final command name + flags)
- Internal architecture (services, pure helpers, mutation boundaries)
- Data model for changed line ranges and symbol mapping
- Error model and logging behavior
- Check-mode exit code semantics

### Phase 2: Implementation Plan
Deliverable: `specs/pending/repo-cli-doc-tags-sync/outputs/implementation-plan.md`

Must include:
- Exact file touch list
- Step-by-step build order
- Risky steps and rollback strategy
- Test matrix mapped to behaviors

### Phase 3: Implement
Expected code areas:
- `tooling/cli/src/commands/<new-command>.ts`
- `tooling/cli/src/commands/root.ts`
- `tooling/cli/src/index.ts`
- optional helper modules under `tooling/cli/src/commands/<new-command>/`
- package scripts if needed for check/fix ergonomics

Implementation requirements:
- Use Effect v4 idioms (`Effect.fn`, tagged errors, service layers)
- Use ts-morph for AST traversal and symbol span mapping
- Use git diff (via child process) for changed line detection
- Preserve formatting as much as possible and keep writes idempotent

### Phase 4: Test
Expected tests:
- `tooling/cli/test/<new-command>.test.ts`

Minimum test coverage:
1. Fills missing/empty `@module` values correctly.
2. Handles `index.ts` and nested index normalization.
3. Updates `@since` only for changed symbols in diff mode.
4. Preserves unchanged symbol `@since` values.
5. `--check` returns failing exit when drift exists.
6. `--dry-run` reports edits without writes.
7. Re-running after write is idempotent (no additional edits).
8. Package filtering only mutates selected package.

## Verification Commands
```bash
bun run build
bun run check
bun run test
bun run lint:jsdoc
bun run lint
```

If command-specific scripts are added, include:
```bash
bun run beep doc-tags-sync --check
bun run beep doc-tags-sync --write
```

## Success Criteria
- [ ] New command is registered and discoverable in root CLI
- [ ] `@module` tags become deterministic and path-derived
- [ ] `@since` sync respects git diff boundaries
- [ ] Check mode is CI-friendly (non-zero on drift)
- [ ] Tests cover edge cases and pass locally
- [ ] Lint/docgen pipeline remains green
- [ ] Command is idempotent on clean tree

## Open Questions (to resolve in Phase 0/1)
1. Should files using `@packageDocumentation` be converted, preserved, or dual-tagged?
2. Should `@since` update when only non-exported/private code changes in a file?
3. Should default diff baseline be `HEAD`, `origin/main`, or configurable only?
4. Should module sync include non-`src` entrypoints (for example hook entry files outside package src)?

## Exit Condition
This spec is complete when a follow-up Codex instance can execute Phases 0-4 end-to-end and land a stable `doc-tags-sync` command with passing tests and quality checks.
