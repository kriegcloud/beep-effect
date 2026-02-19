# Implementation Prompt - Result.Failure

You are not alone in this codebase. Ignore unrelated edits and do not touch files outside ownership.

## Ownership
- You own only this file:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/Failure.interface.ts

## Prompt Bundle
- /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/base-system.md
- /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/kinds/type-like.md

## Config Bundle
- /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/configs/implementation.worker.jsonc

## Implementation Goals
1. Preserve existing top-level file structure, import contract, and runtime shell.
2. Replace generic reflection/probe-only content with executable, semantically aligned examples.
3. Prefer source-aligned/documented invocation when arity or JSDoc indicates inputs.
4. Type-like exports must include a runtime companion API flow; do not leave reflective-only examples.
5. Keep logs concise and behavior-focused.

## Required Verification
- Run:
  - bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Result/exports/Failure.interface.ts

## Deliverables
1. Apply file edits to the owned file only.
2. Write a brief markdown report at:
   - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/experiments/implementation-wave-core-effect/batch-001/reports/008-result-failure-interface.md

Report sections:
- Changes made
- Verification command + outcome
- Notes / residual risks
