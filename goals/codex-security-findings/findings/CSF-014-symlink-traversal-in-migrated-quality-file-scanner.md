# CSF-014: Symlink traversal in migrated quality file scanner

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 1b110cb |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/tool/cli |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the migrated quality scanner no longer skips symlinked files/directories when discovering dtslint and test TypeScript files, unlike the deleted scripts that used Dirent checks and skipped non-regular entries.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The migrated quality file scanner now checks each discovered child path with readLink before stat and skips symlinks instead of following them while recursing.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/tooling/tool/cli/test/quality-tasks.test.ts && bunx tsc --noEmit --pretty false -p packages/tooling/tool/cli/tsconfig.json`
- Changed files:
  - packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts
  - packages/tooling/tool/cli/test/quality-tasks.test.ts
- Verification notes:
  - The quality task tests pass and the CLI typecheck passes.

## Evidence Paths

- packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts

## Validation Notes From Codex

- Confirm the migrated scanner uses fs.stat and recurses on resolved directories without lstat, Dirent, realpath, or repository-boundary checks.
- Confirm dtslint/test quality lanes invoke this scanner over repository-controlled roots (apps, packages, tooling, infra).
- Confirm discovered paths are written directly into synthetic tsconfig include lists and passed to tsgo.
- Confirm the pre-commit/deleted scripts used readdirSync(..., { withFileTypes: true }) with Dirent.isDirectory()/isFile(), which skips directory symlinks.
- Dynamically demonstrate that a symlinked test directory is followed by the new scanner, includes a file whose realpath is outside the repo, and that a symlink loop causes a non-zero scanner failure/DoS.

## Sanitized Finding Content

```text
Finding
Symlink traversal in migrated quality file scanner
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
1b110cb
11:20 PM May 8, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the migrated quality scanner no longer skips symlinked files/directories when discovering dtslint and test TypeScript files, unlike the deleted scripts that used Dirent checks and skipped non-regular entries.
This commit replaces the old Node helper scripts with a new shared collectFiles implementation in packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts. The previous scripts used readdirSync(..., { withFileTypes: true }) and only recursed when Dirent.isDirectory() was true, which does not follow symlinked directories. The new implementation calls fs.stat(childPath) and recurses whenever the resolved target is a Directory, without checking realPath/lstat or ensuring the canonical path remains under the repository/search root. As a result, a malicious repository/PR can add a symlink under apps/, packages/, tooling/, or infra/ (for example under a test/ path) that points to a large or special filesystem tree such as /proc, /, or another host directory. The check lanes then recursively walk that target and may spend the full CI timeout, fail on inaccessible paths, or feed files outside the repo to tsgo via the generated tsconfig include list. This is an introduced security-relevant denial-of-service/path-boundary regression in tooling that processes attacker-controlled repository contents.
Validation
Confirm the migrated scanner uses fs.stat and recurses on resolved directories without lstat, Dirent, realpath, or repository-boundary checks.
Confirm dtslint/test quality lanes invoke this scanner over repository-controlled roots (apps, packages, tooling, infra).
Confirm discovered paths are written directly into synthetic tsconfig include lists and passed to tsgo.
Confirm the pre-commit/deleted scripts used readdirSync(..., { withFileTypes: true }) with Dirent.isDirectory()/isFile(), which skips directory symlinks.
Dynamically demonstrate that a symlinked test directory is followed by the new scanner, includes a file whose realpath is outside the repo, and that a symlink loop causes a non-zero scanner failure/DoS.
Validation artifact
Evidence
packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts
571
for (const entry of entries) {
572
const childPath = path.join(currentPath, entry);
573
const normalized = normalizePath(childPath);
574
const stat = yield* fs.stat(childPath).pipe(
575
Effect.mapError(
576
(cause) =>
577
new QualityScriptCommandError({
578
message: `Failed to stat ${childPath}.`,
579
cause,
580
})
581
)
582
);
583
584
if (stat.type === "Directory") {
585
if (!shouldSkipDirectory(`${normalized}/`, entry)) {
586
files = A.appendAll(files, yield* visit(childPath));
587
}
588
continue;
589
}
590
591
if (stat.type === "File" && shouldInclude(normalized, entry)) {
592
files = A.append(files, childPath);
620
const syntheticConfig = {
621
extends: path.join(repoRoot, baseTsconfig),
622
references: [],
623
include: discoveredFiles,
624
exclude: [],
689
const discoveredFiles = yield* Effect.forEach(
690
dtslintSearchRoots,
691
(root) =>
692
collectFiles(
693
path.join(repoRoot, root),
694
(normalized, name) => Str.includes("/dtslint/")(normalized) && /\.tst\.[^.]+$/u.test(name),
695
thunkFalse
696
),
697
{ concurrency: 1 }
698
).pipe(Effect.map(A.flatten));
699
700
if (A.isReadonlyArrayEmpty(discoveredFiles)) {
701
yield* Console.log("[check:dtslint:tsgo] no dtslint files found");
702
return;
703
}
704
705
yield* Console.log(`[check:dtslint:tsgo] checking ${A.length(discoveredFiles)} file(s) with tsconfig.dtslint.json`);
706
yield* runTsgoWithSyntheticConfig(
707
repoRoot,
708
"check:dtslint:tsgo",
709
discoveredFiles,
710
"dtslint.tsconfig.json",
711
"tsconfig.dtslint.json",
712
{},
713
extraArgs
714
);
738
const discoveredFiles = yield* Effect.forEach(
739
testSearchRoots,
740
(root) =>
741
collectFiles(
742
path.join(repoRoot, root),
743
(normalized, name) =>
744
Str.includes("/test/")(normalized) &&
745
!pathContainsSegment(normalized, ignoredTestPathSegments) &&
746
/\.(?:cts|mts|ts|tsx)$/u.test(name),
747
(normalized, name) =>
748
A.contains(ignoredTestDirectoryNames as ReadonlyArray<string>, name) ||
749
pathContainsSegment(normalized, ignoredTestPathSegments)
750
),
751
{ concurrency: 1 }
752
).pipe(Effect.map(A.flatten));
762
const syntheticConfig = {
763
extends: path.join(repoRoot, "tsconfig.json"),
764
references: [],
765
include: discoveredFiles,
766
exclude: [],
Attack-path analysis
Medium is retained. The code evidence confirms a real symlink traversal regression: fs.stat follows symlinked directories and recursion has no realpath boundary or cycle control. The vulnerable path is reachable from the checked-in pull_request CI workflow via bun run check, and validation evidence demonstrated both outside-repository inclusion and an ELOOP crash pattern. The impact is meaningful but limited to build/CI availability and possible parsing of out-of-repo files in an ephemeral runner. The workflow has timeouts, reduced token permissions, and no demonstrated executable sink or secret disclosure, so the issue does not justify high or critical severity.
Path
Attacker-controlled PR repository contents --pull_request triggers checkout and verification--> GitHub Actions check workflow on ubuntu-latest --Run verification lane executes bun run check--> bun run check root quality task --root check appends repo-wide tsgo quality steps--> quality dtslint-tsgo/test-tsgo collectFiles --recursive scanner uses fs.stat and recurses on Directory--> fs.stat follows symlinked directory outside search root --unbounded traversal/ELOOP/out-of-repo include--> CI timeout/failure or outside paths passed to tsgo include
The finding is real and reachable in the CI build path. The migrated collectFiles helper enumerates directory names, calls fs.stat(childPath), and recurses whenever the resolved target is a Directory, with no lstat, symlink, visited-realpath, or repository-boundary check. The dtslint and test tsgo lanes call this helper over apps, packages, tooling, and infra, which are repository-controlled roots. Root check tasks include these lanes in bun run check unless explicit --filter/--since scoping is used; the GitHub pull_request workflow invokes bun run check with --affected and --summarize, so the vulnerable repo-wide scans still run. The impact is CI/build availability: a malicious PR can add a symlink loop or link to a large/special filesystem tree and make the scanner fail or consume the lane timeout. This does not demonstrate code execution or reliable secret disclosure, so medium severity is appropriate rather than high or critical.
Likelihood
High - The exploit payload is simple to create in Git as a symlink and the public pull_request workflow runs the check lane that reaches the vulnerable scanner. Likelihood is moderated by possible GitHub workflow approval for first-time contributors and by the fact that the target is CI rather than a continuously exposed service. | Remote network vector
Impact
Medium - A crafted symlink can make the check lane traverse outside the repository, fail on ELOOP/inaccessible paths, or spend the CI timeout. The affected asset is CI/build availability and runner minutes. There is no proven arbitrary code execution, authorization bypass, or reliable secret exfiltration from this bug alone.
Assumptions
The repository accepts pull requests or otherwise runs GitHub Actions on attacker-controlled branches.
GitHub Actions checkout on ubuntu-latest preserves repository symlinks, which is normal for Git symlink entries on Linux runners.
Unknown first-time-contributor workflow approval settings may add a manual gate, but same-repository branches or approved PRs still run the workflow.
.specs content was excluded from consideration.
Attacker can place a symlink under apps, packages, tooling, or infra in a branch or pull request.
The check lane runs repository-wide quality steps; CI passes --affected but not an explicit --filter or --since argument, so the vulnerable repo-wide steps remain enabled.
The symlink target is large, cyclic, special, or outside the repository in a way that makes traversal expensive or fail.
Controls
GitHub Actions job timeout limits the check lane to 20 minutes.
Workflow concurrency cancels in-progress jobs for the same workflow/ref.
Workflow token permissions are limited to contents:read and pull-requests:write.
Setup step sets cache-write:false, reducing cache poisoning exposure.
Repo-wide quality scans are skipped when explicit --filter or --since arguments are used, but the CI PR path uses --affected so this control does not apply there.
No executable sink is shown for discovered files; they are parsed/checked by tsgo rather than executed.
Blindspots
Static-only repository review cannot confirm actual GitHub repository visibility, fork workflow approval settings, or branch protection configuration.
The checkout lacks installed node_modules, so the actual Bun CLI was not re-executed during this stage; the prior validation used source review plus a minimal executable Node PoC mirroring the scanner behavior.
No cloud or GitHub APIs were called, so runner-level secrets exposure behavior is inferred from workflow files and standard GitHub Actions behavior.
Only repository artifacts were reviewed; external CI settings, organization-level Actions policies, and runner hardening are unknown.
Finding content copied
Finding content copied
```
