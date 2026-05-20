# CSF-035: SAST skips changed JavaScript/TypeScript symlinks

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | b07de7b |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/tool/cli |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a SAST bypass: changed JavaScript/TypeScript symlinks are now silently filtered out before Semgrep is invoked.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The SAST changed-file lane no longer silently drops JavaScript or TypeScript symlinks. It rejects changed symlink paths before invoking Semgrep, so a symlink cannot be used to bypass the scan.
- Remediation status: `fixed-in-current-head`
- Verification command: `rg -n 'Changed JavaScript/TypeScript symlink paths are not accepted by the SAST scan|fs\.readLink\(absolutePath\)' packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts`
- Changed files:
  - none
- Verification notes:
  - Source review confirms changed JS/TS symlink paths produce a typed quality error.

## Evidence Paths

- packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts

## Validation Notes From Codex

- Confirm the SAST lane obtains changed JavaScript/TypeScript paths from git diff using extension pathspecs.
- Confirm the commit added a realPath equality check after the existence check and before Semgrep invocation.
- Demonstrate that git reports a changed tracked *.ts symlink whose target is inside the repository but has no scanned extension.
- Demonstrate that the old exists-only behavior would pass that symlink while the current realpath-equality filter drops it.
- Confirm that when all candidates are dropped, the command skips or invokes Semgrep without the symlink path, making the SAST bypass plausible.

## Sanitized Finding Content

