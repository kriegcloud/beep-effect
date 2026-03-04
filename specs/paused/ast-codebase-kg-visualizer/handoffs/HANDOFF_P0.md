# Handoff P0

## Objective

Freeze architecture boundaries, file map, and acceptance gates for CLI export, web API, and `/kg` D3 UI.

## Inputs

- `specs/pending/ast-codebase-kg-visualizer/outputs/p-pre-contract-and-source-alignment.md`
- `specs/pending/ast-codebase-kg-visualizer/RUBRICS.md`
- `tooling/cli/src/commands/kg.ts`
- `apps/web/src/app/api/graph/search/route.ts`
- `apps/web/src/components/graph/ForceGraph.tsx`

## Output

- `specs/pending/ast-codebase-kg-visualizer/outputs/p0-architecture-and-gates.md`

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P0-C01 | `bun run beep docs laws` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p0/discovery-laws.log` |
| P0-C02 | `bun run beep docs skills` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p0/discovery-skills.log` |
| P0-C03 | `bun run beep docs policies` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p0/discovery-policies.log` |
| P0-C04 | `bun run agents:pathless:check` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p0/agents-pathless-check.log` |
| P0-C05 | `rg -n "kgCommand|runKgIndexNode|publish|verify|parity|replay" tooling/cli/src/commands/kg.ts` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p0/kg-surface-audit.log` |

## Completion Checklist

- [ ] CLI/API/UI file boundaries are explicit.
- [ ] Acceptance gate matrix is explicit.
- [ ] No unresolved architecture TBDs remain.
- [ ] `outputs/manifest.json` updated (`phases.p0.status`, `updated`).
