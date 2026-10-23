# LiteralKit subset algebra and match family

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Give `LiteralKit` a subset algebra that stays inside the kit (`pick` and `omit`
return kits), rename `$match` to `match` and add `matchOrElse`, fix the
construction and dispatch defects a three-model review panel verified, and
amend the census doctrine that let the subset facets retire. The decisions come
from a `/grill-with-docs` session on 2026-10-22
([`research/2026-10-22-grill-rulings.md`](./research/2026-10-22-grill-rulings.md)).

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/literal-kit-subset-algebra/GOAL.md
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

P2 Verify — implementation and codemod migration done; package verification
and the upstream issues are next.

## Latest Evidence

- Codemod `literal-kit-match-rename`: 323 `$match` reads and 24 re-wraps in 218
  files, zero residue; labs apps and chalk statics migrated by hand.
- `bunx turbo run check --filter="...@beep/schema"`: 306 of 306 tasks pass.
- `@beep/schema` tests: 498 of 498.
- Single-checker instantiations, merge-base `39868bbebd` against the lane, same
  compiler (`7.0.2+effect-tsgo.0.55.0`): see
  [`research/2026-10-22-performance.md`](./research/2026-10-22-performance.md).
- Dispatch: `kit.match` 79 ns to 7 ns per call (data-first), 73 ns to 5 ns
  (curried).

## Notes

- `@beep/schema` is private: no changeset.
- Upstream issues filed 2026-10-22: [Effect-TS/effect#9821](https://github.com/Effect-TS/effect/issues/9821) (`Schema.Literals.omit`), [Effect-TS/effect#9822](https://github.com/Effect-TS/effect/issues/9822) (`Match.literals` / `literalsExhaustive`). PRs open only after this lane merges. Hygiene:
  Effect's `CONTRIBUTING.md`, `/unslop` prose, no AI attribution.
