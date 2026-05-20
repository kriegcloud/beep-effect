# CSF-029: Status helper replays unescaped upload logs

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 2945c63 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | initiatives/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced. The commit added proof-upload-status.mjs, including the vulnerable sink that reads and prints log content verbatim. The upload server's tainted log source already existed, but this commit introduced a normal operator workflow that replays those log lines into an interactive terminal.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Recent proof upload log lines are sanitized before replay: control characters are replaced and each rendered line is length-bounded.
- Remediation status: `fixed-in-branch`
- Verification command: `node --check initiatives/stack-installer/ops/proof-upload-status.mjs`
- Changed files:
  - initiatives/stack-installer/ops/proof-upload-status.mjs
- Verification notes:
  - Script syntax checks pass and source review confirms recent log output flows through sanitizeLogLine.

## Evidence Paths

- initiatives/stack-installer/ops/proof-upload-server.mjs
- initiatives/stack-installer/ops/proof-upload-status.mjs

## Validation Notes From Codex

- Confirm the suspected sink was introduced by this commit and is part of the normal operator workflow.
- Confirm an authenticated requester controls decoded fileName data after token validation in the upload server.
- Confirm the decoded attacker-controlled filename reaches proof-upload-server.log without control-character escaping.
- Confirm proof-upload-status.mjs reads recent log lines and writes them to stdout without sanitization.
- Confirm an end-to-end PoC causes raw ANSI/OSC bytes to appear in the status helper output.

## Sanitized Finding Content

```text
Finding
Status helper replays unescaped upload logs
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
2945c63
2:30 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced. The commit added proof-upload-status.mjs, including the vulnerable sink that reads and prints log content verbatim. The upload server's tainted log source already existed, but this commit introduced a normal operator workflow that replays those log lines into an interactive terminal.
The newly added status helper reads proof-upload-server.log and prints the last log lines directly to stdout. The upload server can write attacker-controlled decoded path text into that log when an authenticated requester supplies an unsupported upload filename. A malicious proof uploader, or anyone with a leaked upload token, can send a request such as a PUT to an /upload/<percent-encoded-ANSI-or-OSC-sequence> path; the server decodes that filename and logs it. When the coordinator later runs proof-upload-status.mjs, those bytes are replayed without escaping. Depending on the terminal, this can spoof status output, hide warnings, or trigger terminal features such as OSC clipboard writes. The helper also reads the whole log file before taking the last 12 lines, which increases the operational impact of log abuse, but the primary introduced issue is the unescaped log replay.
Validation
Confirm the suspected sink was introduced by this commit and is part of the normal operator workflow.
Confirm an authenticated requester controls decoded fileName data after token validation in the upload server.
Confirm the decoded attacker-controlled filename reaches proof-upload-server.log without control-character escaping.
Confirm proof-upload-status.mjs reads recent log lines and writes them to stdout without sanitization.
Confirm an end-to-end PoC causes raw ANSI/OSC bytes to appear in the status helper output.
Validation artifact
Evidence
initiatives/stack-installer/ops/proof-upload-server.mjs
75
const fileName = decodeURIComponent(requestUrl.pathname.replace(/^\/upload\//, ""));
76
77
if (!allowedFileNames.has(fileName)) {
78
logRequest(request, 400, "unsupported-file-name", fileName);
79
send(response, 400, `Unsupported file name: ${fileName}`);
initiatives/stack-installer/ops/proof-upload-status.mjs
94
const logText = await readText(logPath);
95
const commandsText = await readText(commandsPath);
96
const leakScanText = `${logText}\n${commandsText}`;
97
const logLines = logText.trim() ? logText.trim().split(/\r?\n/).slice(-12) : [];
112
console.log("recent upload log:");
113
console.log(logLines.length > 0 ? logLines.join("\n") : "- none");
Attack-path analysis
The original low severity is appropriate. Static evidence and the prior executable PoC support that the vulnerability is real and reachable in the documented Stack Installer proof-transfer workflow. However, the exposed component is an internal temporary ops helper, normally on localhost or a private tailnet address, token-gated, and triggered only when a coordinator runs a status command. The impact is limited to terminal output integrity and terminal feature side effects rather than data, identity, network, or code-execution compromise.
Path
Token-holding proof uploader --uses bearer token--> PUT/POST /upload/<encoded control bytes> --request path is decoded--> proof-upload-server.mjs decodes filename after token validation --unsupported-file-name details logged--> Unsupported filename logged to proof-upload-server.log --status helper reads log file--> proof-upload-status.mjs prints recent log lines verbatim --raw bytes printed to terminal--> Coordinator terminal output spoofing/control-sequence effects
The finding is real. The upload server checks the bearer token, decodes the /upload/ path suffix, and logs unsupported filenames without escaping. The start helper redirects server stdout/stderr to proof-upload-server.log. The newly added status helper reads that log and prints the last lines directly to stdout. An intended proof uploader, or anyone with the temporary upload token, can therefore inject percent-encoded ANSI/OSC bytes into the coordinator's terminal when the coordinator runs the documented status command. The impact is limited to terminal-output integrity and terminal feature side effects, not server compromise or data exfiltration, and exploitation requires an internal temporary service, token possession, and coordinator interaction.
Likelihood
Low - Exploitation is plausible but constrained: the server is temporary and private by design, the attacker needs the bearer token or must be an intended uploader, and the coordinator must run the status helper after the malicious request.
Impact
Low - The demonstrated effect is terminal-control/log-replay injection against the coordinator terminal, enabling status spoofing, hiding warnings, or terminal-specific OSC effects such as clipboard writes. There is no proven code execution, authentication bypass, persistent compromise, or sensitive data disclosure from the affected scripts.
Assumptions
The proof upload helper is used only for the documented Stack Installer P1 proof-transfer workflow, not as an always-on public production service.
Attackers need either to be an intended proof uploader who has the temporary bearer token or to obtain that token through a separate leak.
Terminal-control impact depends on the coordinator running the status helper in an interactive terminal that honors ANSI/OSC sequences.
temporary proof-upload server running
attacker can reach the configured host and port, normally localhost or a private tailnet address
attacker has the temporary bearer upload token
coordinator later runs proof-upload-status.mjs in a terminal
Controls
temporary random bearer upload token
token and command files written with 0600 permissions
default bind address is 127.0.0.1
documented use is a coordinator tailnet/private endpoint
successful uploads restricted to approved bundle filenames
no escaping/sanitization for rejected filename details in logs or status output
Blindspots
Static repository review cannot confirm how often operators bind this helper to non-local interfaces.
No cloud APIs or live infrastructure were queried, so actual network ACLs or tailnet policy were not verified.
Terminal behavior varies; some terminals may ignore OSC sequences while others may honor them.
The affected directory is operator/proof tooling rather than the main runtime, so product deployment exposure may be lower than repository workflow exposure.
Finding content copied
Finding content copied
```
