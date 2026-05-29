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

- **Type-3 near-miss (fuzzy) behind a flag** — stays in this goal
  (`ReuseCloneService`), deferred. Opt-in `--fuzzy`, perf-capped, so the default
  gate stays fast and deterministic.
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

## Current Slice

- Phases 0–2 shipped and merged (PR #180). Close-out branch
  `feat/dedup-clone-engine-closeout` adds: the tests above and threshold tuning
  (`CLONE_MIN_TOKENS` 40 → 50, dropping coincidental ≤49-token schema-shape
  clusters; baseline regenerated 32 → 22).
- Remaining in this goal: Type-3 fuzzy matching (deferred). Redirected to other
  goals: inbound-edges → `repo-codegraph`; codemod extraction → `tooling/tool`.
