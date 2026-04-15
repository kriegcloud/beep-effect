# Candidate Scorecard

## Provisional P0 Scores

Scale: `1` low, `5` high.

| Option | Summary | Effect-Lane Retirement Value | Docs-Lane Safety | Dependency Simplification | Operational Simplification | Migration Risk | Early Read |
|---|---|---:|---:|---:|---:|---:|---|
| `A` | full Effect-lane retirement with docs-only ESLint split and native-runtime rewrite | 5 | 4 | 5 | 5 | 3 | best simplification if the rewrite is practical |
| `B` | minimal shim retained for one narrow ESLint-backed parity surface | 3 | 5 | 2 | 3 | 4 | credible fallback if one rewrite is too costly right now |
| `C` | no-go, keep the leftover surface largely as-is | 1 | 5 | 1 | 1 | 5 | lowest preference unless validation finds a real blocker |

## Notes

- P0 scores are directional only and must be validated in P1.
- `docs-lane safety` rewards options that keep `lint:jsdoc` intact without broad collateral changes.
- `migration risk` is an upside score here, not yet a penalty-adjusted final total.
