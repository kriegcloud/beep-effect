# CSF-025: ps failure path can leak process command lines

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 9097bfc |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | initiatives/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the added ps-based watcher status check can disclose unfiltered process-table stdout on ps/spawn failure. It should avoid returning stdout from failed ps invocations, set an explicit bounded maxBuffer with safe error handling, and only ever report sanitized filtered fields.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The proof upload status helper no longer includes raw ps stdout or stderr in failure details. It reports a generic ps-unavailable detail and keeps process table content out of status output when ps fails.
- Remediation status: `fixed-in-branch`
- Verification command: `node --check initiatives/stack-installer/ops/proof-upload-status.mjs`
- Changed files:
  - initiatives/stack-installer/ops/proof-upload-status.mjs
- Verification notes:
  - Script syntax checks pass and source review confirms the failure path reports only a generic detail.

## Evidence Paths

- initiatives/stack-installer/ops/proof-upload-status.mjs

## Validation Notes From Codex

- Confirm the commit introduced a watcher process status check and status-output printing.
- Confirm the ps invocation captures full command lines via command= and lacks an explicit bounded/safe maxBuffer policy.
- Confirm the failure branch treats any nonzero/null status as unavailable and can return raw result.stdout as diagnostic detail.
- Confirm only the success path filters/sanitizes processes, while the unavailable path is printed directly in the active processes line.
- Demonstrate with the real application that inflated process-table stdout causes ps/spawnSync failure and leaks unrelated command-line data in script output.

## Sanitized Finding Content

```text
Finding
ps failure path can leak process command lines
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
9097bfc
4:25 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the added ps-based watcher status check can disclose unfiltered process-table stdout on ps/spawn failure. It should avoid returning stdout from failed ps invocations, set an explicit bounded maxBuffer with safe error handling, and only ever report sanitized filtered fields.
The commit adds watcherProcesses(), which runs `ps -eo pid=,ppid=,stat=,command=` to inspect local watcher processes. The success path filters the process list before reporting only pid/ppid/stat, but the failure path returns `(result.stderr || result.stdout || "ps unavailable").trim()` as diagnostic detail. Node's spawnSync can return a non-zero/null status with partial stdout when output exceeds maxBuffer, and that stdout would be the unfiltered process table including command lines for unrelated processes. The script later prints this detail in the `active processes` line. A local attacker who can inflate the process table or run long command lines could cause this audit/status command to disclose process command-line arguments if the operator runs it and shares or stores its output.
Validation
Confirm the commit introduced a watcher process status check and status-output printing.
Confirm the ps invocation captures full command lines via command= and lacks an explicit bounded/safe maxBuffer policy.
Confirm the failure branch treats any nonzero/null status as unavailable and can return raw result.stdout as diagnostic detail.
Confirm only the success path filters/sanitizes processes, while the unavailable path is printed directly in the active processes line.
Demonstrate with the real application that inflated process-table stdout causes ps/spawnSync failure and leaks unrelated command-line data in script output.
Validation artifact
Evidence
initiatives/stack-installer/ops/proof-upload-status.mjs
148
const watcherProcesses = (root) => {
149
const result = spawnSync("ps", ["-eo", "pid=,ppid=,stat=,command="], {
150
encoding: "utf8",
151
});
152
153
if (result.status !== 0) {
154
return {
155
available: false,
156
detail: (result.stderr || result.stdout || "ps unavailable").trim(),
157
pids: [],
423
console.log(
424
`- active processes: ${watcherProcessStatus.available ? watcherProcessStatus.detail : `unknown (${watcherProcessStatus.detail})`}`
425
);
426
console.log(`- stale process check: ${watcherProcessOk ? "ok" : "too-many-watchers"}`);
Attack-path analysis
Severity remains low. Static evidence confirms the bug: the failure path returns raw `ps` stdout, and that detail is printed. Validation evidence also demonstrated ENOBUFS/partial stdout with the real script. However, this is coordinator-side local ops tooling, not a public product endpoint; the attack requires local same-host process influence and user/operator action; and the resulting impact is disclosure of process command lines rather than direct compromise. Probability × impact therefore supports low rather than medium/high, and the finding should not be ignored because the command is documented in active stack-installer P1 workflows.
Path
Local process table / attacker-inflated argv --ps reads full command lines--> proof-upload-status.mjs watcherProcesses() --default spawnSync buffer can fail after partial stdout--> spawnSync ps failure with retained stdout --failure detail uses raw stdout--> active processes status output --operator stores or shares status output--> Shared logs/audit output with process command lines
The finding is real and introduced by the referenced commit. `watcherProcesses()` runs `ps` with full `command=` output, filters and reduces fields only on the success path, but on failure returns `(result.stderr || result.stdout || "ps unavailable").trim()`. That detail is printed directly in the `active processes` status line. Node `spawnSync` can fail after retaining partial stdout when output exceeds its buffer, so an inflated process table can cause unfiltered command lines for unrelated local processes to appear in operator status output. The component is a documented coordinator proof-status helper, not a public service or main desktop runtime, and exploitation requires local same-host process influence plus operator execution and output exposure. Impact is limited information disclosure of process command lines, so the original low severity is appropriate.
Likelihood
Low - Exploitation is not remotely reachable from the application network surface. It requires same-host local process execution or equivalent influence, a large enough process table to trigger ps/spawn failure with partial stdout, and operator execution plus sharing/logging of output. These are plausible but relatively constrained preconditions.
Impact
Low - The leak can expose local process command-line arguments, which may include tokens or sensitive paths. It does not provide code execution, authorization bypass, direct file read, or automatic remote exfiltration, and the proof upload token path is designed to avoid argv exposure. Impact is therefore limited confidentiality loss.
Assumptions
The status helper is run by a coordinator/operator on a local workstation or private tailnet host as documented by the stack-installer P1 proof runbook.
The attacker has local process execution on the same host, or another realistic way to inflate the local process table/argv output before the operator runs the status command.
Disclosure becomes security-relevant when the operator stores or shares the status output with someone who otherwise could not read that host's process table.
Some local processes may include tokens, paths, or other sensitive values in command-line arguments, even though the proof upload token itself is normally passed via environment variable and private files.
local same-host ability to create or influence processes with large/long command lines
operator runs initiatives/stack-installer/ops/proof-upload-status.mjs
ps or Node spawnSync fails after producing partial stdout, such as ENOBUFS from the default maxBuffer
operator output is visible to logs, shared audit artifacts, or an untrusted recipient
sensitive values are present in local process command lines
Controls
Proof upload server defaults to 127.0.0.1 and requires bearer token for status/commands/next-actions/upload endpoints.
Proof upload token and command/log/pid files are written with 0600 permissions in the start script.
The server process receives the proof upload token through environment rather than argv.
The vulnerable status helper has no authentication boundary because it is a local CLI tool; OS process-table permissions are the main control.
Blindspots
Static review did not enumerate all environments where the status command may run, such as CI, shared coordinator hosts, or automated log collection.
Actual process-table visibility depends on OS and mount options such as Linux hidepid, which are not specified in repository artifacts.
The repository does not prove whether operators routinely share full status output in public PRs, chat, or logs.
The status helper is in an initiatives/ops path rather than packaged app files, so production distribution exposure may be lower than active proof-runbook exposure.
Finding content copied
Finding content copied
```
