# CSF-004: Alternate proof URL leaks upload bearer token

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 1722c83 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | goals/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a credential exfiltration flaw in proof-upload-status.mjs by adding token-authenticated alternate endpoint checks against an unvalidated URL base. The documented workflow now encourages use of this new option.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The proof upload server no longer accepts bearer tokens in query strings. Operator instructions use Authorization headers, the landing page is generated from the configured advertised URL rather than request Host, and the status response avoids leaking absolute coordinator paths.
- Remediation status: `fixed-in-branch`
- Verification command: `node goals/stack-installer/ops/proof-upload-smoke.mjs`
- Changed files:
  - goals/stack-installer/ops/proof-upload-server.mjs
  - goals/stack-installer/ops/proof-upload-smoke.mjs
  - goals/stack-installer/ops/proof-upload-status.mjs
- Verification notes:
  - The smoke test covers authenticated endpoints, generated operator commands, token file permissions, and status responses.

## Evidence Paths

- goals/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
- goals/stack-installer/ops/proof-upload-status.mjs

## Validation Notes From Codex

- Confirm the commit introduced a user-controlled alternate URL path and documented its use. - [x] Confirm the alternate URL is not validated beyond trailing-slash trimming. - [x] Confirm the helper sends Authorization: [redacted authorization header] to whatever urlBase it receives. - [x] Confirm proof-upload-token.txt is read and reused for alternate /status, /commands, and /next-actions requests. - [x] Dynamically demonstrate an attacker-controlled alternate server receives the bearer token, and confirm the same token gates protected proof-upload operations.

## Sanitized Finding Content

