# Fix Prompt - Result.Do.const

You are not alone in this codebase. Ignore unrelated edits and do not touch files outside ownership.

## Ownership
- You own only this file:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/Do.const.ts

## Goal
Resolve current lint/typecheck failures while preserving semantic examples and file shell.

Required fixes:
1. Remove unused imports/values causing TS6133 and biome noUnusedImports errors.
2. Preserve current executable, source-aligned `Result.Do` examples.
3. Keep at least two examples and top-level runtime shell unchanged.

## Required Verification
- Run:
  - bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/Do.const.ts

## Deliverables
1. Apply file edits to owned file only.
2. Write report to:
   - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/experiments/implementation-wave-core-effect/batch-001/reports/fix-result-do-const.md

Report sections:
- Changes made
- Verification command + outcome
- Notes / residual risks
