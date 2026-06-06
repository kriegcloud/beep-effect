# Proof Parity Map

Status: `current-through-899d5b4b`

This map prevents speedups from weakening proof by making local, Yeet, PR, push,
and side-workflow coverage explicit.

| Lane | Local quality | Local pre-push | Yeet repair | Yeet verify/publish | PR checks | Push/main | Side workflow | Fallback proof |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Build | `audit:github quality` | included via quality | no | full proof path | push-only unless changed | Check push build | Release | `bun run build` |
| Check | `audit:github quality` | included via quality | affected feedback only when configured | full proof path | Check | Check | Data Sync focused check | `bun run check` |
| Lint | `audit:github quality` and `bun run lint` | included via quality | `lint:fix` repair plus feedback | full proof path | Lint | Check | Release | `bun run lint` |
| Docgen | `audit:github quality`, `bun run docgen` | included via quality | full repair docgen today | full proof path | Docgen | Check | Release | `bun run docgen` |
| Test unit/type | `audit:github quality` | included via quality | affected feedback only when configured | full proof path | Test Unit | Check | Data Sync focused tests | `bun run test` |
| Integration | PR matrix lane | included through `pre-push` only if mode covers it | no | full proof path | Test Integration | Check | none known | `bun run test -- --integration` |
| Repo sanity | `audit:github quality` | included via quality | repo-exports catalog repair | full proof path | Repo Sanity | Check | Release | `bun run audit:github repo-sanity` |
| Secrets | no | `audit:github pre-push` | no | full proof path | Secret Scanning | Check | Release if configured | `bun run audit:github secrets` |
| Security | no | `audit:github pre-push` | no | full proof path | Security | Check | Release if configured | `bun run audit:github security` |
| SAST | no | `audit:github pre-push` | no | full proof path | SAST | Check | Release if configured | `bun run audit:github sast` |
| Nix | no | `audit:github pre-push` | no | full proof path | Nix Shell | Check | Release if configured | `bun run audit:github nix` |
| Coverage | not canonical today | not canonical today | no | no | absent today | absent today | scheduled/full-only report-only lane | `bun run coverage` for explicit full/scheduled proof |

Any lane moved out of the common path must name a fallback proof in this table
and a task inventory record with residual risk.

## Current Evidence

- Local `bun run audit:github quality` passed after the Yeet and lint fast-path
  work; targeted ESLint and scoped repo-cli docgen passed after the follow-up
  JSDoc repair.
- PR Check run `27063362752` is green on commit
  `899d5b4b6bda25169579887509fbb76234c222fa`; `Build` remains present and
  intentionally skipped by workflow policy.
- `gh pr checks 214 --required` reported no required checks on
  `ontology_builder_refinement`, so preservation is tracked by live check-name
  evidence rather than a branch-ruleset requirement.
- Thread-aware PR review inspection found zero unresolved actionable threads
  before the next push.
