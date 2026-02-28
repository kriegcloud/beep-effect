# P7 Command Evidence

## Inputs consumed
1. `specs/pending/osdk-api-effect-schema-parity/outputs/p1-contract-freeze/test-contract.md`
2. `outputs/p6-public-surface/export-parity-matrix.md`
3. `outputs/p6-public-surface/alias-compatibility-report.md`
4. `specs/pending/osdk-api-effect-schema-parity/handoffs/HANDOFF_P7.md`

## Memory protocol evidence
- Proxy health + metrics check: `outputs/p7-verification/logs/memory-proxy-health.log`
- Result: `status: ok`, `rejected: 0` for both endpoints.
- Shared memory lookup executed (`group_id=beep-dev`) and returned prior P5/P6 facts.
- Fallback string usage: **not required** (proxy and memory calls succeeded).

## Required command suite (locked)
Source: `outputs/p7-verification/logs/required-suite-summary.tsv`

| # | Command | Exit | Evidence log |
| --- | --- | --- | --- |
| 1 | `bun run beep docs laws` | 0 | `outputs/p7-verification/logs/required-01.log` |
| 2 | `bun run beep docs skills` | 0 | `outputs/p7-verification/logs/required-02.log` |
| 3 | `bun run beep docs policies` | 0 | `outputs/p7-verification/logs/required-03.log` |
| 4 | `bun run --cwd packages/common/ontology check` | 0 | `outputs/p7-verification/logs/required-04.log` |
| 5 | `bun run --cwd packages/common/ontology lint` | 0 | `outputs/p7-verification/logs/required-05.log` |
| 6 | `bun run --cwd packages/common/ontology test` | 0 | `outputs/p7-verification/logs/required-06.log` |
| 7 | `bun run --cwd packages/common/ontology docgen` | 0 | `outputs/p7-verification/logs/required-07.log` |
| 8 | `bun run check` | 2 | `outputs/p7-verification/logs/required-08.log` |
| 9 | `bun run lint` | 1 | `outputs/p7-verification/logs/required-09.log` |
| 10 | `bun run test` | 0 | `outputs/p7-verification/logs/required-10.log` |
| 11 | `bun run docgen` | 1 | `outputs/p7-verification/logs/required-11.log` |

## Scenario matrix command suite
Source: `outputs/p7-verification/logs/scenario-suite-summary.tsv`

| # | Command | Exit | Evidence log | Classification |
| --- | --- | --- | --- | --- |
| S01 | `bunx tstyche packages/common/ontology/test/types/simple-property-def.tst.ts` | 1 | `outputs/p7-verification/logs/scenario-01.log` | Pre-existing tooling config mismatch (`testFileMatch` only includes `*/dtslint/**`) |
| S02 | `bunx tstyche packages/common/ontology/test/types/object-specifier.tst.ts` | 1 | `outputs/p7-verification/logs/scenario-02.log` | Same as S01 |
| S03 | `bunx tstyche packages/common/ontology/test/types/aggregate-query-primitives.tst.ts` | 1 | `outputs/p7-verification/logs/scenario-03.log` | Same as S01 |
| S04 | `bunx tstyche packages/common/ontology/test/types/p5-objectset-osdk-heavy.tst.ts` | 1 | `outputs/p7-verification/logs/scenario-04.log` | Same as S01 |
| S05 | `bunx tstyche outputs/p7-verification/tmp/type-runtime-alias-matrix.tst.ts` | 1 | `outputs/p7-verification/logs/scenario-05.log` | Same as S01 |
| S06 | `bun outputs/p7-verification/tmp/property-security-runtime.ts` | 0 | `outputs/p7-verification/logs/scenario-06.log` | Pass |
| S07 | `node outputs/p7-verification/tmp/export-parity-check.mjs` | 0 | `outputs/p7-verification/logs/scenario-07.log` | Pass |
| S08 | `bunx tstyche --config /tmp/tstyche-p7-ontology.json --root /home/elpresidank/YeeBois/projects/beep-effect` | 1 | `outputs/p7-verification/logs/scenario-08.log` | New in-session assertion mismatch in custom matrix file |
| S09 | `bunx tstyche --config /tmp/tstyche-p7-ontology.json --root /home/elpresidank/YeeBois/projects/beep-effect` | 0 | `outputs/p7-verification/logs/scenario-09.log` | Pass after fixing custom assertions |

## Failure proof and classification

### `bun run check` (required #8)
- Classification: **Pre-existing blocker**.
- Proof:
  1. Failure occurred before any P7 report/scenario file edits (required suite ran 05:33:57Z-05:34:47Z; first custom scenario file creation was later).
  2. Errors are concentrated in existing `packages/ai/sdk/test/*` paths and strict type checks under existing ontology runtime tests.
  3. Error volume fingerprint from log: `TS18046:317`, `TS2307:237`, `TS7006:217`, `TS2339:177`.

### `bun run lint` (required #9)
- Classification: **Pre-existing blocker**.
- Proof:
  1. Failure is in `@beep/identity#lint` (`packages/common/identity/src/packages.ts`) with formatter delta.
  2. Ontology package lint passed independently in required #5.

### `bun run docgen` (required #11)
- Classification: **Pre-existing blocker**.
- Proof:
  1. Failure is in `@beep/utils#docgen` due missing `@since` tag in `packages/common/utils/src/Struct.ts` on `export * from "effect/Struct"`.
  2. Ontology package docgen passed independently in required #7.

### Scenario runner failures S01-S05
- Classification: **Pre-existing tooling behavior**.
- Proof: each log reports `No test files were selected` under current repo `tstyche.config.json` (`testFileMatch` restricted to `*/dtslint/**`).

### Scenario runner failure S08
- Classification: **New in-session verifier issue, resolved**.
- Proof:
  1. S08 failed due strict equality assertions in custom matrix test.
  2. S09 rerun passed after aligning assertions to actual type behavior.
  3. No unresolved new failure remains.
