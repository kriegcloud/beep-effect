# Implementation Prompt - Schema.Codec

You are not alone in this codebase. Ignore unrelated edits and do not touch files outside ownership.

## Ownership
- You own only this file:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Codec.namespace.ts

## Prompt Bundle
- /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/shared/base-system.md
- /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/prompts/kinds/value-like.md

## Config Bundle
- /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/configs/implementation.worker.jsonc

## Implementation Goals
1. Preserve existing top-level file structure, import contract, and runtime shell.
2. Replace generic reflection/probe-only content with executable, semantically aligned examples.
3. Prefer source-aligned/documented invocation when arity or JSDoc indicates inputs.
4. Keep at least two examples for this non-type-like export.
5. Avoid reflective-only type-like examples when runtime companion APIs exist.
6. Keep logs concise and behavior-focused.
7. Remove stale helper imports/values that become unused after edits.

## Required Verification
- Run:
  - bun run /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/src/effect/Schema/exports/Codec.namespace.ts

## Deliverables
1. Apply file edits to the owned file only.
2. Write a brief markdown report at:
  - /home/elpresidank/YeeBois/projects/beep-effect2/groking-effect-v4/agents/experiments/implementation-wave-schema-effect/batch-002/reports/003-codec.namespace.md

Report sections:
- Changes made
- Verification command + outcome
- Notes / residual risks
