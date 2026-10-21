# Round-one claim budget review repair

Review comment `4333008362` is valid. A new ordinary-input fixture containing
ten claims (four independent, six depending on those four parents) and eight
body terms per claim failed against the prior implementation: later terms
returned `chain-work-limit`. Receipt: ignored `../raw/claim-review-reproduction.log`.

## Bounded compatibility correction

Keep the fixed 8,192-unit dependency/path/advisory-copy budget and 128-depth
limit. Give term evaluation its own invocation-wide allowance:

`min(262144, 8192 + locatedTermCount * 512)`

This permits the ordinary multi-parent fixture's tens of thousands of weighted
term scans without using dependency enumeration capacity. The 512-unit slope
provides a bounded ordinary-input allowance; the 262,144 ceiling is only 32
times the fixed enumeration cap and prevents attacker-controlled term count
from making the scan allowance unbounded. Both budgets are allocated fresh
per invocation and charged before the corresponding work; exhaustion retains
explicit deterministic abstention.

The global sorted term set, chain membership rules and
`antecedent-outside-chain` search are unchanged. No chain-only index or altered
semantic lookup was introduced. Existing outside-chain fixtures still pass.

## Verification

Node/V8 full package coverage: **15 files, 206 tests passed**, 8.23 seconds.

| Antecedent policy metric | Final |
| --- | --- |
| Branches | **100% (44/44)** |
| Lines | **99.21% (127/128)** |
| Statements | **99.31% (146/147)** |
| Functions | **98.52% (67/68)** |

All current per-file floors are met without baseline changes. The ordinary
ten-claim fixture now produces semantic findings without budget abstention.
Dense 25-claim DAG, depth 128, 128-parent path-copy and 90-parent advisory-copy
regressions remain bounded and pass. The cross-tree evaluation stress control
now uses 512 independent claims to reach the separate scan ceiling, and proves
fresh-invocation reset and deterministic abstention.

Canonical `bun run package-test-typecheck` passed with artifact exitCode 0 and
empty diagnostics. Root Oxlint with nested configs disabled passed for both
changed files. Default full package verification passed: audit 10.0s and docgen 14.5s.

Receipts are ignored `../raw/claim-review-*.log`,
`../raw/claim-review-coverage-summary.json` and
`../raw/claim-review-typecheck-result.json`. No commit or push by this lane.
