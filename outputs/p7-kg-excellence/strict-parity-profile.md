# Strict Parity Profile

## Profile Added
`kg parity --profile code-graph-strict --strict-min-paths <n>`

Behavior:
- Enforces strict non-zero path threshold when eligible `CALLS` edges exist.
- Applies explicit fallback when no eligible `CALLS` edges exist in the group.
- Keeps entity/neighbor/commit-context checks group-scoped.

Code: `tooling/cli/src/commands/kg.ts`

## Check Semantics

| Check | Functional Profile | Strict Profile |
|---|---|---|
| entity-listing | `observed > 0` | same |
| neighbor-expansion | `observed > 0` | same |
| commit-context | `observed > 0` | same |
| path-finding-query | execution-only pass | pass only if `observedPaths >= strictMinPaths`, unless fallback is active |

Fallback condition:
- If `eligibleCallEdges == 0`, strict path check passes with `fallback: "no-eligible-call-edges"`.

## Evidence
- Strict parity artifact: `outputs/p7-kg-excellence/evidence/20260226T004744Z-fullrepo-parity-strict.json`
- Group: `beep-ast-kg-p7-20260226T004744Z`

Observed strict output:
- `strictMinPaths: 1`
- `observedPaths: 0`
- `eligibleCallEdges: 0`
- `fallback: no-eligible-call-edges`
- strict path check `pass: true`

## Acceptance Decision
Strict parity profile is enabled and producing explicit fallback evidence: **PASS**.