```text
Finding
SAST skips changed JavaScript/TypeScript symlinks
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
b07de7b
12:01 AM May 9, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a SAST bypass: changed JavaScript/TypeScript symlinks are now silently filtered out before Semgrep is invoked.
The changed-file SAST lane collects changed paths matching JavaScript and TypeScript extensions, then filters them before passing them to Semgrep. This commit added a realPath equality check that excludes every symlink, even when the symlink target is inside the repository. A contributor can add or modify a tracked path such as `src/entry.ts` that is a symlink to another in-repo file with executable TypeScript/JavaScript content, while the target file itself does not match the scanned extensions. Git will report the symlink path as a changed `*.ts` file, but the new check removes it from `semgrepFiles`, so Semgrep is never run on that code path. This weakens a security control and can hide issues from CI. A safer approach would be to either fail CI on changed JS/TS symlinks, or resolve symlinks only if the canonical target remains under the repository and then scan the resolved target as part of the Semgrep target set.
Validation
Confirm the SAST lane obtains changed JavaScript/TypeScript paths from git diff using extension pathspecs.
Confirm the commit added a realPath equality check after the existence check and before Semgrep invocation.
Demonstrate that git reports a changed tracked *.ts symlink whose target is inside the repository but has no scanned extension.
Demonstrate that the old exists-only behavior would pass that symlink while the current realpath-equality filter drops it.
Confirm that when all candidates are dropped, the command skips or invokes Semgrep without the symlink path, making the SAST bypass plausible.
Validation artifact
Evidence
packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts
407
const trackedFilesOutput = yield* collectSuccessfulOutput(
408
new QualityTaskStep({
409
label: "sast:changed-files",
410
command: "git",
411
args: [
412
"diff",
413
"--name-only",
414
"--diff-filter=ACMR",
415
"origin/main...HEAD",
416
"--",
417
"*.ts",
418
"*.tsx",
419
"*.js",
420
"*.jsx",
421
"*.mjs",
422
"*.cjs",
423
],
433
const semgrepFiles = yield* Effect.forEach(
434
candidateFiles,
435
Effect.fn(function* (filePath) {
436
const absolutePath = path.join(repoRoot, filePath);
437
const exists = yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(thunkFalse));
438
if (!exists) {
439
return O.none<string>();
440
}
441
442
const canonicalPath = yield* fs.realPath(absolutePath).pipe(Effect.option);
443
if (O.isNone(canonicalPath) || canonicalPath.value !== path.resolve(absolutePath)) {
444
return O.none<string>();
445
}
446
447
return O.some(filePath);
457
yield* Console.log("[github-checks] sast: semgrep");
458
yield* runFixedStep(repoRoot, "sast:semgrep", "docker", [
459
"run",
460
"--rm",
461
"-e",
462
"SEMGREP_SEND_METRICS=off",
463
"-v",
464
`${repoRoot}:/src`,
465
"-w",
466
"/src",
467
"semgrep/semgrep",
468
"semgrep",
469
"scan",
470
"--config",
471
"p/typescript",
472
"--config",
473
"p/javascript",
474
"--config",
475
"p/security-audit",
476
"--config",
477
"p/secrets",
478
"--disable-version-check",
479
"--timeout",
480
"20",
481
...semgrepFiles,
482
]);
Attack-path analysis
Severity remains low. The code evidence supports a real security-control bypass: changed JS/TS paths are collected, symlinks are silently filtered by the `realPath` equality check, and Semgrep receives only the reduced `semgrepFiles` set. The validation PoC also demonstrates the behavior. But the affected surface is build/developer tooling, not a public runtime service; it requires SCM/PR control; and the repository’s checked-in SAST workflow uses a separate `semgrep/semgrep-action` job rather than this changed-file CLI path. Therefore the realistic impact is weakening one optional or secondary SAST lane, not direct compromise.
Path
Contributor-controlled commit/PR --adds/modifies--> Tracked `*.ts`/`*.js` symlink --selected by extension pathspec--> `git diff --name-only` changed-file collection --candidate file filtered--> `realPath !== resolve` filter --symlink omitted from arguments--> Semgrep invoked only with remaining `semgrepFiles` --code not scanned by this lane--> SAST finding hidden from affected lane
The finding is real for the affected CLI lane. `runSastScan` gathers changed files using `git diff --name-only` with JavaScript/TypeScript extension pathspecs, then builds `semgrepFiles`. The added canonical-path check drops every symlink because `realPath` resolves the target while `path.resolve` preserves the symlink path. If all candidates are dropped, the lane logs that SAST is skipped; otherwise only the remaining files are passed to Semgrep. The path is reachable through `beep quality github-checks sast` and through the audit task wiring. Impact is limited: this is a build-time security-control bypass requiring contributor/PR control and reliance on this specific lane. The checked-in GitHub workflow also contains a separate Semgrep action that does not call this affected CLI code path, reducing confidence that the repository’s primary CI SAST is bypassed by this commit alone.
Likelihood
Low - Creating a tracked symlink is straightforward for a contributor, and the validation evidence demonstrates the filter behavior. However, exploitation depends on contributor/PR access and on this specific CLI SAST lane being relied upon; the main checked-in workflow uses a separate Semgrep action for SAST.
Impact
Low - The direct effect is bypass of one SAST target-selection path, not runtime code execution, data theft, authentication bypass, or cloud privilege escalation. It can hide vulnerable or malicious code from that lane, but exploitation still requires the code to be introduced and later accepted/merged, and the repository contains an independent Semgrep workflow that may catch issues.
Assumptions
The repository checkout and .github workflows are representative of the CI configuration for this commit.
A realistic attacker for this path is a contributor or PR author who can introduce tracked repository content, including symlinks.
Severity is assessed for the affected CLI SAST lane, not for unrelated runtime HTTP, desktop, or AI SDK services.
Attacker can submit or land a commit/PR containing a tracked JavaScript/TypeScript-extension symlink.
The affected `beep quality github-checks sast` or `pre-push` lane is run and relied upon as a security gate.
The symlink target is not otherwise scanned by another effective SAST control.
Controls
No network listener, public port, ingress, or load balancer is involved in the affected path.
Reachability is gated by SCM/PR ability and by whether maintainers run or require the affected CLI lane.
A separate checked-in GitHub Actions Semgrep job exists and does not use the affected changed-file filtering code.
The affected lane excludes `.repos/` paths but does not safely handle symlinked JavaScript/TypeScript candidates.
Blindspots
Static-only review cannot prove which CI checks are required by branch protection outside the repository.
Direct execution of the full repo CLI was not confirmed in this environment because dependencies were unavailable in the earlier validation stage.
The behavior of the separate `semgrep/semgrep-action` job on symlinked paths was not tested here.
External CI configurations not stored in this repository could rely on the affected `audit:github sast` lane.
Finding content copied
Finding content copied
```
