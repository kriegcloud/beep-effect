# CSF-047: Unvalidated PID is negated for process-group kill

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 6eb1d33 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | goals/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

An availability bug was introduced. The intended fix stops stale watcher children, but it does so by negating an untrusted/stale PID without guarding special values or verifying watcher ownership.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The proof-watch startup helper validates the PID and expected command line before using a negative PID to terminate a process group.
- Remediation status: `fixed-in-branch`
- Verification command: `node --check goals/stack-installer/ops/start-proof-watch-window.mjs`
- Changed files:
  - goals/stack-installer/ops/start-proof-watch-window.mjs
- Verification notes:
  - Script syntax checks pass and source review confirms validation is required before process-group kill.

## Evidence Paths

- goals/stack-installer/ops/start-proof-watch-window.mjs

## Validation Notes From Codex

- Identify the changed cleanup behavior and verify it negates the recorded PID before signaling.
- Verify the PID source is --output-root/proof-watch.pid and can be stale/operator-controlled before the script overwrites it.
- Verify validation is limited to integer parsing and process.kill(pid, 0), with no watcher ownership check and no guard for PID/PGID special values.
- Dynamically demonstrate that a non-watcher process group whose PGID matches the pid-file value is terminated by --replace-existing.
- Attempt stronger runtime tooling where applicable; direct DoS reproduction succeeded, while valgrind/gdb were unavailable for this Node.js target.

## Sanitized Finding Content

```text
Finding
Unvalidated PID is negated for process-group kill
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
6eb1d33
4:22 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
An availability bug was introduced. The intended fix stops stale watcher children, but it does so by negating an untrusted/stale PID without guarding special values or verifying watcher ownership.
The commit changes replacement cleanup from killing the recorded PID to calling process.kill(-pid). The PID is read from proof-watch.pid under the operator-selected output root and is only checked with process.kill(pid, 0). There is no validation that the PID is greater than 1, that it belongs to the previously spawned watcher, or that the PID file has not been tampered with. On POSIX systems, negative PIDs target process groups, and the special value -1 targets all signalable processes. Therefore a pid file containing 1 can cause process.kill(-1) when the script is run with --replace-existing and sufficient permissions. Other stale or malicious PID values can also terminate an unrelated process group whose PGID matches the recorded PID, rather than just the old watcher parent.
Validation
Identify the changed cleanup behavior and verify it negates the recorded PID before signaling.
Verify the PID source is --output-root/proof-watch.pid and can be stale/operator-controlled before the script overwrites it.
Verify validation is limited to integer parsing and process.kill(pid, 0), with no watcher ownership check and no guard for PID/PGID special values.
Dynamically demonstrate that a non-watcher process group whose PGID matches the pid-file value is terminated by --replace-existing.
Attempt stronger runtime tooling where applicable; direct DoS reproduction succeeded, while valgrind/gdb were unavailable for this Node.js target.
Validation artifact
Evidence
goals/stack-installer/ops/start-proof-watch-window.mjs
37
const stopProcessGroup = (pid) => {
38
try {
39
process.kill(-pid);
40
return;
41
} catch {
42
// Fall back to the parent PID for platforms/shells without process-group signaling.
43
}
44
45
process.kill(pid);
48
const stopExisting = async () => {
49
const rawPid = await fs.promises.readFile(pidPath, "utf8").catch(() => "");
50
const pid = Number.parseInt(rawPid.trim(), 10);
51
52
if (!Number.isInteger(pid) || !processExists(pid)) {
53
return;
54
}
55
56
if (!replaceExisting) {
57
throw new Error(
58
`Proof watcher already appears to be running with pid ${pid}; pass --replace-existing to restart it.`
59
);
60
}
61
62
stopProcessGroup(pid);
63
await new Promise((resolve) => setTimeout(resolve, 500));
Attack-path analysis
Although the PID-negation bug is real and validated, it is in a local goals/stack-installer/ops proof helper rather than an exposed product/runtime service. The attack path requires local write/tamper access to the selected output root and operator interaction with --replace-existing. Impact is availability-only for signalable local process groups and usually same-user/self-impact; severe effects depend on atypical elevated execution or shared writable output directories. Therefore the original medium rating overstates threat-model relevance, and this should be ignored for main product criticality, with remediation still recommended as defensive hardening.
Path
Tampered proof-watch.pid --pid file is read from selected output root--> Operator runs start-proof-watch-window.mjs --replace-existing ----replace-existing enables cleanup--> processExists(pid) checks only signalability --no ownership or special-value validation--> process.kill(-pid) targets PGID --negative PID signals process group--> Unrelated local process group receives SIGTERM
The described behavior is technically valid: start-proof-watch-window.mjs reads proof-watch.pid from the selected output root, validates only integer syntax and signalability, then calls process.kill(-pid), which can signal an unrelated POSIX process group. Prior validation demonstrated this with an executable PoC. However, the affected code is a local coordinator/initiative ops helper, not a network-exposed service or packaged application path. Exploitation requires local pid-file tampering and user interaction via --replace-existing, and the impact is local availability loss rather than data exposure, code execution, privilege escalation, or cross-tenant compromise.
Likelihood
Low - The vulnerable code path is easy to trigger once the PID file is controlled, but reaching it as an attacker requires local filesystem tampering and a user/operator running the helper with --replace-existing. There is no remote or default product exposure.
Impact
Ignore - The proven effect is local process-group termination. That can disrupt an operator workstation or CI/coordinator shell, but it does not by itself expose secrets, execute attacker code, bypass authorization, or compromise a product service. Broader kill(-1)-style effects require special PID values plus sufficient local privileges.
Assumptions
The affected helper is executed manually by a coordinator/operator from a local checkout.
POSIX negative-PID semantics apply; on non-POSIX platforms the process-group kill path may not behave the same way.
A realistic attacker must be able to create or tamper with the selected output root's proof-watch.pid before the operator runs the helper with --replace-existing.
No cloud APIs or live infrastructure were queried; analysis is limited to repository artifacts.
local filesystem write or tamper ability for the operator-selected output root
operator/user runs goals/stack-installer/ops/start-proof-watch-window.mjs
operator/user includes --replace-existing
target PID or PGID is signalable by the helper process
POSIX process-group signaling for process.kill(-pid) impact
Controls
Local CLI execution only
Requires explicit --replace-existing flag
PID/log files are intended to be private 0600 after the helper writes them
OS signal permissions limit which processes can be killed
No ingress, load balancer, service account, or network listener for the affected helper
Blindspots
Static review did not prove every possible distribution path for goals/stack-installer/ops, but package files and Tauri config reviewed do not show it as a packaged application entry point.
No live environment was inspected, so unusual operator deployments with shared writable output roots or elevated scheduled execution cannot be fully excluded.
Analysis excluded .specs per instruction and did not call cloud APIs.
Finding content copied
Finding content copied
```
