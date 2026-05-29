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

## Phase 3 — Later

- Type-3 near-miss behind a flag.
- `importedBy` inbound-edge index for blast-radius ranking.
- Codemod-assisted extraction via `TSMorphService.updateSourceFile`.

## Tests (follow-up)

Needs a small testability seam first: the detector is repo-root-anchored and the
gate internals (`internal/CloneBaseline.ts`) are unexported, while repo
convention tests via `@beep/*` aliases. Plan:

- Expose `diffCloneBaseline` / `buildCloneDocument` (pure) for a ratchet-logic
  unit test (new-cluster and grown-cluster transitions) from plain data.
- Add a scope/root-injectable detection path so a tiny fixture workspace (two
  packages sharing an identical-after-rename declaration; a near-but-distinct
  one; a sub-threshold one) can be tested without scanning the whole repo.

## Current Slice

- Phase 0 (goal packet), Phase 1 (detector + `beep reuse clones`), and Phase 2
  (baseline + `--check` + `lint:clones` gate) are DONE and verified:
  - `@beep/repo-utils` + `@beep/repo-cli` `check` green;
  - full `bun run lint` green with `lint:clones` reporting `new_clusters=0`;
  - red path proven (a clone absent from the baseline fails `--check`, exit 1);
  - `standards/clone.inventory.jsonc` committed with 32 baseline clusters.
- Remaining: Tests (above); optional threshold tuning (some small-schema
  clusters are coincidental structural matches).
