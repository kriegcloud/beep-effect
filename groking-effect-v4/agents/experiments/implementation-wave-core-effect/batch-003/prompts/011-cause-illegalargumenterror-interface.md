# Implementation Prompt - Cause.IllegalArgumentError

You are not alone in this codebase. Ignore unrelated edits and do not touch files outside ownership.

## Ownership
- You own only this file:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/IllegalArgumentError.interface.ts

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
6. Remove stale helper imports/values that become unused after edits.

## Required Verification
- Run:
  - bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Cause/exports/IllegalArgumentError.interface.ts

## Deliverables
1. Apply file edits to the owned file only.
2. Write a brief markdown report at:
   - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/experiments/implementation-wave-core-effect/batch-003/reports/011-cause-illegalargumenterror-interface.md

Report sections:
- Changes made
- Verification command + outcome
- Notes / residual risks

## Alias style
- If importing `effect/Array`, use: `import * as A from "effect/Array"`.
- If importing `effect/Option`, use: `import * as O from "effect/Option"`.
