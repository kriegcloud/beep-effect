# CSF-028: Remote status endpoint leaks coordinator output path

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | e24fc20 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | goals/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

A low-severity information disclosure was introduced. The endpoint is authenticated, so exploitation requires possession of the proof upload token, but the endpoint is specifically designed for remote token holders.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The proof upload status endpoint returns only the output root basename, not the coordinator's absolute output path.
- Remediation status: `fixed-in-branch`
- Verification command: `node goals/stack-installer/ops/proof-upload-smoke.mjs`
- Changed files:
  - goals/stack-installer/ops/proof-upload-server.mjs
  - goals/stack-installer/ops/proof-upload-status.mjs
  - goals/stack-installer/ops/proof-upload-smoke.mjs
- Verification notes:
  - The proof upload smoke test validates that status returns outputRootName equal to the basename of the output root.

## Evidence Paths

- goals/stack-installer/ops/proof-upload-server.mjs
- goals/stack-installer/ops/start-proof-upload-window.mjs

## Validation Notes From Codex

- Confirm outputRoot is canonicalized to an absolute local path with path.resolve.
- Confirm uploadStatus() includes outputRoot in the JSON response body.
- Confirm GET /status returns uploadStatus() to requests possessing the shared upload token.
- Confirm generated operator/proof-machine instructions expose /status as a remote token-authenticated endpoint.
- Confirm dynamically that unauthenticated access is denied but authenticated /status discloses the absolute coordinator path.

## Sanitized Finding Content

```text
Finding
Remote status endpoint leaks coordinator output path
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
e24fc20
2:35 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
A low-severity information disclosure was introduced. The endpoint is authenticated, so exploitation requires possession of the proof upload token, but the endpoint is specifically designed for remote token holders.
The commit adds a remote /status endpoint intended for proof machines. Its JSON response includes outputRoot, which is computed with path.resolve and is therefore an absolute path on the coordinator machine. The upload token is meant to be shared with remote proof machines so they can upload bundles; those machines do not need to know the coordinator's local filesystem layout. Returning the absolute path can disclose usernames, workspace names, and directory structure. The rest of the status data is operationally expected, but outputRoot should be omitted, made relative, or replaced with a non-sensitive label.
Validation
Confirm outputRoot is canonicalized to an absolute local path with path.resolve.
Confirm uploadStatus() includes outputRoot in the JSON response body.
Confirm GET /status returns uploadStatus() to requests possessing the shared upload token.
Confirm generated operator/proof-machine instructions expose /status as a remote token-authenticated endpoint.
Confirm dynamically that unauthenticated access is denied but authenticated /status discloses the absolute coordinator path.
Validation artifact
Evidence
goals/stack-installer/ops/proof-upload-server.mjs
90
const uploadStatus = async () => ({
91
bundles: {
92
macos: await fileExists(path.join(outputRoot, "stack-installer-p1-macos.tgz")),
93
windows: await fileExists(path.join(outputRoot, "stack-installer-p1-windows.zip")),
94
},
95
outputRoot,
96
platforms: Object.fromEntries(
97
await Promise.all(requiredPlatforms.map(async (platform) => [platform, await platformArtifactStatus(platform)]))
98
),
99
});
111
if (request.method === "GET" && requestUrl.pathname === "/status") {
112
if (requestToken(request, requestUrl) !== token) {
113
logRequest(request, 403, "invalid-token");
114
send(response, 403, "Invalid upload token.");
115
return;
116
}
117
118
logRequest(request, 200, "status");
119
sendJson(response, 200, await uploadStatus());
goals/stack-installer/ops/start-proof-upload-window.mjs
76
"Remote status check:",
77
`curl -f -H "Authorization: [redacted authorization header]" 'http://${host}:${port}/status'`,
Attack-path analysis
The original low severity is appropriate. The issue is real: outputRoot is path.resolve()'d and returned by authenticated GET /status, and the documented workflow exposes that endpoint to remote proof machines holding the upload token. Reachability is therefore plausible, but bounded to a temporary internal/tailnet operational helper with shared-token authentication. Impact is limited to low-sensitivity filesystem metadata disclosure and does not include arbitrary file read, secret disclosure, code execution, or privilege escalation.
Path
Remote proof machine / token holder --HTTP request over reachable tailnet/private address--> Temporary proof-upload-server.mjs listener on port 8765 --Routes GET /status--> GET /status shared bearer-token check --Valid bearer token returns status JSON--> uploadStatus() JSON includes absolute outputRoot --Absolute path disclosed--> Coordinator filesystem metadata disclosed
The finding is real and reachable in the documented proof-transfer workflow. proof-upload-server.mjs canonicalizes outputRoot with path.resolve(), then uploadStatus() includes outputRoot directly in the JSON returned by authenticated GET /status. The start script and handoff instructions explicitly tell remote proof machines to call /status with the shared bearer token over the coordinator's tailnet address. The impact is limited to disclosure of coordinator-local filesystem metadata; the endpoint does not disclose file contents, secrets, or provide execution. Authentication, high-entropy token generation, default loopback binding, and private tailnet guidance keep this at low severity.
Likelihood
Medium - Any valid token holder can trivially trigger the leak with the documented /status command, and validation demonstrated this behavior. However, exploitation requires a running temporary helper, network reachability to the coordinator, and the shared high-entropy upload token; the service defaults to localhost and is documented for private tailnet use.
Impact
Low - The exposed value is an absolute local output directory path. It can reveal coordinator usernames, workspace names, and directory structure, but it does not expose file contents, credentials, tenant data, or an executable sink.
Assumptions
The temporary proof upload server is run only when a coordinator starts a proof transfer window.
Remote proof machines are semi-trusted collaborators that receive the shared upload token but do not need coordinator-local filesystem layout details.
No public cloud ingress or load balancer is defined in the repository for this helper; exposure is manual, typically over a private tailnet address.
The leaked outputRoot value may contain usernames, workspace names, or local directory structure, but not file contents or credentials by itself.
Coordinator runs goals/stack-installer/ops/proof-upload-server.mjs or start-proof-upload-window.mjs
Coordinator binds the helper to an address reachable by proof machines, such as a Tailscale/tailnet IP
Attacker possesses the valid STACK_INSTALLER_PROOF_UPLOAD_TOKEN
Attacker sends an authenticated GET request to /status
Controls
GET /status requires the shared bearer upload token
Upload token is generated with crypto.randomBytes(24) by the start helper
Token, commands, log, and PID files are written with 0600 permissions by the start helper
Default listener host is 127.0.0.1
Operational docs instruct use of a private coordinator tailnet IP, not public Internet exposure
Upload handling is limited to two approved bundle filenames
Blindspots
Static repository review cannot confirm how often operators actually expose this helper or whether any instance is public.
No Kubernetes, cloud ingress, or load-balancer manifests were found for this helper, so exposure assessment relies on scripts and handoff documentation.
The validation PoC was local-container based, although it exercises the same HTTP path and token check as the documented remote workflow.
Actual sensitivity of coordinator path components depends on operator workstation naming conventions and output-root choices.
Finding content copied
Finding content copied
```
