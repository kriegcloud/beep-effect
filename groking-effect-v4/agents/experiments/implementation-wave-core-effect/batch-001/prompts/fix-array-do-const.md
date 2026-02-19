# Fix Prompt - Array.Do.const

You are not alone in this codebase. Ignore unrelated edits and do not touch files outside ownership.

## Ownership
- You own only this file:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Do.const.ts

## Goal
Resolve current typecheck/lint failures while preserving semantically aligned Array.Do examples.

Required fixes:
1. Remove unused imports/values causing TS6133 and biome noUnusedImports errors.
2. Fix typing errors in comprehension examples (TS2769/TS2339) without reducing semantic quality.
3. Keep examples executable and source-aligned to `Array.Do` bind/filter/map intent.
4. Keep at least two examples and preserve top-level shell/runtime structure.

## Required Verification
- Run:
  - bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Array/exports/Do.const.ts

## Deliverables
1. Apply file edits to owned file only.
2. Write report to:
   - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/experiments/implementation-wave-core-effect/batch-001/reports/fix-array-do-const.md

Report sections:
- Changes made
- Verification command + outcome
- Notes / residual risks
