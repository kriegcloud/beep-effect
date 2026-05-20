# CSF-026: Proof watch helper trusts PID and file paths

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 76e62e1 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | goals/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the new proof-watch starter adds PID-file based process termination and private-file writes under a caller-controlled output root without symlink or PID ownership validation.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The proof-watch helper now validates PID files before sending signals, rejects pid <= 1, and refuses to terminate a process group unless /proc/<pid>/cmdline matches the expected p1:proof:watch invocation for the configured output root.
- Remediation status: `fixed-in-branch`
- Verification command: `node --check goals/stack-installer/ops/start-proof-watch-window.mjs`
- Changed files:
  - goals/stack-installer/ops/start-proof-watch-window.mjs
- Verification notes:
  - Script syntax checks pass and source review confirms PID validation precedes process and process-group termination.

## Evidence Paths

- goals/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
- goals/stack-installer/ops/start-proof-watch-window.mjs

## Validation Notes From Codex

- Confirm the helper derives PID/log/command paths directly from caller-controlled --output-root.
- Confirm --replace-existing causes an existing PID file to be trusted and killed without ownership/command validation.
- Reproduce arbitrary same-user process termination by planting an unrelated live PID in proof-watch.pid.
- Confirm private-file writes use symlink-following APIs on paths inside the output root.
- Reproduce writable-file clobber/chmod through a planted symlink and confirm docs recommend the risky flow.

## Sanitized Finding Content

