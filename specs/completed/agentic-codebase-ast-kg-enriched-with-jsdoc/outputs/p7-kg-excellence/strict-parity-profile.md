# P7-T4 Strict Path Parity Profile

## Objective
Add strict parity semantics that require non-zero path evidence when eligible call-path data exists.

## Profile Contract
Supported profiles:
- `code-graph-functional`
- `code-graph-strict`

Strict options:
- `--strict-min-paths <int>=1`

Strict behavior:
1. Compute `eligibleCallEdges` and `observedPaths`.
2. If `eligibleCallEdges > 0`, require `observedPaths >= strictMinPaths`.
3. If `eligibleCallEdges === 0`, return fallback `no-eligible-call-edges` and do not fail parity.

Implementation reference:
- `tooling/cli/src/commands/kg.ts` (`parseParityProfile`, `parseStrictMinPaths`, strict `path-finding-query` logic)

## Evidence
- Functional profile run: `outputs/p7-kg-excellence/evidence/20260228T105920Z-parity-functional-isolated-group.json`
- Strict profile run: `outputs/p7-kg-excellence/evidence/20260228T105920Z-parity-strict-isolated-group.json`

Observed strict fallback evidence:
- `eligibleCallEdges: 0`
- `observedPaths: 0`
- `fallback: "no-eligible-call-edges"`
- `pass: true`

## Acceptance Check
- Strict profile implemented with minimum-path threshold: **PASS**
- Fallback behavior documented/evidenced for no eligible path data: **PASS**

