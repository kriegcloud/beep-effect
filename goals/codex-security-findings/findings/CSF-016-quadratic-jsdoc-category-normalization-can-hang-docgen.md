# CSF-016: Quadratic JSDoc category normalization can hang docgen

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 511daf4 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/tool/cli |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: category validation added in this commit creates a ReDoS/CPU denial-of-service path for docgen when analyzing source files with maliciously long `@category` values.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: JSDoc category normalization now uses a linear scanner instead of repeated regex passes, and category values over 128 characters are rejected before normalization.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/tooling/tool/cli/test/jsdoc-categories.test.ts && bun test packages/tooling/tool/cli/test/docgen.test.ts --test-name-pattern "quality|category"`
- Changed files:
  - packages/tooling/tool/cli/src/commands/Shared/JSDocCategories.ts
  - packages/tooling/tool/cli/test/jsdoc-categories.test.ts
- Verification notes:
  - The JSDoc category test suite passes, including the overlong-value regression, and docgen quality/category tests still pass.

## Evidence Paths

- packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts
- packages/tooling/tool/cli/src/commands/Shared/JSDocCategories.ts

## Validation Notes From Codex

- Confirm the checked-out commit and locate the introduced category normalization regex.
- Confirm untrusted @category values are extracted from JSDoc/leading comment text without a length bound and are normalized during issue generation.
- Confirm docgen analyze/check reach the normalization path for exported declarations.
- Dynamically demonstrate superlinear runtime/timeout with an attacker-shaped uppercase-only category string.
- Execute the full docgen CLI against a malicious package; attempted but blocked by missing workspace dependencies (Cannot find module '@beep/repo-utils').

## Sanitized Finding Content

```text
Finding
Quadratic JSDoc category normalization can hang docgen
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
511daf4
1:35 AM May 6, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: category validation added in this commit creates a ReDoS/CPU denial-of-service path for docgen when analyzing source files with maliciously long `@category` values.
This commit introduces `normalizeJSDocCategoryKey`, which runs `/([A-Z]+)([A-Z][a-z])/g` over raw `@category` values extracted from source JSDoc. A category value consisting of a long uppercase-only string forces repeated greedy matching and backtracking before failing, producing roughly quadratic runtime. Because `extractJsDocCategoryValues` accepts the full tag comment text without a length bound and `categoryIssueMessages` normalizes every collected value during export analysis, a malicious repository can place a very large uppercase `@category` value in an exported symbol and cause `docgen analyze` or `docgen check` to hang or exhaust CI/build CPU. A fix should either bound category value length before normalization or replace the regex chain with a linear scanner.
Validation
Confirm the checked-out commit and locate the introduced category normalization regex.
Confirm untrusted @category values are extracted from JSDoc/leading comment text without a length bound and are normalized during issue generation.
Confirm docgen analyze/check reach the normalization path for exported declarations.
Dynamically demonstrate superlinear runtime/timeout with an attacker-shaped uppercase-only category string.
Execute the full docgen CLI against a malicious package; attempted but blocked by missing workspace dependencies (Cannot find module '@beep/repo-utils').
Validation artifact
Evidence
packages/tooling/tool/cli/src/commands/Docgen/internal/Operations.ts
534
const extractJsDocCategoryValues = (node: Node): ReadonlyArray<string> =>
535
pipe(
536
getJsDocs(node),
537
A.flatMap((doc) =>
538
A.flatMap(doc.getTags(), (tag) =>
539
tag.getTagName() === "category" ? [Str.trim(tag.getCommentText() ?? "")] : A.empty<string>()
540
)
608
const categoryIssueMessages: (categoryValues: ReadonlyArray<string>) => ReadonlyArray<string> = flow(
609
A.map(normalizeJSDocCategory),
610
A.filter((category) => category.status === "rejected" || category.status === "unknown"),
611
A.map((category) => category.message ?? `Invalid @category value ${category.original}.`)
612
);
734
const presentTags = pipe([...extractJsDocTags(node), ...inheritedTags], A.dedupe);
735
const categoryValues = pipe([...extractJsDocCategoryValues(node), ...inheritedCategoryValues], A.dedupe);
736
const missingTags = missingRequiredTags(presentTags, requiredTags);
737
const categoryIssues = categoryIssueMessages(categoryValues);
packages/tooling/tool/cli/src/commands/Shared/JSDocCategories.ts
269
export const normalizeJSDocCategoryKey: (value: string) => string = flow(
270
Str.trim,
271
Str.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2"),
272
Str.replace(/([a-z0-9])([A-Z])/g, "$1-$2"),
Attack-path analysis
Severity remains medium. The vulnerability is validated by code reachability and executable timing evidence, and repository artifacts show docgen/check is invoked by normal scripts and CI. The impact is meaningful availability loss for build/documentation jobs, especially on pull requests or when analyzing untrusted repositories. It is not high or critical because the affected component is developer/CI tooling, exposure is not a public network service, exploitation requires attacker-controlled repo contents to be analyzed, CI timeouts bound the hang, and there is no evidence of code execution, data exfiltration, identity compromise, or persistent runtime service outage.
Path
Attacker-controlled TypeScript source with exported symbol and long @category --source file selected for package analysis--> docgen source scanning via ts-morph --exported declarations are analyzed--> Raw @category extraction without length bound --categoryIssueMessages maps values through normalization--> normalizeJSDocCategoryKey regex chain --quadratic regexp runtime consumes CPU--> CI/local docgen CPU denial of service
The finding is real and reachable in the repository's build/documentation tooling. normalizeJSDocCategoryKey trims raw category text and applies /([A-Z]+)([A-Z][a-z])/g before other replacements. docgen extracts @category comment text from JSDoc without a length limit, then categoryIssueMessages normalizes every collected value while analyzing exported declarations. Root scripts and CI invoke docgen/lint paths, including pull_request workflows. Prior validation reproduced near-quadratic runtime and a timeout using the exact normalization pipeline. Impact is limited to availability of a local/CI docgen process; there is no evidence of remote network exposure, code execution, data access, secrets exposure, or privilege escalation. Medium remains appropriate.
Likelihood
Medium - Exploitation is straightforward once attacker-controlled source is analyzed, and the PoC shows the regex behavior. However, the path requires code/repository-content contribution and execution of build/docgen tooling; there is no unauthenticated runtime network endpoint.
Impact
Medium - A malicious category string can hang or heavily slow docgen analyze/check, affecting local developer runs and CI availability. Impact is confined to CPU/time consumption of the build/tooling process and does not expose secrets, modify data, execute code, or cross tenant/service boundaries.
Assumptions
A realistic attacker can contribute or propose TypeScript source changes that are analyzed by the repository docgen/check workflow, such as via a pull request or by supplying a repository to a maintainer/developer.
GitHub Actions or local developer quality checks run the documented docgen/check paths against changed source files.
Static analysis is limited to repository artifacts; no cloud APIs or live CI settings were queried.
Attacker-controlled repository source content containing an exported TypeScript declaration
A very long uppercase-only JSDoc @category value on or inherited by that export
Execution of beep-cli docgen analyze/check or the repository lint/docgen CI workflow
Controls
No network listener, ingress, or load balancer is involved for this issue.
The vulnerable package is a private workspace CLI, not a deployed public service.
GitHub Actions verify jobs have timeout-minutes values, which cap a hang but still allow failed jobs and CI-minute consumption.
Workflow concurrency cancels in-progress jobs for the same workflow/ref, limiting repeated self-overlap.
Blindspots
Static analysis cannot determine repository settings for running GitHub Actions from untrusted fork pull requests or whether maintainer approval is required.
Full CLI execution in the provided environment was blocked earlier by missing workspace dependencies, so runtime reachability relies on static call-chain evidence plus direct reproduction of the normalization pipeline.
No live CI behavior, queue limits, or billing protections were queried.
Finding content copied
Finding content copied
```
