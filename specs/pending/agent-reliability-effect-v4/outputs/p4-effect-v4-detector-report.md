# P4 Effect v4 Detector Report

## Scope

Detector status and live incident evidence for the February 25, 2026 targeted matrix.

Primary artifacts:

- `tooling/agent-eval/src/effect-v4-detector/index.ts`
- `outputs/agent-reliability/runs/latest.json`
- `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`

Verification gates executed:

- `bun run --cwd tooling/agent-eval test` -> pass (`test/detector.test.ts` included)

## Rule Inventory

Detector rule count: `27`

Rule IDs:

1. `context-generic-tag`
2. `context-tag`
3. `effect-tag`
4. `effect-catch-all`
5. `layer-scoped`
6. `schema-decode`
7. `effect-schema-package`
8. `platform-filesystem-path`
9. `platform-path-path`
10. `runtime-generic`
11. `node-core-import`
12. `node-core-require`
13. `native-date-now`
14. `native-new-date`
15. `native-array-method-chain`
16. `json-parse-stringify`
17. `schema-union-literals-array`
18. `native-error-construction`
19. `native-error-inheritance`
20. `native-try-catch`
21. `nullable-type-union`
22. `nullable-initializer`
23. `type-assertion-as`
24. `non-null-assertion`
25. `native-throw`
26. `native-promise-construction`
27. `native-promise-static`

## Live Evidence (Targeted Matrix)

From `outputs/agent-reliability/runs/latest.json.diagnostics.jsonl`:

- `run.diagnostic` rows: `24`
- `wrongApiRuleIds` hits: `0`
- `effectComplianceRuleIds` hits: `0`
- `criticalIncidentCount > 0` rows: `0`
- Runtime timeouts: `24/24`
- `touchedPathCount=0` for all runs

From suite metrics in the same diagnostics file:

- `outcomeCounts.wrong_api = 0`
- `outcomeCounts.effect_compliance = 0`
- `outcomeCounts.runtime = 24`

## Precision/Recall Interpretation

1. Static detector implementation health is validated at unit-test level.
2. Live detector precision/recall is not observable in this run set because no source files were modified before runtime timeout.
3. Current live evidence supports "no false positives observed" but does not support "detector catches real incidents" under this timeout-constrained execution profile.

## Decision

- Detector implementation status: `GO` (unit-tested, rule inventory present)
- Detector live efficacy status: `NO-GO` (insufficient mutation signal in live runs)