````text
Finding
Proof watch helper trusts PID and file paths
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
76e62e1
3:20 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the new proof-watch starter adds PID-file based process termination and private-file writes under a caller-controlled output root without symlink or PID ownership validation.
The added start-proof-watch-window.mjs script treats files under --output-root as trusted control files. If that directory is writable or pre-populated by another local user/process, a malicious proof-watch.pid can cause the documented --replace-existing flow to send SIGTERM to an arbitrary same-user process. The same directory is also used for proof-watch-command.txt, proof-watch.log, and proof-watch.pid writes with fs.writeFile/chmod/open, which follow symlinks; a planted symlink can cause the helper to truncate or overwrite another file writable by the operator. This is limited to local/operator contexts, but output/ is an ignored artifact inbox and the new docs recommend running the helper with --replace-existing, making stale or tampered control files plausible. Safer behavior would keep PID/log/control files in a trusted 0700 directory, use lstat/O_NOFOLLOW-style checks, atomically create files, and verify a PID belongs to the expected watcher before killing it.
Validation
Confirm the helper derives PID/log/command paths directly from caller-controlled --output-root.
Confirm --replace-existing causes an existing PID file to be trusted and killed without ownership/command validation.
Reproduce arbitrary same-user process termination by planting an unrelated live PID in proof-watch.pid.
Confirm private-file writes use symlink-following APIs on paths inside the output root.
Reproduce writable-file clobber/chmod through a planted symlink and confirm docs recommend the risky flow.
Validation artifact
Evidence
goals/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
392
node goals/stack-installer/ops/start-proof-watch-window.mjs \
393
--output-root output/stack-installer/p1-live \
394
--watch-attempts 1440 \
395
--watch-interval-ms 5000 \
396
--replace-existing
397
```
398
399
The detached helper writes private `proof-watch.log`, `proof-watch.pid`, and
400
`proof-watch-command.txt` files under the ignored output root.
goals/stack-installer/ops/start-proof-watch-window.mjs
18
const outputRoot = path.resolve(argAfter("--output-root", "output/stack-installer/p1-live"));
19
const attempts = Number.parseInt(argAfter("--watch-attempts", "1440"), 10);
20
const intervalMs = Number.parseInt(argAfter("--watch-interval-ms", "5000"), 10);
21
const replaceExisting = hasArg("--replace-existing");
22
23
const pidPath = path.join(outputRoot, "proof-watch.pid");
24
const logPath = path.join(outputRoot, "proof-watch.log");
25
const commandPath = path.join(outputRoot, "proof-watch-command.txt");
36
const stopExisting = async () => {
37
const rawPid = await fs.promises.readFile(pidPath, "utf8").catch(() => "");
38
const pid = Number.parseInt(rawPid.trim(), 10);
39
40
if (!Number.isInteger(pid) || !processExists(pid)) {
41
return;
42
}
43
44
if (!replaceExisting) {
45
throw new Error(
46
`Proof watcher already appears to be running with pid ${pid}; pass --replace-existing to restart it.`
47
);
48
}
49
50
process.kill(pid);
51
await new Promise((resolve) => setTimeout(resolve, 500));
54
const writePrivateFile = async (filePath, content) => {
55
await fs.promises.writeFile(filePath, content, { mode: 0o600 });
56
await fs.promises.chmod(filePath, 0o600);
57
};
76
await writePrivateFile(
77
commandPath,
78
[
79
"Stack Installer P1 proof watch command",
80
"",
81
`bun ${watchArgs.map((arg) => JSON.stringify(arg)).join(" ")}`,
82
"",
83
].join("\n")
84
);
85
await writePrivateFile(logPath, "");
86
87
const logHandle = await fs.promises.open(logPath, "a");
88
const child = spawn("bun", watchArgs, {
89
detached: true,
90
stdio: ["ignore", logHandle.fd, logHandle.fd],
91
});
92
93
child.unref();
94
await logHandle.close();
95
await writePrivateFile(pidPath, `${child.pid}\n`);
Attack-path analysis
No severity increase is justified. The code evidence and validation PoCs show a real local bug, but the attack path is confined to operator-run tooling under goals/stack-installer/ops, requires local filesystem influence over --output-root plus operator execution, and results in same-user process termination or writable-file clobbering. This matches the repository threat model's low category for local-only same-OS-account attacks and does not meet high/critical criteria such as remote unauthenticated reachability, RCE, sensitive data exfiltration, authentication bypass, or cross-boundary compromise.
Path
Local writable output root --attacker pre-populates control path--> Planted proof-watch.pid or symlinked control file --operator uses documented helper flow--> Operator runs start-proof-watch-window.mjs --replace-existing --helper trusts PID and symlink-following paths--> process.kill(pid) or writeFile/chmod follows symlink --local availability/integrity impact--> Same-user process killed or writable file clobbered
The finding is real: repository code derives proof-watch control paths directly from --output-root, reads proof-watch.pid, and calls process.kill(pid) when --replace-existing is provided without validating that the PID belongs to the expected watcher. The same helper writes command, log, and PID files using fs.promises.writeFile and chmod, which follow symlinks. The documented handoff recommends running this helper with --replace-existing under the ignored output root. The provided validation evidence demonstrated both same-user process termination and symlink-based writable-file overwrite. Severity remains low because this is local operator tooling with no public ingress, requires local write/prepopulation of the output directory plus operator execution, and the proven impact is limited to local availability/integrity rather than code execution, secret disclosure, tenant compromise, or remote compromise.
Likelihood
Low - The risky --replace-existing flow is documented, and the output directory is an ignored artifact area, so stale or tampered files are plausible. However exploitation still needs local write/prepopulation of the operator-selected directory and user interaction to run the helper.
Impact
Low - Impact is local integrity/availability: SIGTERM to an arbitrary same-user process and overwrite/chmod of an operator-writable file via symlink. There is no demonstrated remote reachability, code execution, privilege escalation beyond the operator context, credential exposure, or cross-tenant/product compromise.
Assumptions
The operator runs the documented proof-watch helper from a checkout and uses the recommended --replace-existing option.
An attacker is a local user or local process able to pre-create or modify files under the selected --output-root, or the output root is a shared artifact inbox with weaker permissions than the operator account.
No cloud APIs or deployed infrastructure were queried; conclusions are based on repository artifacts and provided validation evidence.
local ability to write or pre-populate the operator-selected output root
operator interaction to run goals/stack-installer/ops/start-proof-watch-window.mjs
use of --replace-existing for PID-file process termination
same-UID signal permission for the PID kill impact, or a writable symlink target for file clobber impact
Controls
No public or network listener is created by the proof-watch helper itself.
Exploit requires local filesystem influence over the selected output root.
The PID kill impact is constrained by OS signal permissions, typically same UID.
The documented --replace-existing flag is required for the arbitrary PID termination path.
Files are chmodded 0600 after write, but this occurs too late to prevent symlink following and does not harden the parent directory.
Blindspots
Static review did not inspect all possible operational deployments or local directory permission choices.
The provided validation PoC demonstrates local impact but does not prove a remote or cross-user path in a default installation.
Other ops helpers in the same directory appear to use similar PID/control-file patterns but were not re-scoped as separate findings here.
Finding content copied
Finding content copied
````
