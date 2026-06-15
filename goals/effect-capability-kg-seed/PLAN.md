# Effect Capability KG Seed Plan

## Status

Status: `complete`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Confirm implementation home, inspect existing tooling APIs, and record exact package verification commands. | Source inventory, package choice, and verification lane are recorded in this plan or `research/`. |
| P1 Implement | complete | Build the smallest deterministic seed extraction and advisory fixture proof that satisfies `SPEC.md`. | Seed graph/report, fixture findings, and tests satisfy acceptance. |
| P2 Verify | complete | Run packet checks plus package-specific checks and capture evidence. | Verification is green or blockers are documented with commands and paths. |
| P3 Close | complete | Update packet evidence/status, write reflection, and prepare handoff/publish if requested. | Packet status and evidence are updated; a closeout reflection exists. |

## P3 Closeout Checklist

Before marking the packet closed (and `status` → `completed-retained` / `complete`):

1. Write a closeout reflection via the `/reflect` skill (or copy
   `_template/history/reflections/_TEMPLATE.md`) to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique the repo **tooling**
   (what worked, what didn't, what was frustrating, what you wished existed), the
   **implementation** (improvement opportunities), and the **goal/prompt** (would
   you revise it to be clearer/easier/more efficient?). Capture TODOs worth
   codifying. Its YAML frontmatter must validate against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (this packet has
   `reflectionRequired: true`, so a missing/invalid reflection blocks closeout).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.
- Keep this plan current; archive old run outputs under `history/`.
- Do not install hooks, choose graph/vector storage, or implement hard
  enforcement in this packet.
- During P0, prefer reuse of `@beep/repo-utils` and `@beep/repo-codegraph`
  before introducing a new package.

## P0 Research Result

- Implementation home: `packages/tooling/library/repo-utils`.
- Rationale: this package already owns `TSMorphService`, JSDoc extraction
  helpers, filesystem/path services, and canonical JSDoc category
  normalization. Keeping the seed here avoids a new package and avoids adding a
  `ts-morph` dependency to `@beep/repo-codegraph`.
- Repo export visibility source: read
  `standards/repo-exports.catalog.{md,jsonc}` as deterministic catalog input.
  No export catalog refresh is planned unless this packet adds or changes
  package public exports.
- Package verification lane:
  - `bunx turbo run check --filter=@beep/repo-utils`
  - `bunx turbo run test --filter=@beep/repo-utils`
  - `bunx turbo run lint --filter=@beep/repo-utils`

## Closeout Evidence

- Implementation:
  `packages/tooling/library/repo-utils/src/EffectCapabilityKG.ts`.
- Tests:
  `packages/tooling/library/repo-utils/test/EffectCapabilityKG.test.ts`.
- Deterministic report invariants: the expected 10 Effect v4 modules are
  extracted, every extracted symbol has a module-to-symbol `defines` edge,
  adjacent module catalog visibility is populated from repo export shards, and
  advisory fixtures produce three suggestions plus one decline/no-match finding.
- `bunx turbo run check --filter=@beep/repo-utils` passed.
- `bunx turbo run test --filter=@beep/repo-utils` passed: 17 files, 184 tests.
- `bun run --cwd packages/tooling/library/repo-utils lint` passed.
- `bun run --cwd packages/tooling/library/repo-utils docgen` passed.
- `bun run repo-exports:catalog:check` passed after refreshing the
  `@beep/repo-utils` package shard and root aggregate from shards.
- `bun run beep lint reflection-artifacts` passed.
- `bunx turbo run lint --filter=@beep/repo-utils` remains blocked by unrelated
  formatter drift in `packages/foundation/modeling/identity/src/packages.ts`.
  The touched package's direct lint command is green.

## Verification Commands

```sh
test "$(wc -m < goals/effect-capability-kg-seed/GOAL.md)" -le 4000
jq . goals/effect-capability-kg-seed/ops/manifest.json
rg -n "effect-capability-kg-seed|GOAL.md|agentLaunchers|packetAnchorDocument" goals/effect-capability-kg-seed
git diff --check -- goals/effect-capability-kg-seed
bunx turbo run check --filter=@beep/repo-utils
bunx turbo run test --filter=@beep/repo-utils
bunx turbo run lint --filter=@beep/repo-utils
bun run --cwd packages/tooling/library/repo-utils lint
bun run --cwd packages/tooling/library/repo-utils docgen
bun run repo-exports:catalog:check
bun run beep lint reflection-artifacts
```
