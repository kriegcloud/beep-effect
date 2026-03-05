# Handoff PRE

## Objective

Prepare the foundation so later phases follow repository laws and Effect-first conventions.

## Output Path Contract

All phase outputs and evidence artifacts are repo-root relative.

Canonical output root:
`specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs`

## Inputs

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/README.md`
- `tooling/cli/src/commands/kg.ts`
- `tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts`
- `packages/ai/sdk/README.md`
- `packages/ai/sdk/AGENTS.md`

## Output

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p-pre-kg-cli-refactor-and-ai-sdk.md`

## Entry Criteria

- [ ] Command-first discovery completed (`bun run beep docs laws`, `bun run beep docs skills`, `bun run beep docs policies`).
- [ ] No unresolved blocker on spec scope/contract.

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| PRE-C01 | `bun run beep docs laws` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/discovery-laws.log` |
| PRE-C02 | `bun run beep docs skills` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/discovery-skills.log` |
| PRE-C03 | `bun run beep docs policies` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/discovery-policies.log` |
| PRE-C04 | `bun run agents:pathless:check` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/agents-pathless-check.log` |
| PRE-C05 | `bun run --cwd tooling/cli test -- kg.test.ts` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/kg-cli-test.log` |
| PRE-C06 | `bunx turbo run check --filter=@beep/ai-sdk` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/ai-sdk-check.log` |
| PRE-C07 | `bunx turbo run lint --filter=@beep/ai-sdk` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/ai-sdk-lint.log` |
| PRE-C08 | `bunx turbo run test --filter=@beep/ai-sdk` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/ai-sdk-test.log` |
| PRE-C09 | `rg -n "@anthropic-ai/claude-agent-sdk|@beep/ai-sdk" tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/claude-executor-import-audit.log` |

## Completion Checklist

- [ ] `kg.ts` modularization plan and target files are explicit.
- [ ] Effect-first coding rules for the refactor are explicit.
- [ ] Claude benchmark execution migration plan to `@beep/ai-sdk` is explicit.
- [ ] Pre/post verification command matrix is explicit.
- [ ] Command/evidence artifacts captured for PRE-C01..PRE-C09.
- [ ] `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/manifest.json` updated (`phases.pre.status`, `updated`).
