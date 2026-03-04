# P4: Performance and E2E Validation

## Goal

Define and execute validation requirements for correctness, interaction fidelity, and large-graph responsiveness.

## Required Inputs

1. `specs/pending/ast-codebase-kg-visualizer/outputs/p3-d3-ui-implementation.md`
2. `playwright.config.ts`
3. `e2e/smoke.spec.ts`
4. `apps/web/vitest.config.ts`

## Output Path

`specs/pending/ast-codebase-kg-visualizer/outputs/p4-performance-and-e2e-validation.md`

## Required Validation Scenarios

### CLI Unit

1. export schema output validity
2. determinism across repeated runs
3. delta/full behavior

### API

1. `/api/kg/graph` success
2. typed 404 when missing export
3. typed 500 when malformed export

### Browser E2E

1. `/kg` loads and renders graph
2. depth slider changes visible node sets
3. node/edge filters toggle
4. hover highlight + click inspector behavior
5. `/` search hotkey + `Esc` clear

### Scale

1. sample fixture smoke (`114/205`)
2. large fixture responsiveness gate (no freeze/crash, bounded interaction latency)

## Command and Evidence Matrix

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P4-C01 | CLI export tests | `outputs/evidence/p4/kg-export-tests.log` |
| P4-C02 | web API tests | `outputs/evidence/p4/web-api-tests.log` |
| P4-C03 | Playwright `/kg` E2E | `outputs/evidence/p4/kg-playwright-e2e.log` |
| P4-C04 | sample fixture run | `outputs/evidence/p4/kg-sample-smoke.log` |
| P4-C05 | large fixture responsiveness run | `outputs/evidence/p4/kg-large-responsiveness.log` |

## Completion Checklist

- [ ] All required validation scenarios are covered.
- [ ] Evidence paths are complete.
- [ ] Regressions are documented with mitigation owner.

## Explicit Handoff

Next phase: [HANDOFF_P5.md](../handoffs/HANDOFF_P5.md)
