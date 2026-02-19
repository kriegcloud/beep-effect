## Changes made
- Updated `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dedupeWith.const.ts` to replace generic callable probing with executable, semantics-aligned examples.
- Kept the existing top-level file structure and playground program shell while removing stale probe helper usage.
- Switched `effect/Array` import to `import * as A from "effect/Array"` and updated module record binding accordingly.
- Added concrete examples for:
  - Source-aligned two-argument `dedupeWith(self, isEquivalent)` usage.
  - Curried `dedupeWith(isEquivalent)(self)` usage with custom object equivalence and first-occurrence retention.
- Retained runtime inspection as an initial behavior-focused example with a callable arity hint.

## Verification command + outcome
- Command: `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/dedupeWith.const.ts`
- Outcome: Success (exit code 0). All examples completed and produced expected deduplication outputs.

## Notes / residual risks
- Examples currently validate deterministic equivalence functions only; they do not demonstrate non-transitive or side-effecting equivalence predicates, which could produce unintuitive results in real usage.
