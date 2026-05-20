# CSF-057: Untrusted ffprobe lookup can execute attacker code

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 7b7260b |
| Reported age | 3w ago |
| Capture method | dom-fallback |
| Owner area | tooling/cli |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

Introduced a new security bug in the new Files command. The command should avoid setting cwd to the untrusted media directory for ffprobe, resolve ffprobe from a trusted absolute path, or require an explicit trusted --ffprobe path and sanitize PATH.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- tooling/cli/src/commands/Files/index.ts

## Validation Notes From Codex

- Confirm the commit introduced/exposed a files sort-and-rename command reachable from the root CLI.
- Confirm --with-dimensions on video files reaches probeVideoDimensions and runFfprobe.
- Confirm runFfprobe spawns a bare ffprobe name rather than a trusted absolute path.
- Confirm attacker-controlled PATH/current-directory conditions can execute a planted ffprobe with the same argv/cwd shape.
- Confirm full real CLI end-to-end execution in this container; blocked by missing dependencies/catalog install failure, and Bun child-cwd-only lookup behaved more safely than Node.

## Sanitized Finding Content

```text
Finding
Untrusted ffprobe lookup can execute attacker code
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
7b7260b
7:38 PM Apr 27, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a new security bug in the new Files command. The command should avoid setting cwd to the untrusted media directory for ffprobe, resolve ffprobe from a trusted absolute path, or require an explicit trusted --ffprobe path and sanitize PATH.
When --with-dimensions is used on video files, the command spawns "ffprobe" without resolving it to a trusted absolute path. It also sets the child process cwd to path.dirname(file.sourcePath), which is the user-selected dataset directory. If that directory is attacker-controlled and command lookup considers the current directory, or if PATH contains an empty/current/relative entry, an attacker can place a malicious ffprobe executable in the dataset. Running the CLI against that dataset will execute the attacker binary with the user's privileges. The file path itself is passed safely as an argv element, so this is not shell injection; the issue is untrusted executable search path / binary planting.
Validation
Confirm the commit introduced/exposed a files sort-and-rename command reachable from the root CLI.
Confirm --with-dimensions on video files reaches probeVideoDimensions and runFfprobe.
Confirm runFfprobe spawns a bare ffprobe name rather than a trusted absolute path.
Confirm attacker-controlled PATH/current-directory conditions can execute a planted ffprobe with the same argv/cwd shape.
Confirm full real CLI end-to-end execution in this container; blocked by missing dependencies/catalog install failure, and Bun child-cwd-only lookup behaved more safely than Node.
Validation artifact
Evidence
tooling/cli/src/commands/Files/index.ts
491
const runFfprobe = Effect.fn("Files.runFfprobe")(function* (
492
file: SortableFile
493
): Effect.fn.Return<string, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
494
const path = yield* Path.Path;
495
const command = ChildProcess.make(
496
"ffprobe",
497
["-v", "error", "-select_streams", "v:0", "-show_streams", "-of", "json", file.sourcePath],
498
{
499
cwd: path.dirname(file.sourcePath),
500
stderr: "pipe",
501
stdout: "pipe",
502
}
503
);
543
const probeVideoDimensions = Effect.fn("Files.probeVideoDimensions")(function* (
544
file: SortableFile
545
): Effect.fn.Return<MediaDimensions, FilesCommandError, Path.Path | ChildProcessSpawner.ChildProcessSpawner> {
546
const outputText = yield* runFfprobe(file);
547
const output = yield* decodeFfprobeOutputJson(outputText).pipe(
862
const withDimensionsFlag = Flag.boolean("with-dimensions").pipe(
863
Flag.withDescription("Include probed image or video dimensions in generated media filenames")
864
);
865
866
const filesSortAndRenameCommand = Command.make(
867
"sort-and-rename",
868
{
869
dir: dirFlag,
870
dryRun: dryRunFlag,
871
prefix: prefixFlag,
872
withDimensions: withDimensionsFlag,
873
},
874
Effect.fn(function* ({ dir, dryRun, prefix, withDimensions }) {
875
yield* runFilesProgram(sortAndRenameFiles(dir, prefix, dryRun, withDimensions));
Attack-path analysis
Adjusted from high to ignore for the provided product threat model. The code-level issue is real: tooling/cli/src/commands/Files/index.ts:495-500 spawns a bare ffprobe while using the selected media directory as cwd, and :862-887 exposes it through --with-dimensions. But the affected component is private local monorepo tooling rather than the desktop sidecar, runtime server, AI SDK service, sandbox, persistence, or other focused product surface. Exploitability is also local and user-assisted, requiring an attacker-controlled dataset and vulnerable executable search semantics. If this CLI is later treated as a supported end-user tool for untrusted datasets, the technical issue should be fixed and would likely rate around medium rather than high in this repository context.
Path
Attacker-controlled dataset directory --victim selects directory--> files sort-and-rename --with-dimensions ----with-dimensions reaches video probing--> probeVideoDimensions/runFfprobe --spawns bare executable name--> ChildProcess.make("ffprobe", ..., { cwd: dataset }) --PATH/current-directory search resolves attacker binary--> Planted ffprobe executes as local CLI user
The source evidence supports the underlying bug: the new files command reaches video dimension probing when --with-dimensions is supplied, and runFfprobe spawns the bare executable name "ffprobe" while setting cwd to the selected file's directory. That is a credible binary-planting/search-path issue under vulnerable PATH or platform lookup semantics and can result in same-user local code execution. However, this is a local private tooling CLI, not a public service or the main desktop/sidecar/AI SDK surface described in the threat model. Exploitation also requires user action and environment-specific executable lookup behavior, so the original high rating is not appropriate for the in-scope product risk.
Likelihood
Low - The path requires a victim to run a local developer/tooling command against attacker-controlled media with --with-dimensions, plus PATH/current-directory lookup behavior that resolves the planted ffprobe. It is not remotely reachable and validation noted Bun-specific behavior may not resolve child cwd-only PATH entries in some cases.
Impact
Medium - Successful exploitation can execute arbitrary attacker code as the local user running the CLI, which is security-relevant. The impact is limited to same-user local execution and does not demonstrate privilege escalation, tenant compromise, server compromise, or direct exposure of product secrets.
Assumptions
The attacker can provide or influence the contents of the directory passed to the local files sort-and-rename command.
The victim runs the local CLI with --with-dimensions on video media in that directory.
The runtime/platform executable lookup can resolve a planted ffprobe via a current-directory, empty, or relative PATH entry, or equivalent platform-specific search behavior.
Victim locally runs the beep CLI or root files script.
Victim selects an attacker-controlled media/dataset directory.
Victim uses the --with-dimensions flag so video probing is reached.
A malicious ffprobe executable is resolvable before the trusted system ffprobe through PATH/current-directory search semantics.
Controls
Array-form argv is used, so this is not shell metacharacter injection through the media filename.
The command only processes direct regular files and uses canonical path checks for selected files.
The prefix is validated to avoid path separators, dots, and NUL bytes.
No repository evidence indicates public network exposure for this command; it is a local CLI path.
@beep/repo-cli is marked private in package.json, reducing evidence of broad end-user distribution.
Blindspots
Static-only repository review did not install dependencies or run the full CLI.
Exact executable lookup behavior for the repository-pinned Bun 1.3.13 was not verified here; prior validation reported nuanced Bun 1.2.14 behavior.
Actual distribution and real-world use of @beep/repo-cli outside the monorepo could not be proven from repository artifacts alone.
Windows-specific executable search behavior was not validated in this Linux container.
Finding content copied
Finding content copied
```
