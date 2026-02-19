# Implementation Prompt - Cause.StackTrace (Core effect)

You are not alone in this codebase. Other agents may be editing unrelated files. Ignore unrelated changes and do not touch files outside your ownership.

## Ownership
- You own only this file:
  - `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/StackTrace.class.ts`

## Prompt Bundle
- `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/base-system.md`
- `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/kinds/class-like.md`

## Config Bundle
- `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/configs/implementation.worker.jsonc`

## Implementation Goals
1. Keep at least two examples.
2. Preserve the existing top-level file structure and program shell.
3. Replace constructor-only probing with a summary-aligned semantic example demonstrating `StackTrace` as a `ServiceMap` annotation key.
4. Use deterministic data and safe lookup (`getOrUndefined` or equivalent).
5. Keep logs clean and concise.

## Required Verification
- Run:
  - `bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/StackTrace.class.ts`

## Deliverables
1. Apply file edits.
2. Write a brief markdown report at:
   - `/home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/experiments/implementation-pilot-core-effect-1/reports/agent-cause-stacktrace.md`

Report sections:
- Changes made
- Verification command + outcome
- Notes / residual risks
