# Batch 1: Turbo DAG And Cache

## Measured Facts

- Turbo package graph has 87 packages.
- There is one root `turbo.json`; no package-local Turbo configs were found.
- Workspace script surface: build/check/lint/test have 87 scripts each;
  coverage/audit have 86; docgen has 82; integration has 45; type-test has 13.
- Current branch is globally affected. `turbo query affected --packages
  --base=origin/main --head=HEAD` reported every workspace as
  `GlobalDepsChanged`.
- Changed global inputs include `package.json`, `bun.lock`, and
  `tsconfig.base.json`.
- Affected dry-runs showed build, audit, integration, and coverage as broad
  miss surfaces; check, lint, test, and docgen had many local hits.

## Source-Backed Observations

- `globalDependencies` include root package/config files that invalidate every
  task when changed.
- `lint`, `check`, `lint:fix`, `type-test`, and `docgen` use `^task`
  dependency edges. Transit-node designs may reduce over-serialization if
  proven safe.
- Build and audit hash broad env/input sets that may hurt shared library cache
  reuse.
- Integration and coverage are non-cacheable and pull build dependencies.

## Duplicate Or Stale Findings Avoided

- Did not re-file Turbo credential hashing; credentials are pass-through.
- Did not propose caching `lint:fix`; it is correctly non-cacheable.
- Did not use `--summarize` in read-only mode because it writes `.turbo/runs`.

## Candidate Tasks

| Rank | Task | Expected Impact | Risk | Proof |
| ---: | --- | --- | --- | --- |
| 1 | Reduce global dependency blast radius with measured scoped config. | High | High | Before/after affected query and dry-runs. |
| 2 | Evaluate transit-node DAG for lint/check/type-test. | High if serialized. | Medium | Before/after DAG and CI timing. |
| 3 | Scope build/audit env hashing. | Medium-high | Medium | Controlled env-change dry-runs and full proof. |

## Do Not Do

- Do not blanket-add package-local Turbo configs.
- Do not weaken cache correctness for local speed.
- Do not use the current branch as a normal small-PR baseline.

## Open Questions

- Can app-only env hashing be scoped without incorrect library cache hits?
- Should `type-test` use explicit filters to avoid misleading nonexistent
  transit nodes?
