# Dedup Clone Engine Specification

## Status

**Complete (V1)** — all "Completion Standard (V1)" conditions met; shipped across
PRs #180 (detector + gate), #183 (tests + tuning), #187 (Type-3 fuzzy). See
`PLAN.md` "Status — V1 COMPLETE".

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-29
- **Updated:** 2026-05-29 (V1 closed out)

## Mission

Detect, baseline, and enforce **declaration-level code duplication** so the repo
can drive copy-paste down and keep it down. Every answer must be grounded in
deterministic ts-morph facts (source path + line) — no heuristics that cannot
cite the duplicated declarations.

## Source Of Truth

- Workspace package topology and per-package `tsconfig.json` (via
  `discoverWorkspaceScopes` / `TSMorphService`).
- Exported declarations and their normalized AST bodies, extracted with
  `TSMorphService.inspectProject` over production source files
  (`PRODUCTION_FILE_IGNORE_PATTERNS` excludes tests/stories/dist/`.d.ts`).
- The committed `standards/clone.inventory.jsonc` baseline is the drift
  reference for the gate.

## Definitions

- **Normalized body** — a declaration's token stream with comments/whitespace
  removed, identifiers alpha-renamed by first-appearance order, and literal
  values blanked. Two declarations are clones iff their normalized bodies are
  identical (Type-1/Type-2).
- **Clone cluster** — a set of ≥2 declarations sharing a normalized body, above
  a configurable minimum size, spanning ≥2 packages (cross-package first slice).

## Non-Goals

- No Type-3 (near-miss/fuzzy) matching in V1 — keeps the gate deterministic.
- No automated refactor execution in V1.
- Do not block on intra-package-only clones in V1 (report later).
- Do not depend on external services for detection or its tests.

## Phase 1 Contract (detector + baseline)

- A `structural-clone` member added to `ReuseCandidateKind`.
- A clone-detection capability in `@beep/repo-utils/Reuse` that:
  - reuses workspace-scope discovery, file globbing, ignore patterns, caching;
  - emits one `ReuseCandidate` per cross-package cluster with `sourceSymbols`,
    `sourceScopes`, `file:line` evidence, a recommended consolidation action,
    a heuristic destination, and a size-derived confidence;
  - is deterministic (no timestamps or randomness in the cluster key).
- `beep reuse clones [--scope <sel>] [--json]` surfaces clusters via
  `ReuseInventoryService` output shape.
- Running it once produces the first real repo duplication baseline.

## Phase 2 Contract (enforcement)

- `standards/clone.inventory.jsonc` committed via generate→diff→fail-on-drift
  (mirroring `Lint/SchemaFirst.ts`, comparing candidates only — `generatedAt`
  excluded).
- `beep reuse clones --check` exits non-zero on clusters not present in the
  baseline, with an allowlist escape hatch modeled on
  `standards/effect-laws.allowlist.jsonc`.
- One `repoCliStep("lint:clones", ["reuse", "clones", "--check"])` added to
  `rootRepoLintPolicySteps`; warn-first, then graduated to error.

## Phase 3 Contract (later)

- **Type-3 near-miss behind an explicit flag — DONE (PR #187).** `beep reuse
  clones --fuzzy [--min-similarity]` → report-only `detectNearMissClones`
  (MinHash+LSH, exact-Jaccard confirm, token-length-ratio weighted, cross-package),
  `kind: "near-miss-clone"`. Not wired into the gate; `--fuzzy` rejects
  `--check`/`--write`. Deferred toggle: intra-package (`--include-intra`).
- `importedBy` inbound edges for blast-radius ranking. **Redirected → `repo-codegraph`**
  (its Phase-3 AST facts; building here would re-duplicate that goal).
- Optional codemod-assisted extraction via `TSMorphService.updateSourceFile`.
  **Redirected → `tooling/tool`** (`@beep/repo-utils` is detection-only by doctrine).

## Completion Standard (V1)

V1 is done only when all are true:

- `beep reuse clones --json` reports cross-package clone clusters with citations.
- `standards/clone.inventory.jsonc` is committed and `--check` is green against it.
- Introducing a new cross-package duplicate declaration makes `--check` fail; an
  allowlist entry makes it pass.
- `lint:clones` participates in `bun run lint` (and thus the CI Lint lane).
- The engine's own source passes the existing lint-policy laws and schema-first
  checks.

## Verification

- `bunx turbo run check test --filter=@beep/repo-utils --filter=@beep/repo-cli`
- `bun run beep reuse clones --json`
- `bun run beep reuse clones --check`
- `bun run lint` (exercises `lint:clones`)
