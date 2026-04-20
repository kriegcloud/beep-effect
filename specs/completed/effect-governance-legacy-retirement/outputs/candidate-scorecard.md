# Candidate Scorecard

## Final P2 Ranking

Scale: `1` low, `5` high.

| Rank | Option | Summary | Effect-Lane Retirement Value | Docs-Lane Safety | Dependency Simplification | Operational Simplification | Migration Safety | Weighted Planning Score | Decision |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| 1 | `A` | full Effect-lane retirement with docs-only ESLint split and engine-neutral native-runtime rewrite | 5 | 4 | 5 | 5 | 3 | 4.55 | chosen primary path |
| 2 | `B` | minimal shim retained for one narrow native-runtime ESLint-backed bridge | 3 | 5 | 2 | 3 | 4 | 3.40 | explicit fallback only |
| 3 | `C` | no-go, keep the leftover surface largely as-is | 1 | 5 | 1 | 1 | 5 | 2.40 | rejected |

## Notes

- the ranking is now locked by P1 validation and P2 planning rather than treated as directional only
- `docs-lane safety` rewards options that keep `lint:jsdoc` intact without broad collateral changes
- `migration safety` is the inverse of execution danger: higher is safer
- even option `A` does **not** imply repo-wide ESLint removal while `lint:jsdoc` remains on ESLint
- option `A` won because the repo only exposed two real blockers and both are specific enough to cut directly
