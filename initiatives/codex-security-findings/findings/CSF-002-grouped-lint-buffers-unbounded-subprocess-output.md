# CSF-002: Grouped lint buffers unbounded subprocess output

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | e6f1914 |
| Reported age | 3d ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/tool/cli |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced an availability bug in the quality-task lint grouping implementation: subprocess output is accumulated without bounds and root lint policy checks now use that grouped collector.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Current HEAD still retained grouped child stdout/stderr with an unbounded Stream.runFold accumulator. The branch now caps retained grouped-step output at 262144 characters, appends a visible truncation notice, and keeps deterministic grouped failure reporting.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/tooling/tool/cli/test/quality-tasks.test.ts`
- Changed files:
  - packages/tooling/tool/cli/src/commands/Quality/Tasks.ts
  - packages/tooling/tool/cli/test/quality-tasks.test.ts
- Verification notes:
  - The full quality-tasks focused test file passes, including the retained-output truncation regression test.

## Evidence Paths

- packages/tooling/tool/cli/src/commands/Quality/Tasks.ts

## Validation Notes From Codex

- Confirm the changed code pipes child stdout/stderr and accumulates decoded output with no maximum size.
- Confirm grouped execution retains every step output until all grouped steps complete, with concurrency greater than 1.
- Confirm root lint policy checks route repo-wide, repository-content-influenced tools through the grouped collector.
- Attempt direct dynamic reproduction; full CLI execution was blocked by missing/unresolvable dependencies, so a faithful dependency-free collector PoC was used.
- Attempt crash, valgrind, and debugger validation: crash reproduced; valgrind unavailable; lldb captured SIGABRT/OOM.

## Sanitized Finding Content

```text
Finding
Grouped lint buffers unbounded subprocess output
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
e6f1914
6:05 AM May 16, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced an availability bug in the quality-task lint grouping implementation: subprocess output is accumulated without bounds and root lint policy checks now use that grouped collector.
The commit introduces runStepGroup for root lint policy checks. Unlike the existing runStep path, which streams stdout/stderr directly, collectResolvedStepOutput pipes both stdout and stderr and folds the entire stream into one string with no size limit. Root lint now runs multiple repo-wide tools through this grouped path. A malicious or accidental repository change that causes eslint, cspell, markdownlint, or similar checks to emit very large output can force the CLI/CI runner to retain all output in memory, multiplied by concurrent steps, potentially crashing the process or runner before the failure is reported.
Validation
Confirm the changed code pipes child stdout/stderr and accumulates decoded output with no maximum size.
Confirm grouped execution retains every step output until all grouped steps complete, with concurrency greater than 1.
Confirm root lint policy checks route repo-wide, repository-content-influenced tools through the grouped collector.
Attempt direct dynamic reproduction; full CLI execution was blocked by missing/unresolvable dependencies, so a faithful dependency-free collector PoC was used.
Attempt crash, valgrind, and debugger validation: crash reproduced; valgrind unavailable; lldb captured SIGABRT/OOM.
Validation artifact
Evidence
packages/tooling/tool/cli/src/commands/Quality/Tasks.ts
621
stdin: "inherit",
622
stdout: "pipe",
623
stderr: "pipe",
624
});
625
const output = yield* handle.all.pipe(
626
Stream.decodeText(),
627
Stream.runFold(thunkEmptyStr, (acc, chunk) => acc + chunk)
628
);
691
const results = yield* Effect.forEach(resolvedSteps, collectResolvedStepOutput, { concurrency });
692
693
yield* Effect.forEach(results, renderStepOutput, { discard: true });
929
const rootRepoLintPolicySteps = (repoRoot: string): ReadonlyArray<QualityTaskStep> => [
930
repoCliStep(repoRoot, "lint:effect-imports", ["laws", "effect-imports", "--check"]),
931
repoCliStep(repoRoot, "lint:terse-effect", ["laws", "terse-effect", "--check"]),
932
repoCliStep(repoRoot, "lint:effect-fn", ["laws", "effect-fn", "--check"]),
933
repoCliStep(repoRoot, "lint:native-runtime", ["laws", "native-runtime", "--check"]),
934
repoCliStep(repoRoot, "lint:dual-arity", ["laws", "dual-arity", "--check"]),
935
repoCliStep(repoRoot, "lint:allowlist", ["laws", "allowlist-check"]),
936
repoCliStep(repoRoot, "lint:package-test-imports", ["lint", "package-test-imports"]),
937
repoCliStep(repoRoot, "lint:schema-first", ["lint", "schema-first"]),
938
bunxStep(repoRoot, "lint:jsdoc", ["eslint", "."]),
939
repoCliStep(repoRoot, "lint:jsdoc-module-tags", ["quality", "jsdoc-module-tags"]),
940
repoCliStep(repoRoot, "lint:docgen", ["docgen", "check"]),
941
bunxStep(repoRoot, "lint:spell", ["cspell", "."]),
942
bunxStep(repoRoot, "lint:markdown", ["markdownlint-cli2"]),
943
repoCliStep(repoRoot, "lint:circular", ["lint", "circular"]),
944
repoCliStep(repoRoot, "lint:tooling-tagged-errors", ["lint", "tooling-tagged-errors"]),
945
bunxStep(repoRoot, "lint:typos", ["typos"]),
979
yield* runStepGroup("lint:policies", rootRepoLintPolicySteps(repoRoot), LINT_POLICY_GROUP_CONCURRENCY);
Attack-path analysis
Severity remains medium. Static evidence confirms the vulnerable grouped lint path is real, introduced in the cited commit, and reachable from the repository's pull_request lint workflow via package.json scripts. The unbounded fold of piped stdout/stderr, retained for all grouped results with concurrency 3, is a credible memory-exhaustion path. However, the affected component is CI/developer tooling rather than a deployed runtime service, and the proven impact is availability-only. Existing workflow timeouts and ephemeral runner isolation limit blast radius, and there is no demonstrated confidentiality, integrity, identity, or production runtime compromise.
Path
Attacker-controlled PR/repo contents --pull_request or push triggers--> GitHub Actions Check workflow lint lane --lint matrix runs bun run lint--> package.json bun run lint -> beep-cli lint --beep-cli lint--> runRootLintTask runs repo-wide lint policies --non-fix root lint routes to grouped policy runner--> runStepGroup concurrency 3 --runs policy subprocesses concurrently--> collectResolvedStepOutput pipes and folds all stdout/stderr --unbounded retained output--> CI process/runner memory exhaustion
The finding is real and reachable in CI. The commit added a grouped root lint path where child stdout and stderr are piped and concatenated into a single string with no size limit. runStepGroup then collects all step results before rendering, so multiple subprocess outputs can be retained concurrently. The root lint policy group includes repo-wide tools whose output is influenced by repository contents, and the Check workflow runs bun run lint on pull_request and push. CI passes --affected, but shouldRunRepoWideSteps only suppresses repo-wide checks for --filter or --since, so the grouped policy path remains reachable. Prior validation used an executable PoC that reproduced the collector behavior and triggered a heap OOM under constrained memory. Severity remains medium: this is a credible CI/build availability issue, but it does not expose production services, secrets, tenant data, or code execution beyond already executing CI on repository contents.
Likelihood
High - Reachability is plausible through normal PR CI or developer lint runs, and repository contents can influence lint/spell/markdown output. Exploitation still requires producing sufficiently large output and may be gated by repository CI approval settings for public contributors, so likelihood is not high. | Remote network vector
Impact
Medium - The demonstrated impact is availability of the build/lint process: unbounded retained subprocess output can crash or OOM the CI lint job. There is no evidence of production service exposure, secret disclosure, auth bypass, data compromise, or privilege escalation. GitHub runner isolation and job timeouts reduce blast radius, but project CI resources and required checks can still be disrupted.
Assumptions
The public GitHub pull_request workflow is allowed to run the lint lane for attacker-controlled PR contents, subject to any repository approval settings not represented in the checkout.
An attacker can add or modify repository files that cause eslint, cspell, markdownlint-cli2, typos, or internal policy tools to emit very large stdout/stderr.
The CI/runtime process has finite heap or memory limits, so retaining enough subprocess output can terminate the lint process or runner.
No cloud APIs were queried; conclusions are based only on repository artifacts and supplied validation evidence.
Ability to submit a pull request or otherwise cause CI/developer lint to run on attacker-controlled repository contents
Ability to create lint/spell/markdown/type-policy output large enough to stress process memory
Root lint must run without an explicit --filter or --since argument; CI passes --affected, which does not suppress repo-wide policy steps
Controls
GitHub Actions job timeout for lint lane is 20 minutes
Workflow concurrency cancels in-progress runs for the same workflow/ref
GitHub-hosted runner isolation limits blast radius to the CI job/runner
Workflow permissions are limited to contents:read and pull-requests:write, but no control limits stdout/stderr buffering
CI passes --affected, but repo-wide lint policy checks still run because only --filter and --since suppress them
Blindspots
Repository-level GitHub Actions approval rules for first-time or forked contributors are not visible in the checkout.
Exact memory limits for the actual Bun/Effect runtime in CI were not measured from repository artifacts.
The validation PoC faithfully reproduced the collector behavior but the full project CLI could not be dynamically run in the prior stage due to dependency installation issues.
No assessment was made of private self-hosted runner deployments outside the checked-in workflow, which could increase operational impact.
Finding content copied
Finding content copied
```
