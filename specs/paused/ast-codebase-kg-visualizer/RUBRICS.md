# Rubrics

## PRE/P0 Contract Freeze Rubric

| Metric | Threshold | Evidence |
|---|---:|---|
| Source-of-truth alignment coverage | 100% required artifacts reviewed | PRE output |
| Node/edge mapping completeness | 100% KG v1 kinds + edge types covered | PRE + P0 outputs |
| Fallback mapping determinism | 100% unmapped types route to canonical fallback with `meta.originalType` | PRE output |
| Architecture decision completeness | `TBD=0` | P0 output |
| Phase gate completeness | 100% phases include inputs/outputs/commands/checklists | P0 output |

## P1 CLI Rubric

| Metric | Threshold | Evidence |
|---|---:|---|
| CLI command surface lock | 100% | P1 output |
| Export schema compatibility (`visualizer-v2`) | 100% compatible fields documented | P1 output |
| Deterministic output rules | 100% explicit | P1 output |
| Unit test coverage plan | full + delta + determinism + malformed input | P1 output |

## P2 API Rubric

| Metric | Threshold | Evidence |
|---|---:|---|
| Success response contract | 100% explicit | P2 output |
| Missing export behavior | typed 404 remediation response present | P2 output |
| Malformed export behavior | typed failure response present | P2 output |
| API test scenarios | success + missing + malformed | P2 output |

## P3 UI Rubric

| Metric | Threshold | Evidence |
|---|---:|---|
| `/kg` route architecture clarity | 100% explicit module graph | P3 output |
| Interaction contract completeness | depth/filter/search/hover/inspector/zoom/auto-fit all specified | P3 output |
| Accessibility contract completeness | keyboard + focus + color semantics defined | P3 output |

## P4 Validation Rubric

| Metric | Threshold | Evidence |
|---|---:|---|
| CLI unit validation plan | required cases complete | P4 output |
| API validation plan | required cases complete | P4 output |
| Browser E2E coverage | required `/kg` interactions covered | P4 output |
| Sample fixture smoke gate | pass (`114 nodes / 205 edges`) | P4 evidence |
| Large fixture responsiveness gate | pass (no freeze/crash; bounded interaction latency) | P4 evidence |

## P5 Rollout Rubric

| Metric | Threshold | Evidence |
|---|---:|---|
| Gate-by-gate verdict table | 100% gates evaluated | P5 output |
| Rollout stages defined | shadow -> limited -> default with owner + trigger | P5 output |
| Rollback triggers defined | explicit triggers + actions | P5 output |

## Required Test Scenarios

1. CLI unit tests
   - export command creates valid schema output
   - deterministic output for same commit/input
   - delta/full behavior correctness
2. API tests
   - `/api/kg/graph` success path
   - missing export file returns typed 404 payload
   - malformed graph file handling
3. UI browser E2E tests
   - `/kg` loads and renders graph
   - depth slider changes visible node sets
   - node/edge filters toggle visibility
   - hover highlight + click inspector behavior
   - `/` hotkey search + `Esc` clear
4. Scale scenarios
   - sample fixture smoke (`114/205`)
   - large fixture responsiveness gate

## Promotion Rule

- **GO:** All high-impact gates pass with evidence.
- **LIMITED GO:** Core correctness gates pass; one non-critical performance gate has mitigation and owner.
- **NO GO:** Any correctness or stability gate fails, or required evidence is missing.

## Blocking Conditions

Any of the following block promotion:

- Missing immutable mapping contract in PRE/P0.
- Missing CLI export determinism strategy.
- Missing typed API error contracts.
- Missing `/kg` interaction E2E evidence.
- Missing large-graph responsiveness evidence.
