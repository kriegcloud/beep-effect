# CSF-027: Live tailnet upload endpoint committed to docs

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 57d5180 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | initiatives/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a low-severity information disclosure by committing a live private-network service endpoint and MagicDNS hostname. No upload token or artifact contents were found in the committed diff, so this is not an authentication bypass by itself.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Committed Stack Installer docs and manifests now use coordinator placeholders instead of the live tailnet IP or MagicDNS upload endpoint.
- Remediation status: `fixed-in-branch`
- Verification command: `rg -n '100\.117\.213\.114|dankputer\.tailc7c348\.ts\.net|tailc7c348' initiatives/stack-installer apps/stack-installer || true`
- Changed files:
  - initiatives/stack-installer/history/outputs/p1-completion-audit.md
  - initiatives/stack-installer/history/outputs/p1-pause-handoff-2026-05-14.md
  - initiatives/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
  - initiatives/stack-installer/ops/manifest.json
- Verification notes:
  - The disclosure scan returns no concrete tailnet upload endpoint after the redactions.

## Evidence Paths

- initiatives/stack-installer/history/outputs/p1-completion-audit.md
- initiatives/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md

## Validation Notes From Codex

- Confirm the checked-out repository is exactly commit 57d518069f8c307e32b2cb2ed0f88e611ab6318c.
- Confirm the suspected endpoints appear in tracked committed files with exact file:line evidence.
- Compare HEAD against HEAD^ to determine whether the raw IP and MagicDNS hostname were newly introduced by this commit; result: MagicDNS is newly introduced, raw IP was pre-existing in the audit file but newly added to the handoff.
- Validate the service exposure model in the actual server implementation: /health unauthenticated, /status and uploads token-protected.
- Check whether upload token/command files are intended to remain local/ignored and whether a token itself was committed; ignored files confirmed, no committed token found in the targeted diff.

## Sanitized Finding Content

```text
Finding
Live tailnet upload endpoint committed to docs
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
57d5180
2:57 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a low-severity information disclosure by committing a live private-network service endpoint and MagicDNS hostname. No upload token or artifact contents were found in the committed diff, so this is not an authentication bypass by itself.
The change adds the live coordinator upload endpoint `http://100.117.213.114:8765` and `http://dankputer.tailc7c348.ts.net:8765` to committed operator documentation and audit output. Although the upload and status routes require a one-time bearer token and no token was committed, publishing the live tailnet service location leaks internal network topology and gives anyone with repository access and tailnet reachability a concrete target to probe, including the unauthenticated `/health` endpoint and token-protected upload/status paths. This should remain in coordinator-local ignored files rather than committed docs; committed handoffs should use placeholders.
Validation
Confirm the checked-out repository is exactly commit 57d518069f8c307e32b2cb2ed0f88e611ab6318c.
Confirm the suspected endpoints appear in tracked committed files with exact file:line evidence.
Compare HEAD against HEAD^ to determine whether the raw IP and MagicDNS hostname were newly introduced by this commit; result: MagicDNS is newly introduced, raw IP was pre-existing in the audit file but newly added to the handoff.
Validate the service exposure model in the actual server implementation: /health unauthenticated, /status and uploads token-protected.
Check whether upload token/command files are intended to remain local/ignored and whether a token itself was committed; ignored files confirmed, no committed token found in the targeted diff.
Validation artifact
Evidence
initiatives/stack-installer/history/outputs/p1-completion-audit.md
88
tokens. No operator upload has hit the endpoint yet. The same live endpoint
89
has also been verified through MagicDNS at
90
`http://dankputer.tailc7c348.ts.net:8765/health`.
initiatives/stack-installer/ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md
259
For the current proof window, the coordinator has verified the upload endpoint
260
through both the raw tailnet address and MagicDNS:
261
262
```text
263
http://100.117.213.114:8765
264
http://dankputer.tailc7c348.ts.net:8765
265
```
Attack-path analysis
The original low severity is retained. The issue is real because tracked committed files disclose a live tailnet upload endpoint and MagicDNS health URL. It is reachable only in a constrained sense: a repository reader with tailnet reachability can probe /health and target the service, but /status and uploads are token-protected, the token is generated at runtime and stored in ignored 0600 local files, and no committed secret was evidenced. Probability is reduced by private-network prerequisites; impact is reduced to internal topology/liveness disclosure for a single temporary operator service.
Path
Committed repository docs/audit --reveals live internal service location--> Disclosed tailnet endpoint http://100.117.213.114:8765 / http://dankputer.tailc7c348.ts.net:8765 --attacker can target protected routes but needs bearer token--> Token-protected GET /status and upload routes --authorized uploads write approved artifact names only--> Coordinator output directory for returned proof bundles
The finding is valid as a low-severity information disclosure. The committed handoff publishes both the raw Tailscale address and MagicDNS hostname for the current proof upload service, and the audit output records the MagicDNS /health URL. The server implementation confirms /health is unauthenticated, while /status and upload routes compare the request token against STACK_INSTALLER_PROOF_UPLOAD_TOKEN. The starter generates a random token, writes token/command/log files with 0600 permissions, and /output is gitignored, so the committed data is service-location metadata rather than credentials. Exploitation still requires repository visibility plus tailnet reachability, and impact is limited to targeting/probing a single internal temporary service.
Likelihood
Low - Reading the committed endpoint is easy for anyone with repository access, but meaningful probing requires Tailscale/tailnet reachability to the private 100.64.0.0/10/MagicDNS service. Further actions require a one-time bearer token that was not committed.
Impact
Low - The disclosure gives a concrete internal service target and unauthenticated liveness endpoint, but does not expose the bearer token, proof artifacts, credentials, cloud identities, or an executable sink. Protected routes return 403 without the token.
Assumptions
No cloud, GitHub, or Tailscale APIs were called; conclusions are based only on repository artifacts and prior validation evidence.
The live endpoint's current availability was not verified during this static attack-path pass.
A realistic attacker for this path has access to the committed repository content and either existing Tailscale/tailnet reachability or a position from which the disclosed tailnet hostname/IP can be probed.
No upload bearer token was found in the cited committed documentation.
Attacker can read the committed repository documentation or audit output.
Attacker has Tailscale/tailnet reachability to 100.117.213.114 or dankputer.tailc7c348.ts.net.
For /status or upload impact beyond liveness probing, attacker must also obtain the one-time bearer token, which was not committed.
Controls
[redacted authorization value] required for /status and upload routes
Unauthenticated /health limited to liveness text
Random per-window token generated by crypto.randomBytes
Token delivered through environment variable and local 0600 file
Local proof-output directory ignored by git
Upload filenames restricted to stack-installer-p1-macos.tgz and stack-installer-p1-windows.zip
Upload size capped by maxBytes
Service intended for private Tailscale/tailnet exposure
Blindspots
Static-only pass did not verify whether the live Tailscale endpoint is currently reachable.
Tailscale ACLs, device ownership, and tailnet membership were not inspected.
Repository public/private visibility was not verified via GitHub API.
No runtime network scan was performed.
The analysis excludes .specs subtree content as requested.
Finding content copied
Finding content copied
```
