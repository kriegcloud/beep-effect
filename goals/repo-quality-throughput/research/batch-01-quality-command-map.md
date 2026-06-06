# Batch 1: Quality Command Map

## Measured Facts

- Read-only agent lane completed with no source edits.
- Root scripts route `build`, `check`, `test`, `lint`, and `audit` through
  `beep-cli`.
- `coverage` is a separate direct Turbo lane.
- `docgen` is Turbo package docgen plus docs aggregation.
- `audit:github quality` covers build, check, lint, docgen generate/aggregate,
  repo-export catalog check, test, repo-sanity, and changeset status.
- `audit:github pre-push` adds secrets, security, SAST, and Nix.
- `lint:fix` has a repo-cli clean-tree no-op and changed-file Biome fast path.
- Yeet repair runs repair tasks and affected feedback. Yeet verify/publish run
  affected feedback plus full `pre-push` proof.
- PR Check matrix includes Lint, Repo Sanity, Check, Test Unit, Test
  Integration, and Docgen. Build is push-only. Secrets, security, Nix, and SAST
  are separate jobs.

## Source-Backed Observations

- Coverage is absent from `GithubCheckMode`, `audit:github quality`, and the PR
  Check workflow. It needs explicit classification before End-to-End Green can
  be claimed complete.
- CI and local pre-push are not identical: local SAST uses changed JS/TS files
  through Docker Semgrep, while CI uses the Semgrep action; CI security also has
  dependency-review.
- Release and data-sync reuse the shared setup action, so setup/cache changes
  must be proven beyond `check.yml`.

## Duplicate Or Stale Findings Avoided

- Turbo credentials are already pass-through env in `turbo.json`.
- Initial bounded lint sidecar grouping already exists in repo-cli.
- The old `lint:fix` root-script bypass is not the durable path; repo-cli owns
  the behavior.

## Candidate Tasks

| Rank | Task | Expected Impact | Risk | Proof |
| ---: | --- | --- | --- | --- |
| 1 | Build proof parity and check-name safety map. | Medium safety unlock for wait removal. | Medium | `bun run audit:github quality`, `bun run audit:github pre-push`, `gh pr checks --watch`. |
| 2 | Collapse Yeet duplicate affected feedback before full proof. | High on root/global branches. | Medium | `bun run beep yeet verify --plan --json`, repo-cli tests, `bun run audit:github pre-push`. |
| 3 | Classify coverage canonicality. | Medium clarity and avoids accidental slow path. | Medium | `rg` coverage policy, `bun run coverage` only when assigned. |

## Do Not Do

- Do not make Yeet canonical until the dedicated proof PR is green and the Yeet
  agent skill exists.
- Do not weaken security, SAST, dependency, Nix, or secrets proof.
- Do not add coverage to the common path without cost and policy proof.

## Open Questions

- Is coverage green-lane, full-only, scheduled, or out of scope?
- Should PRs gain an affected build lane, or is push-only build intentional?
