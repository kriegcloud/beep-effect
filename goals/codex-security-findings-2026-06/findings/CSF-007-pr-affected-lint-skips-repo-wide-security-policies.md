# CSF-007: PR affected lint skips repo-wide security policies

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 009c89b |
| Reported age | 3d ago |
| Capture method | dom-get-page-text |
| Owner area | packages/tooling/tool/cli |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced a security-relevant CI policy bypass by skipping repo-wide lint policy checks for `lint --affected`; PR CI uses that mode by default. The new `shouldRunLintRepoWideSteps` predicate treats `--affected` as an explicit scope and suppresses repo-wide lint policy steps. The GitHub PR workflow appends `--affected` before running `bun run lint`, so PR lint now only runs the Turbo affected `lint` task and skips the bespoke repo-wide policy checks (`lint:native-runtime`, `lint:allowlist`, `lint:deprecated-apis`, circular dependency checks, and other governance checks). This creates a CI policy-bypass regression: a pull request can introduce code violating these repo-wide policies and still pass the affected lint lane.

## Codex Patch

No patch provided by Codex.

- Patch status: _pending P5_

## Current-HEAD Triage

- Verdict: _pending P2_
- Disposition: _pending P2_
- Rationale: _pending P2_
- Remediation status: _pending P5_
- Lane: _pending P4_
- Verification command: _pending P2_
- Changed files: _pending P5_
- Verification notes: _pending P5_

## Evidence Paths

- .github/workflows/check.yml
- packages/tooling/tool/cli/src/commands/Quality/Tasks.ts
- packages/tooling/tool/cli/test/quality-tasks.test.ts

## Validation Notes From Codex

- Confirm the target commit introduced a predicate that treats --affected as an explicit lint scope.
- Confirm both lint planning and runtime paths skip repo-wide lint policy steps when that predicate is false.
- Confirm the skipped steps are substantive repo-wide governance/security checks, not equivalent to ordinary per-package lint.
- Confirm the GitHub PR lint lane supplies --affected to bun run lint, making the skip active in PR CI.
- Confirm regression versus the parent commit/test expectations: affected lint previously planned the policy checks and now plans only the aggregate Turbo lint step.

## Sanitized Finding Content

```text
Finding
PR affected lint skips repo-wide security policies
Report
Chat
Severity
Medium

Commit
009c89b
1:45 AM Jun 5, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced a security-relevant CI policy bypass by skipping repo-wide lint policy checks for `lint --affected`; PR CI uses that mode by default.

The new `shouldRunLintRepoWideSteps` predicate treats `--affected` as an explicit scope and suppresses repo-wide lint policy steps. The GitHub PR workflow appends `--affected` before running `bun run lint`, so PR lint now only runs the Turbo affected `lint` task and skips the bespoke repo-wide policy checks. Those skipped checks include rules such as `lint:native-runtime`, `lint:allowlist`, `lint:deprecated-apis`, circular dependency checks, and other repository governance checks that are not equivalent to per-package Biome lint scripts. This creates a CI policy-bypass regression: a pull request can introduce code violating these repo-wide policies and still pass the affected lint lane, weakening the repository's supply-chain/security gate.

Validation
Confirm the target commit introduced a predicate that treats --affected as an explicit lint scope.
Confirm both lint planning and runtime paths skip repo-wide lint policy steps when that predicate is false.
Confirm the skipped steps are substantive repo-wide governance/security checks, not equivalent to ordinary per-package lint.
Confirm the GitHub PR lint lane supplies --affected to bun run lint, making the skip active in PR CI.
Confirm regression versus the parent commit/test expectations.

Evidence
.github/workflows/check.yml (L173-182 PR CI appends --affected then runs the lint lane)
packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:
  L371-376 isExplicitTurboAffectedOrScopeArg treats "--affected" as scope; shouldRunLintRepoWideSteps returns false when present
  L942-961 rootRepoLintPolicySteps lists 19 repo-wide checks (effect-imports, native-runtime, allowlist, schema-first, deprecated-apis, circular, clones, etc.)
  L964-972 rootLintPolicySteps returns A.empty when fix || !shouldRunLintRepoWideSteps(args)
  L1004-1012 runtime early-returns before runStepGroup("lint:policies", ...)
packages/tooling/tool/cli/test/quality-tasks.test.ts (L503-507 affected root lint delegates only to the affected aggregate repo lint lane)

Attack-path analysis

Kept at medium. Static evidence confirms the bug and reachability: PR CI adds --affected, the CLI treats --affected as suppressing lint repo-wide policy steps, and both planning and runtime paths skip the lint:policies group. This is in scope as a CI/supply-chain gate weakness and can allow policy-violating code to pass PR lint. It does not merit high or critical because there is no direct runtime compromise, credential exposure, authorization bypass, or proven malicious artifact delivery.

Path
Pull request to main --triggers pull_request workflow--> .github/workflows/check.yml adds --affected for PRs --runs bun run lint with --affected--> beep-cli lint receives --affected ----affected is classified as affected-or-scope arg--> shouldRunLintRepoWideSteps returns false --early return / empty policy steps--> lint:policies group skipped --repo-wide policy violations are not enforced in PR lint--> Policy-violating code may pass PR lint

Likelihood
High - The affected path is easy to trigger because the public pull_request workflow automatically supplies --affected. Meaningful exploitation is less certain because it requires a violation not caught by other checks and a successful review/merge path.
Impact
Medium - The impact is integrity degradation of the CI/supply-chain gate: policy-violating code can pass PR lint. The skipped checks are substantive repository governance controls, including runtime-boundary and allowlist integrity checks.
Controls
Workflow uses pull_request rather than pull_request_target, limiting default fork-secret exposure.
Other PR lanes still run check, tests, repo-sanity, and docgen, but they are not shown to duplicate the skipped repo-wide lint policies.
Push-to-main lint runs without --affected, but that is post-merge and does not prevent a PR from merging if PR lint is the enforced gate.
```
