# Dedup Clone Engine Plan

## Phase 1 — Detector + read-only baseline

- Add `structural-clone` to `ReuseCandidateKind`
  (`packages/tooling/library/repo-utils/src/Reuse/Reuse.model.ts`).
- Add a clone-detection capability in
  `packages/tooling/library/repo-utils/src/Reuse/` (new `Reuse.clones.ts`
  service + Live layer, merged into `ReuseServiceSuiteLive`):
  - reuse `discoverWorkspaceScopes`, `collectScopeFiles`,
    `PRODUCTION_FILE_IGNORE_PATTERNS`, and the `getCachedOrCompute` caches;
  - per scope, call `TSMorphService.inspectProject`, take the package's source
    files, and enumerate `getExportedDeclarations()`;
  - normalize each declaration body (strip comments/whitespace, alpha-rename
    identifiers by first appearance, blank literal values) into a stable token
    string used directly as the cluster key (no hashing → fully deterministic);
  - cluster keys with size ≥ floor appearing across ≥2 packages;
  - emit `ReuseCandidate { kind: "structural-clone" }` per cluster.
- Add `beep reuse clones [--scope] [--json]`
  (`packages/tooling/tool/cli/src/commands/Reuse/Reuse.command.ts`), registered
  in `reuseCommand` subcommands and `printReuseIndex`.
- Deliverable: run once for the first real duplication baseline.

## Phase 2 — Baseline + ratchet gate

- Commit `standards/clone.inventory.jsonc` (clusters only; deterministic).
- Add `--check` to `beep reuse clones` using the
  `Lint/SchemaFirst.ts` generate→diff→`failWithReportedExit` idiom, with an
  allowlist escape hatch like `standards/effect-laws.allowlist.jsonc`.
- Wire `repoCliStep("lint:clones", ["reuse", "clones", "--check"])` into
  `rootRepoLintPolicySteps` (`Quality/Tasks.ts`); warn-first → error.

## Phase 3 — ownership split

- **Type-3 near-miss (fuzzy) behind a flag — DONE (report-only).** Implemented in
  `ReuseCloneService.detectNearMissClones` + `beep reuse clones --fuzzy
  [--min-similarity]`. Approach: k-shingle the normalized token sequence
  (`Reuse/TokenSimilarity.ts`: `tokenShingles`/`minhashSignature`/`lshBandKeys`/
  `jaccardSimilarity`), MinHash+LSH to generate candidate pairs, confirm with exact
  Jaccard weighted by token-length ratio (so repetitive literal arrays can't
  masquerade as near-misses), union-find into cross-package clusters, emit
  `kind: "near-miss-clone"` with `confidence` = similarity. Deterministic
  (fixed FNV seeds), perf-capped (LSH + a comparison cap that warns, never
  silently truncates), and **advisory only** — not wired into `lint:clones`/CI,
  `--fuzzy` rejects `--check`/`--write`, so the exact gate stays fast and
  deterministic. Remaining deferred toggle: intra-package near-misses
  (`--include-intra`); currently cross-package only. **Deferred, not dropped** —
  the cross-package restriction is a single post-clustering guard
  (`Reuse.service.ts` `computeNearMissClusters`:
  `if (distinctPackageCount(memberRecords) < 2) continue;`), applied *after* the
  LSH/Jaccard/union-find work already runs over all records. Adding the flag is a
  ~30-min, zero-perf-cost change: thread `includeIntra` through
  `detectNearMissClones` → `computeNearMissClusters`, gate that one line, add the
  CLI flag + a test. Held off because the fuzzy report is advisory-only with no CI
  consumer, and intra-package near-misses (overloads, sibling schema variants,
  local builder permutations) have materially worse signal-to-noise. Build it when
  a concrete intra-package cleanup creates real demand.
- **`importedBy` inbound-edge index → `repo-codegraph`** (its Phase-3 AST
  structural facts: imports / references / call-edges). Not built here — it would
  duplicate that goal.
- **Codemod-assisted extraction → `tooling/tool`** (a `beep reuse extract` CLI).
  `@beep/repo-utils` is detection-only; doctrine routes codemods/automation to
  `tooling`.

## Tests (done)

- Unit (`repo-utils/test/Reuse.clones.test.ts`): `normalizedDeclarationSignature`
  — identical and alpha-renamed+literal-changed copies → same key; structurally
  different → different key; a tiny declaration below the floor.
- Unit (`cli/test/clone-baseline.test.ts`): `buildCloneDocument` +
  `diffCloneBaseline` ratchet — new-cluster, grown-cluster, no-drift, and missing
  baseline. (Exposed `diffCloneBaseline`/`buildCloneDocument` +
  `CloneBaselineEntry`/`CloneBaselineDocument` via `@beep/repo-cli/commands/Reuse`,
  and `normalizedDeclarationSignature` from `@beep/repo-utils`.)
- Integration (`repo-utils/test/Reuse.clones.test.ts`): `detectClones` scoped to
  `drivers/runpod,drivers/sanity` finds a `structural-clone` candidate spanning
  ≥2 packages.

## Status — V1 COMPLETE

All five conditions in `SPEC.md` "Completion Standard (V1)" are met; the goal is
closed.

- **Phases 0–2** shipped and merged (PR #180): exact declaration-anchored
  detector, `beep reuse clones [--scope] [--json]`, committed
  `standards/clone.inventory.jsonc` baseline, `--check` ratchet gate wired as
  `lint:clones` into `rootRepoLintPolicySteps` (and thus the CI Lint lane).
- **Close-out** (PR #183): the tests below plus threshold tuning
  (`CLONE_MIN_TOKENS` 40 → 50, dropping coincidental ≤49-token schema-shape
  clusters; baseline regenerated 32 → 22).
- **Phase 3 — Type-3 fuzzy** shipped and merged (PR #187): report-only
  `detectNearMissClones` + `beep reuse clones --fuzzy [--min-similarity]`
  (MinHash+LSH, exact-Jaccard confirm, token-length-ratio weighted, cross-package).

### Remaining / redirected
- **Owned, deferred:** intra-package near-misses (`--include-intra`) — see the
  Phase 3 note above for the exact change site and rationale. Build on demand.
- **Redirected (not owned here):** inbound `importedBy` edges → `repo-codegraph`
  (its Phase-3 AST facts); codemod-assisted extraction → `tooling/tool`
  (`@beep/repo-utils` is detection-only by doctrine).
