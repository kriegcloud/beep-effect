# Handoff P4

## Objective

Define and execute performance and browser E2E validation gates for `/kg` and associated CLI/API contracts.

## Inputs

- `specs/pending/ast-codebase-kg-visualizer/outputs/p3-d3-ui-implementation.md`
- `playwright.config.ts`
- `e2e/smoke.spec.ts`
- `apps/web/vitest.config.ts`

## Output

- `specs/pending/ast-codebase-kg-visualizer/outputs/p4-performance-and-e2e-validation.md`

## Command and Evidence Contract

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P4-C01 | `bun run --cwd tooling/cli test -- kg.test.ts` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p4/kg-cli-tests.log` |
| P4-C02 | `bun run --filter @beep/web test` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p4/web-tests.log` |
| P4-C03 | `bun run test:e2e` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p4/playwright-e2e.log` |
| P4-C04 | `bun run check && bun run lint && bun run test` | `specs/pending/ast-codebase-kg-visualizer/outputs/evidence/p4/repo-quality-gates.log` |

## Completion Checklist

- [ ] Required CLI/API/UI checks are covered.
- [ ] `/kg` interaction E2E checks are documented.
- [ ] Scale test gates are measured with evidence references.
- [ ] `outputs/manifest.json` updated (`phases.p4.status`, `updated`).
