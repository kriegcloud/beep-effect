# Effect Capability KG Seed

## Status

Lifecycle: `completed-retained`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Prove the first deterministic Effect capability intelligence loop for
`Combiner`, `Reducer`, `Filter`, and adjacent Effect v4 helpers. The seed proof
must turn upstream AST/JSDoc/source-span facts into an evidence-cited graph or
report plus tiny advisory fixtures, without hooks, embeddings, storage choices,
or enforcement gates.

Graduated from
[`explorations/effect-capability-kg`](../../explorations/effect-capability-kg/README.md).

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/effect-capability-kg-seed/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - supporting research, if present.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

Completed on 2026-06-15. The seed proof lives in
`packages/tooling/library/repo-utils/src/EffectCapabilityKG.ts` with integration
coverage in
`packages/tooling/library/repo-utils/test/EffectCapabilityKG.test.ts`.

## Latest Evidence

- `buildEffectCapabilitySeedReport` extracts 10 Effect v4 modules:
  `Combiner` (9 symbols), `Reducer` (3), `Filter` (29), `Option` (65),
  `Struct` (23), `Array` (135), `Record` (43), `Number` (30), `String` (63),
  and `Boolean` (17).
- Seed report snapshot: 4,245 graph edges, 417 `defines` edges, 425 repo export
  catalog visibility facts, and four advisory findings: three suggestions
  (`Combiner`, `Reducer`, `Filter`) plus one decline/no-match.
- `bunx turbo run check --filter=@beep/repo-utils` passed.
- `bunx turbo run test --filter=@beep/repo-utils` passed: 17 files, 184 tests.
- `bun run --cwd packages/tooling/library/repo-utils lint` passed.
- `bun run --cwd packages/tooling/library/repo-utils docgen` passed: 65 modules,
  609 examples typechecked.
- `bun run --cwd packages/tooling/library/repo-utils repo-exports:shard` passed,
  then `bun run beep quality repo-exports-catalog --from-shards` refreshed the
  aggregate.
- `bun run repo-exports:catalog:check` passed: 82 package shards current and the
  root aggregate current.
- `bun run beep lint reflection-artifacts` passed:
  `blocking_findings=0`, `advisory_findings=0`.
- `bunx turbo run lint --filter=@beep/repo-utils` is blocked outside this
  packet by pre-existing formatter drift in
  `packages/foundation/modeling/identity/src/packages.ts` (`scratchpad`
  indentation and missing trailing newline near `$ScratchpadId`). The touched
  package's direct lint command is green.

## Notes

- The source exploration remains active for later candidate goals:
  `effect-capability-specialist-router`, `effect-capability-advisory-cli`,
  `effect-capability-hook-adapters`, and `effect-capability-quality-ratchet`.
- This packet owns only the first seed proof. Runtime hooks and hard
  enforcement are intentionally out of scope.
- Closeout reflection:
  [`history/reflections/2026-06-15-codex.md`](./history/reflections/2026-06-15-codex.md).
