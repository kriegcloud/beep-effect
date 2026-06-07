# Batch 2: Security Audit SAST

Status: `complete`

Read-only agent lane. The agent returned this report; the orchestrator persisted
it. The agent did not run Gitleaks, OSV, Semgrep, Nix, Docker scanners, or
`audit:github`.

## Hotspots

- `audit:github pre-push` is the full local proof surface: it runs quality,
  secrets, OSV security, changed-file SAST, and Nix in sequence via
  `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts`.
- CI splits those into separate check names: `Secret Scanning`, `Security`,
  `Nix Shell`, and `SAST` in `.github/workflows/check.yml`. Preserve those names
  unless the ruleset baseline says otherwise.
- Local SAST is already scoped: it diffs `origin/main...HEAD`, filters JS/TS
  files, excludes `.repos/`, rejects symlinks, and skips when empty in
  `Quality.command.ts`. On this branch it would scan 286 first-party changed
  JS/TS files after excluding 452 `.repos/` files.
- CI SAST is broader/different: Semgrep action scans with the same config
  families, but not the same changed-file scope, in `.github/workflows/check.yml`.
- Dependency review is CI-only and PR-only, gated on dependency graph
  availability in `.github/workflows/check.yml`. Local `audit:github security`
  only runs OSV.
- `repo-sanity` already includes `bun audit --audit-level=high`, while
  `pre-push`/CI security also run OSV. This is related vulnerability proof, but
  not identical proof; do not collapse without timing and fallback evidence.

## Source Evidence

- Root `audit:github` routes through repo-cli: `package.json` and
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts`.
- `GithubCheckMode` includes `quality`, `repo-sanity`, `secrets`, `security`,
  `sast`, `nix`, and `pre-push`:
  `packages/tooling/tool/cli/src/internal/repo-run/RepoRun.proofs.ts`.
- Local Gitleaks uses merge-base range plus explicit config/ignore:
  `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts`.
- CI Gitleaks uses a pinned Docker digest and PR/push ranges, but does not spell
  out config/ignore args: `.github/workflows/check.yml`.
- OSV config exists and currently has no ignored vulnerability IDs:
  `osv-scanner.toml`.
- Batch 1's `.gitleaks.toml` open question is stale; the file exists:
  `.gitleaks.toml`.
- Lefthook is a fast guard, not full proof: pre-commit runs staged Gitleaks
  only, while pre-push only checks repo exports: `lefthook.yml`.

## Duplicate Or Stale Findings Avoided

- Did not re-propose removing hooks; they are cheap local guards and not
  substitutes for CI or `pre-push`.
- Did not treat local changed-file Semgrep and CI Semgrep action as exact
  duplicates.
- Did not propose dropping dependency review; no local equivalent exists today.
- Did not re-file the missing `.gitleaks.toml` question.

## Candidate Implementation Tasks

| Rank | Task | Write Scope | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Add a security proof-parity record/test surface for `github-checks` modes and scanner scopes. | `packages/tooling/tool/cli/test`, packet history docs | Safety unlock; makes later wait removal reviewable. | Low | `bun run test -- --filter=@beep/repo-cli`, `rg github-checks goals/repo-quality-throughput` | Revert test/docs commit. |
| 2 | Make CI Gitleaks invocation explicitly match local config/ignore semantics while preserving the pinned Docker digest. | `.github/workflows/check.yml` | Parity win, low speed impact. | Low-medium | `gh pr checks --watch`, `bun run audit:github secrets` | Revert workflow edit. |
| 3 | Add a read-only SAST plan/count mode before Docker Semgrep. | `Quality.command.ts`, tests | Avoids mystery Docker starts; enables CI fallback decisions with evidence. | Medium | Plan output on no-JS and many-JS branches; repo-cli tests | Revert CLI/test edit. |
| 4 | Defer a `pre-push-fast + CI-monitor` mode for OSV/SAST until check-name/ruleset proof is recorded. | Yeet/RepoRun + proof docs | Potentially removes duplicate local Docker scans when hosted CI is authoritative. | High | `audit:github pre-push` remains fallback; `gh pr checks --watch`; ruleset evidence | Disable mode; restore full `pre-push`. |
| 5 | Time `bun audit` vs OSV separately before collapsing dependency-vulnerability work. | Quality instrumentation/docs | May expose small repo-sanity wait; likely not selected unless measured. | Medium | `time -p bun run beep quality bun-audit`; CI Security job timing | Remove instrumentation. |

## Resource Risks

- OSV and Semgrep local paths use Docker, so image pulls/startup can dominate
  and behave differently from CI.
- Local Semgrep changed-file scope can still be large on global/subtree
  branches; current branch would pass 286 first-party JS/TS files.
- Dependency review depends on GitHub dependency graph state and cannot be
  proved locally from source alone.
- Hosted Secret Scanning can surface historical range/fingerprint issues after
  local green; exact scan range matters.

## Do Not Do

- Do not remove `Secret Scanning`, `Security`, `Nix Shell`, or `SAST` check
  names without branch-protection evidence.
- Do not replace CI dependency review with `bun audit` or OSV; they catch
  different policy surfaces.
- Do not skip local `pre-push` security in direct-to-main or no-PR publish
  paths.
- Do not broaden local Semgrep to repo-wide as a parity fix; that weakens
  throughput and duplicates CI.
- Do not compare local OSV/Semgrep timings from a warm Docker cache to cold CI
  action timing as a speedup claim.
