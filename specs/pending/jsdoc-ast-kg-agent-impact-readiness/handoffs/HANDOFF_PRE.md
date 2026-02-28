# Handoff PRE

## Objective

Prepare the foundation so later phases follow repository laws and Effect-first conventions.

## Inputs

- `README.md`
- `tooling/cli/src/commands/kg.ts`
- `tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts`
- `packages/ai/sdk/README.md`
- `packages/ai/sdk/AGENTS.md`

## Output

- `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md`

## Completion Checklist

- [ ] `kg.ts` modularization plan and target files are explicit.
- [ ] Effect-first coding rules for the refactor are explicit.
- [ ] Claude benchmark execution migration plan to `@beep/ai-sdk` is explicit.
- [ ] Pre/post verification command matrix is explicit.