````text
Finding
Alternate proof URL leaks upload bearer token
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
1722c83
4:34 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a credential exfiltration flaw in proof-upload-status.mjs by adding token-authenticated alternate endpoint checks against an unvalidated URL base. The documented workflow now encourages use of this new option.
The status checker now accepts an arbitrary --alternate-url-base, reads the coordinator-local proof upload token from proof-upload-token.txt, and uses the same endpointStatus helper to send Authorization: [redacted authorization header] requests to the alternate base for /status, /commands, and /next-actions. There is no parsing, allowlist, same-host/Tailnet validation, or proof that the alternate URL actually maps to the coordinator before the token is sent. If an attacker can get an operator to paste a malicious alternate URL, typo-squat the expected endpoint, or otherwise influence this documented command, the attacker-controlled server receives the upload token in request headers. That token can then be used to access protected proof status/commands/next-actions and, if the coordinator endpoint is reachable, upload or replace proof bundles.
Validation
Confirm the commit introduced a user-controlled alternate URL path and documented its use. - [x] Confirm the alternate URL is not validated beyond trailing-slash trimming. - [x] Confirm the helper sends Authorization: [redacted authorization header] to whatever urlBase it receives. - [x] Confirm proof-upload-token.txt is read and reused for alternate /status, /commands, and /next-actions requests. - [x] Dynamically demonstrate an attacker-controlled alternate server receives the bearer token, and confirm the same token gates protected proof-upload operations.
Validation artifact
Evidence
goals/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
289
node goals/stack-installer/ops/proof-upload-status.mjs \
290
--host '<coordinator-tailscale-ip>' \
291
--port 8765 \
292
--alternate-url-base 'http://<coordinator-magic-dns-name>:8765' \
293
--output-root output/stack-installer/p1-live \
294
--fail-on-missing
295
```
296
297
This status command reports upload server health, returned bundle presence,
298
platform artifact directories, private upload files, and the detached proof
299
watcher files/state when the detached watcher has been started. When
300
`--alternate-url-base` is provided, it also verifies the MagicDNS health,
301
landing, status, commands, and next-actions paths without printing the token.
goals/stack-installer/ops/proof-upload-status.mjs
18
const host = argAfter("--host", "127.0.0.1");
19
const port = Number.parseInt(argAfter("--port", "8765"), 10);
20
const outputRoot = path.resolve(argAfter("--output-root", "output/stack-installer/p1-live"));
21
const primaryUrlBase = `http://${host}:${port}`;
22
const alternateUrlBase = argAfter("--alternate-url-base", "").replace(/\/+$/, "");
215
const endpointStatus = async (pathname, options = {}, urlBase = primaryUrlBase) => {
216
try {
217
const response = await fetch(`${urlBase}${pathname}`, {
218
headers: options.token ? { Authorization: `[redacted authorization value]` } : undefined,
219
});
296
const tokenText = (await readText(tokenPath)).trim();
297
const logText = await readText(logPath);
298
const commandsText = await readText(commandsPath);
299
const leakScanText = `${logText}\n${commandsText}`;
300
const logLines = recentLines(logText);
301
const watchPidText = await readText(watchPidPath);
302
const watchPid = Number.parseInt(watchPidText.trim(), 10);
303
const watchLogText = await readText(watchLogPath);
304
const watchCommandText = await readText(watchCommandPath);
305
const watchLeakScanText = `${watchLogText}\n${watchCommandText}`;
306
const watchLogLines = recentLines(watchLogText);
307
const health = await healthStatus();
308
const landing = await endpointStatus("/");
309
const statusWithoutToken = await endpointStatus("/status", { expectStatus: 403 });
310
const statusWithToken = tokenText ? await endpointStatus("/status", { token: tokenText }) : undefined;
311
const commandsWithoutToken = await endpointStatus("/commands", { expectStatus: 403 });
312
const commandsWithToken = tokenText ? await endpointStatus("/commands", { token: tokenText }) : undefined;
313
const nextActionsWithoutToken = await endpointStatus("/next-actions", { expectStatus: 403 });
314
const nextActionsWithToken = tokenText ? await endpointStatus("/next-actions", { token: tokenText }) : undefined;
315
const alternateHealth = alternateUrlBase ? await healthStatus(alternateUrlBase) : undefined;
316
const alternateLanding = alternateUrlBase ? await endpointStatus("/", {}, alternateUrlBase) : undefined;
317
const alternateStatusWithToken =
318
alternateUrlBase && tokenText ? await endpointStatus("/status", { token: tokenText }, alternateUrlBase) : undefined;
319
const alternateCommandsWithToken =
320
alternateUrlBase && tokenText ? await endpointStatus("/commands", { token: tokenText }, alternateUrlBase) : undefined;
321
const alternateNextActionsWithToken =
322
alternateUrlBase && tokenText
323
? await endpointStatus("/next-actions", { token: tokenText }, alternateUrlBase)
Attack-path analysis
Adjusted from high to medium. Static evidence and the validation PoC support that the credential exfiltration behavior is real: proof-upload-status.mjs forwards the proof upload bearer token to an unvalidated alternate URL, and proof-upload-server.mjs accepts that token for protected reads and approved uploads. The downgrade is based on probability and blast radius: the attack depends on operator interaction or influence over an internal documented command; the service is intended for localhost/Tailnet rather than broad public ingress; the stolen credential is scoped to a temporary Stack Installer proof-transfer helper; and upload writes are constrained to two bundle names under outputRoot. This remains a security issue because the token crosses a trust boundary and can compromise proof workflow confidentiality/integrity, but the evidence does not support high severity in the main product threat model.
Path
Coordinator operator running documented status command --passes --alternate-url-base--> proof-upload-status.mjs --sends Authorization header--> Attacker-controlled alternate URL --attacker reuses stolen token if endpoint reachable--> proof-upload-server.mjs on port 8765 --allows protected reads and approved bundle uploads--> Protected status/commands/next-actions and approved proof bundles
The finding is real: the committed status helper accepts --alternate-url-base with only trailing-slash trimming, reads the coordinator-local proof upload token, and passes that token to endpointStatus calls against the alternate base for /status, /commands, and /next-actions. The documented P1 runbook now instructs operators to use this option. The proof server accepts the same Authorization: [redacted authorization header] for protected status/command endpoints and for PUT/POST uploads of approved proof bundle filenames. Validation evidence also demonstrated an attacker-controlled alternate HTTP server receiving the bearer token. Severity should be reduced from high to medium because exploitation requires operator interaction or influence over an internal runbook command, the affected component is temporary Stack Installer proof-transfer tooling rather than the main product runtime, the proof server is intended for localhost/Tailnet rather than public internet exposure, and the token scope is limited to proof status/commands/next-actions and two approved bundle filenames rather than broad cloud or application credentials.
Likelihood
High - The bug triggers reliably once an operator supplies an attacker-controlled alternate URL, and the documented workflow makes the option plausible. However, exploitation is not unauthenticated direct access to a public service: it requires operator interaction or URL influence, a local token file, and usually Tailnet/local-network reachability to use the stolen token for protected coordinator operations. | Remote network vector
Impact
Medium - A stolen token exposes protected proof status, commands, and next-actions, and can authorize replacement/upload of approved proof bundle filenames if the proof server is reachable. This is meaningful credential and workflow integrity impact, but it is limited to a temporary operator proof-transfer service and does not directly expose main application data, cloud credentials, arbitrary filesystem writes, or code execution.
Assumptions
The coordinator/operator runs the repository-provided proof-upload-status.mjs command with --alternate-url-base as documented.
A realistic attacker can influence the alternate URL through phishing, copy/paste instructions, typo-squatting of a pasted URL, DNS/control of the supplied hostname, or another operator-input path.
For full post-exfiltration impact, the attacker can also reach the proof upload server endpoint, for example because they are on the same Tailnet/local network or the endpoint is otherwise exposed.
Operator executes proof-upload-status.mjs
proof-upload-token.txt exists under the selected outputRoot
--alternate-url-base is supplied and resolves to attacker-controlled infrastructure
Attacker can reach the proof upload server to use the stolen token for protected operations, if integrity impact is claimed
Controls
Proof server requires a bearer token for /status, /commands, /next-actions, and upload writes
Token is generated by start-proof-upload-window.mjs and written to proof-upload-token.txt with 0600 permissions
Proof server defaults to 127.0.0.1, although the runbook uses a coordinator Tailscale IP
Uploads are restricted to stack-installer-p1-macos.tgz and stack-installer-p1-windows.zip
Upload size is bounded by maxBytes
Missing control: no alternate URL allowlist, same-host validation, Tailnet/MagicDNS validation, TLS identity verification, or suppression of Authorization headers for untrusted alternate URLs
Blindspots
Static repository review cannot confirm the real Tailnet, DNS, firewall, or whether port 8765 is ever exposed to the public internet.
The earlier threat model did not explicitly cover goals/stack-installer/ops, so scope is inferred from repository documentation rather than a declared production deployment model.
The downstream trust placed in uploaded proof bundles for release or PR decisions is not fully shown in the inspected files, limiting confidence in broader supply-chain impact.
No cloud IAM, Kubernetes, or load-balancer manifests for this helper were present in the inspected evidence.
Finding content copied
Finding content copied
````
