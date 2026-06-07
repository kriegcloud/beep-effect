# Batch 3: Yeet Fast Monitor

## Findings

- Duplicate Yeet wait removal is implemented: `verify` plans only
  `full:pre-push`, and `publish` plans `commit -> full:pre-push -> push`;
  `repair` still keeps deterministic repair plus affected feedback.
- Current Yeet does not implement fast-plus-monitor yet. There is no `monitor`
  subcommand, no `gh pr checks` integration, and no PR-discovery/check polling
  in `packages/tooling/tool/cli/src/commands/Yeet`.
- The explicit full local proof is already defined as
  `bun run audit:github pre-push`; Yeet's wrapper is `bun run beep yeet verify`,
  which calls `bun run beep quality github-checks pre-push`.
- Fast-plus-monitor should be opt-in until guardrails are satisfied. Safe
  shape: commit reviewed staged changes, push a PR branch, monitor all known PR
  checks, and keep `bun run audit:github pre-push` as the named fallback.
- Do not allow fast-plus-monitor for direct-to-main, no-PR, unknown
  ruleset/check baseline, missing `gh` auth, or ambiguous external status
  contexts.
- Live PR evidence advanced beyond the packet's recorded run: PR #214 is
  mergeable and green on `a7be8dc1e1119d095be0239b39cd812e5650ebec`; Check run
  `27064446802` succeeded.
- Packet history contained older "latest" references to `899d5b4b6` / run
  `27063362752` when this lane reported. Batch 3 closeout refreshes the
  authoritative packet evidence to `a7be8dc1e1119d095be0239b39cd812e5650ebec`
  / run `27064446802`.

## Evidence

- `AGENTS.md` and `CLAUDE.md`: Yeet remains proof-mode until a dedicated proof
  PR is green and the Yeet agent skill exists.
- `Yeet.command.ts`: root `yeet` remains a publish alias; subcommands are
  `repair`, `verify`, and `publish`.
- `Planner.ts`: `verify` returns `[full:pre-push]`; `publish` returns
  `[commit, full:pre-push, push]`; `repair` returns repair steps plus affected
  feedback.
- `Handler.ts`: publish still enforces reviewed staged intent and runs full
  proof before push; no monitor phase exists.
- `RepoRun.proofs.ts` and `Quality.command.ts`: `pre-push` maps to `quality`,
  `secrets`, `security`, `sast`, and `nix`.
- `batch-02-security-audit-sast.md`: `pre-push-fast + CI-monitor` was deferred
  until check-name/ruleset proof; direct-to-main/no-PR paths must not skip local
  security proof.
- `check-name-baseline.md`: required checks are not reported for this branch,
  so monitoring must watch all known check names rather than only required
  checks.
- Live read-only GitHub checks: `gh pr checks` is green for PR #214 on run
  `27064446802`; `Build` is still skipped by PR policy.
- No heavy local quality commands were run and no files were edited.

## Recommended Tasks

| Rank | Task | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- |
| 1 | Add opt-in `yeet publish --fast --monitor` gated to PR branches only. | Removes avoidable local full-proof wait when hosted CI is authoritative. | High. | Unit tests for gate matrix; live PR branch proof with `gh pr checks`; explicit `bun run audit:github pre-push` fallback remains documented. | Disable/remove the flag and keep current `commit -> pre-push -> push` path. |
| 2 | Add `yeet monitor` for current-branch PR check polling. | Turns PR monitoring into repo-owned UX instead of manual `gh` watching. | Medium. | Mock `gh pr view/checks` fixtures; live read-only `gh pr checks --json`; verify all known check names/external contexts are surfaced. | Remove subcommand; manual `gh pr checks --watch` remains fallback. |
| 3 | Add `quality github-checks <mode> --plan --json`. | Shows exact full-proof coverage before choosing fast mode. | Medium. | Repo-cli tests assert `pre-push` expands to quality/secrets/security/sast/nix; no execution in plan mode. | Remove plan flag; existing `audit:github` execution commands remain canonical. |
| 4 | Refresh packet evidence to current PR head/run after Batch 3. | Prevents stale "latest green" evidence during closeout. | Low. | Update history/tasks to `a7be8dc1e1` and run `27064446802`; `gh pr checks` remains green. | Revert docs-only evidence refresh. |
| 5 | Add pure read-only Yeet planning mode or explicit `--no-fetch`. | Avoids `.git` ref mutation during research/plan-only probes. | Low-medium. | Tests prove no `git fetch` under `--no-fetch`; default fetch remains available. | Remove `--no-fetch`; keep current hydration. |

## Rejected Ideas

- Making Yeet canonical now.
- Replacing local full proof with CI monitoring for direct-to-main or no-PR
  publishes.
- Dropping secrets, security, SAST, or Nix from explicit full proof.
- Reintroducing affected feedback before `verify`/`publish` full proof.
- Monitoring only required checks; this branch reports no required checks.
- Treating hooks as removable duplicates; they remain fast guards.

## Open Questions

- Is PR #214 the dedicated Yeet proof PR, or does the guardrail require a
  narrower follow-up PR?
- Should fast-plus-monitor become the default after proof gates, or remain an
  explicit `--fast --monitor` mode?
- Should Yeet monitor include unresolved PR review threads, or only
  status/check contexts?
- Which external contexts are authoritative for monitor failure?
- How fresh must a local `pre-push` proof be before fast-plus-monitor can skip
  rerunning it?
