# Source Context

This packet graduated from
[`explorations/effect-capability-kg`](../../../explorations/effect-capability-kg/README.md).
Use links back to the exploration instead of copying the whole exploration into
the goal packet.

## Required Exploration Reads

- [`BRIEF.md`](../../../explorations/effect-capability-kg/BRIEF.md) - shaped
  problem, appetite, solution sketch, rabbit holes, and no-gos.
- [`MAP.md`](../../../explorations/effect-capability-kg/MAP.md) - candidate
  goals, sequencing, first vertical slice, and capability check.
- [`DECISIONS.md`](../../../explorations/effect-capability-kg/DECISIONS.md) -
  locked alignment decisions.
- [`RESEARCH.md`](../../../explorations/effect-capability-kg/RESEARCH.md) -
  cited external landscape and repo capability inventory.

## Seed Source Corpus

- `.repos/effect-v4/packages/effect/src/Combiner.ts`
- `.repos/effect-v4/packages/effect/src/Reducer.ts`
- `.repos/effect-v4/packages/effect/src/Filter.ts`
- Adjacent modules named by source/docs: `Option`, `Struct`, `Array`,
  `Record`, `Number`, `String`, and `Boolean`.

## Repo Capabilities To Reuse First

- `@beep/repo-utils` / `TSMorphService` for scoped ts-morph extraction and
  deterministic JSDoc derivation.
- `@beep/repo-codegraph` and `standards/repo-exports.catalog.{md,jsonc}` for
  public export visibility and boundary advice.
- `packages/tooling/library/repo-utils/src/schemas/JSDocCategories.ts` for
  local category normalization.
- `standards/architecture/07-non-slice-families.md` for `tooling` ownership.
- `standards/memory-architecture/01-memory-layer-taxonomy.md` for the
  deterministic-authority rule.

## Deferred Surfaces

- Runtime Codex/Claude hooks.
- Embeddings or vector indexes.
- Durable graph database choice.
- Full Effect v4 ingestion.
- Hard quality enforcement.
