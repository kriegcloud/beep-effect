# CSF-006: Malformed Host header crashes proof upload server

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | ea4b6d4 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | goals/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a remotely triggerable denial-of-service bug in the newly added `proof-upload-server.mjs` helper. The server should avoid trusting the Host header when building logging URLs, or catch URL parsing failures inside `logRequest()` and use a safe fallback.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The proof upload server no longer parses attacker-controlled Host headers to build public URLs. It uses the configured advertised URL when present and a normalized configured host/port fallback otherwise.
- Remediation status: `fixed-in-branch`
- Verification command: `node --check goals/stack-installer/ops/proof-upload-server.mjs && node goals/stack-installer/ops/proof-upload-smoke.mjs`
- Changed files:
  - goals/stack-installer/ops/proof-upload-server.mjs
  - goals/stack-installer/ops/proof-upload-smoke.mjs
- Verification notes:
  - Script syntax checks pass and the smoke test validates the served landing page and generated commands.

## Evidence Paths

- goals/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
- goals/stack-installer/ops/proof-upload-server.mjs

## Validation Notes From Codex

- Confirm the newly added helper uses the untrusted HTTP Host header as the base for new URL() in the main request path.
- Confirm the error handler calls logRequest() and that logRequest() repeats the same unsafe Host-based URL construction without its own try/catch.
- Demonstrate a normal valid Host request succeeds and leaves the server alive, so the helper itself can run in the container.
- Send a malformed Host header over the network before authentication and observe whether the real Node process exits.
- Preserve a minimal PoC and crash log showing the stack reaches logRequest() from the catch block.

## Sanitized Finding Content

```text
Finding
Malformed Host header crashes proof upload server
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
ea4b6d4
2:00 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a remotely triggerable denial-of-service bug in the newly added `proof-upload-server.mjs` helper. The server should avoid trusting the Host header when building logging URLs, or catch URL parsing failures inside `logRequest()` and use a safe fallback.
The added upload server constructs URL objects using `request.headers.host` as the base URL. If a client sends a syntactically invalid Host header, such as `Host: [`, `new URL()` throws. The main handler catches the first exception, but the catch block calls `logRequest()`, which repeats the same unsafe URL construction and throws again outside any nested error handling. In Node's default unhandled-rejection/exception behavior this terminates the process. This happens before token validation, so any network client that can reach the tailnet-bound helper can cause a denial of service with a single malformed HTTP request.
Validation
Confirm the newly added helper uses the untrusted HTTP Host header as the base for new URL() in the main request path.
Confirm the error handler calls logRequest() and that logRequest() repeats the same unsafe Host-based URL construction without its own try/catch.
Demonstrate a normal valid Host request succeeds and leaves the server alive, so the helper itself can run in the container.
Send a malformed Host header over the network before authentication and observe whether the real Node process exits.
Preserve a minimal PoC and crash log showing the stack reaches logRequest() from the catch block.
Validation artifact
Evidence
goals/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
261
export STACK_INSTALLER_PROOF_UPLOAD_TOKEN='<one-time-token>'
262
node goals/stack-installer/ops/proof-upload-server.mjs \
263
--host '<coordinator-tailscale-ip>' \
264
--port 8765 \
265
--output-root output/stack-installer/p1-live
goals/stack-installer/ops/proof-upload-server.mjs
27
const logRequest = (request, statusCode, message, details = "") => {
28
const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);
29
const remoteAddress = request.socket.remoteAddress ?? "unknown";
30
const sanitizedPath = `${requestUrl.pathname}${requestUrl.searchParams.has("token") ? "?token=<redacted>" : ""}`;
31
const suffix = details ? ` ${details}` : "";
32
33
console.log(
34
`${new Date().toISOString()} ${request.method ?? "UNKNOWN"} ${sanitizedPath} ${statusCode} ${remoteAddress} ${message}${suffix}`
35
);
43
const server = http.createServer(async (request, response) => {
44
try {
45
const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);
100
} catch (error) {
101
const message = error instanceof Error ? error.message : String(error);
102
103
logRequest(request, 500, "error", message);
104
send(response, 500, message);
Attack-path analysis
Downgraded from high to medium. The vulnerability is validated and reachable in the documented tailnet deployment: proof-upload-server.mjs trusts request.headers.host in new URL() before token validation, and its catch block calls a logger that repeats the unsafe parse, causing process termination. But the affected component is a temporary Stack Installer proof-transfer helper, not the primary product sidecar/AI SDK service; exposure is intended to be internal Tailscale/tailnet rather than internet-facing; and the demonstrated consequence is denial of service for one upload helper only. Under the provided calibration, availability-only disruption of a narrow internal operational service does not meet high severity absent severe business/safety impact or broader compromise.
Path
Tailnet-reachable network client --sends malformed Host--> HTTP request to coordinator IP:8765 with malformed Host --reaches request handler before auth--> Main handler new URL() uses untrusted Host --Invalid URL exception--> Catch block invokes logRequest() --error logging path--> logRequest() repeats unsafe new URL() --second unhandled Invalid URL exception--> Uncaught exception exits Node process
The finding is real: repository code parses attacker-controlled request.headers.host with new URL() in both the main request path and the logging helper. A malformed Host value throws before upload token validation, and the catch block calls the same unsafe logger, producing a second unhandled exception. The helper is documented as a temporary token-gated tailnet upload receiver bound to a coordinator Tailscale IP on port 8765, so an internal/tailnet client can reach it when operators follow the runbook. The impact is availability loss of a single temporary proof-transfer service, not compromise of credentials, data, identity, or the main product control plane.
Likelihood
Medium - Exploitation is technically trivial and unauthenticated once network reachability exists, and validation evidence shows a single malformed Host request exits the process. However, the documented exposure is private tailnet/local-network rather than public internet, and the helper is temporary/manual operational tooling.
Impact
Medium - A successful request can stop the single proof upload helper process and disrupt proof bundle intake. The impact is limited to availability of a temporary operational helper; there is no demonstrated data disclosure, privilege escalation, code execution, cross-tenant access, or compromise of the main application.
Assumptions
The proof upload helper is run from the documented P1 proof transfer runbook.
An attacker has network reachability to the coordinator's Tailscale/tailnet address and port 8765, or is on a compromised/authorized tailnet client.
No external supervisor immediately restarts the Node process after an uncaught exception; no such supervisor is defined in the repository artifacts reviewed.
proof-upload-server.mjs is running
server is bound to a reachable host such as the documented coordinator Tailscale IP
attacker can send an HTTP request with a malformed Host header
Controls
Default bind host is 127.0.0.1 when --host is not supplied
Documented deployment uses a private Tailscale/tailnet address rather than a public internet ingress
STACK_INSTALLER_PROOF_UPLOAD_TOKEN is required for legitimate uploads but does not protect the malformed Host crash path
Allowed filenames and max upload size controls execute only after URL parsing and therefore do not mitigate this crash
No repository-defined rate limit or process supervisor was found for this helper
Blindspots
Repository artifacts do not reveal actual Tailscale ACLs or which clients can reach the coordinator IP.
Repository artifacts do not show whether operators run the helper under a supervisor that would automatically restart it.
The helper may not be running continuously; usage appears tied to temporary P1 proof-transfer windows.
Static review did not identify any public cloud ingress or load balancer for this helper.
Finding content copied
Finding content copied
```
