# CSF-019: Committed Playwright snapshots leak OpenClaw metadata

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | ee4cf4e |
| Reported age | 2w ago |
| Capture method | dom-fallback |
| Owner area | playwright-cli/page-2026-05-01T10-01-36-589Z.yml |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced an information disclosure by adding local Playwright CLI capture artifacts containing authenticated dashboard and infrastructure metadata.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The referenced Playwright snapshot file is absent from current HEAD, and a targeted scan of Playwright snapshot directories did not find the reported OpenClaw metadata.
- Remediation status: `fixed-in-current-head`
- Verification command: `test ! -e playwright-cli/page-2026-05-01T10-01-36-589Z.yml && (rg -n 'OpenClaw|OPENCLAW|opencode|claw' playwright-cli .playwright-cli 2>/dev/null || true)`
- Changed files:
  - none
- Verification notes:
  - No current-head code change was needed because the reported committed snapshot is no longer present.

## Evidence Paths

- playwright-cli/page-2026-05-01T10-01-36-589Z.yml
- playwright-cli/page-2026-05-01T10-04-02-924Z.yml
- playwright-cli/page-2026-05-01T10-04-58-369Z.yml
- playwright-cli/page-2026-05-01T10-06-14-727Z.yml

## Validation Notes From Codex

- Confirm .playwright-cli artifacts are present, tracked, and newly added by the target commit.
- Confirm the artifacts disclose a private OpenClaw/Tailscale WebSocket endpoint from an authenticated dashboard flow.
- Confirm authenticated chat/session identifiers or chat URLs are present.
- Confirm device/pairing metadata is present, including Tailscale IPs, device names/IDs, and privileged scopes.
- Confirm messaging integration health metadata is present and .playwright-cli/ is not ignored.

## Sanitized Finding Content

```text
Finding
Committed Playwright snapshots leak OpenClaw metadata
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
ee4cf4e
10:46 AM May 1, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced an information disclosure by adding local Playwright CLI capture artifacts containing authenticated dashboard and infrastructure metadata.
Several newly committed Playwright snapshot files under .playwright-cli contain authenticated dashboard state rather than test fixtures. Although direct gateway tokens and bot tokens appear redacted, the files disclose operational metadata including the private wss://dankserver.tailc7c348.ts.net endpoint, active chat/session identifiers, paired device identifiers, Tailscale IP addresses, device names, privileged role scopes including operator.admin and operator.talk.secrets, and Discord/Telegram bot IDs/usernames/status. If this repository is shared or public, these artifacts give an attacker useful reconnaissance data for targeting the OpenClaw gateway, paired devices, or messaging integrations. The files should be removed from history if exposed, .playwright-cli/ should be ignored, and any exposed identifiers/tokens should be reviewed and rotated where appropriate.
Validation
Confirm .playwright-cli artifacts are present, tracked, and newly added by the target commit.
Confirm the artifacts disclose a private OpenClaw/Tailscale WebSocket endpoint from an authenticated dashboard flow.
Confirm authenticated chat/session identifiers or chat URLs are present.
Confirm device/pairing metadata is present, including Tailscale IPs, device names/IDs, and privileged scopes.
Confirm messaging integration health metadata is present and .playwright-cli/ is not ignored.
Validation artifact
Evidence
playwright-cli/page-2026-05-01T10-01-36-589Z.yml
The committed snapshot exposes the private OpenClaw WebSocket endpoint and shows that the capture came from the gateway token login flow.
L8-16
playwright-cli/page-2026-05-01T10-04-02-924Z.yml
The authenticated sessions page leaks concrete agent session identifiers and chat URLs.
L184-190
playwright-cli/page-2026-05-01T10-04-58-369Z.yml
The channel health JSON leaks Discord and Telegram bot IDs, usernames, status, token source/status metadata, and runtime timestamps.
L831
playwright-cli/page-2026-05-01T10-06-14-727Z.yml
The devices page leaks paired device IDs, Tailscale IP addresses, a personal device name, privileged roles, and token scopes including operator.admin and operator.talk.secrets.
L245-276
The snapshot exposes a gateway health pairing entry and its privileged operator scopes.
L371-377
Attack-path analysis
Kept at medium. The issue is real and reachable through normal repository access: the commit added tracked .playwright-cli snapshots and the ignore rules do not exclude them. The impact is meaningful confidentiality exposure of private endpoint, session, device, privilege-scope, and bot metadata. It does not justify high or critical because the confirmed evidence does not include raw tokens, direct authentication bypass, direct service access, code execution, or ability to modify the OpenClaw environment; further compromise would require additional credentials, Tailscale/private-network access, or a separate vulnerability.
Path
Repository read access --read committed files--> Tracked .playwright-cli snapshots --extract gateway and session context--> Private endpoint and authenticated dashboard state --correlate dashboard pages--> Device, session, role, and bot metadata --use metadata for targeting; separate credentials/network access still required--> Reconnaissance against OpenClaw/Tailscale/messaging integrations
The finding is valid. The target commit added 18 tracked .playwright-cli artifacts, and .gitignore ignores .playwright-mcp but not .playwright-cli. The snapshots contain authenticated OpenClaw dashboard state: a private WebSocket endpoint and gateway-token login flow, chat/session identifiers and URLs, paired device/Tailscale metadata, privileged role/scope labels, and messaging integration health metadata. This is a real confidentiality issue for anyone who can read the repository or history. Severity remains medium rather than high because the evidence is operational metadata and reconnaissance value; no raw credential or direct path to modify the OpenClaw environment was proven, and the gateway itself appears private.
Likelihood
High - Exploitation is trivial for anyone with repository read access because the files are tracked and readable. Overall likelihood is medium because repository visibility is not established statically; if public, likelihood would be high, while a tightly private repository would lower it. | Remote network vector
Impact
Medium - The leaked data gives a repository reader concrete operational intelligence about private OpenClaw infrastructure, active sessions, paired devices, privileged scopes, and messaging integrations. However, it does not by itself prove credential theft, account takeover, command execution, or direct access to the private service.
Assumptions
An attacker can read the repository contents or commit history, either because the repository is public or because the attacker has been granted repository read access.
The committed Playwright artifacts remain available in HEAD or history unless removed with history rewriting.
The disclosed endpoint, device, session, and messaging metadata corresponds to a real OpenClaw environment, but the analysis did not call external services or validate live reachability.
No raw gateway token, bot token, or directly usable credential was confirmed in the cited evidence.
attacker has repository read access
committed .playwright-cli artifacts are present in HEAD or recoverable from git history
for operational pivoting beyond reconnaissance, attacker separately obtains network access or credentials for the private OpenClaw/Tailscale environment
Controls
Private Tailscale-style endpoint reduces direct internet reachability of the leaked service.
No raw gateway token or bot token was confirmed in the cited artifacts.
.gitignore protects common .env files but does not protect .playwright-cli artifacts.
Repository access control may limit exposure if the repository is private, but this was not verified via external APIs.
Blindspots
Static-only analysis did not verify whether the GitHub repository is public or private.
No external network or cloud/API calls were made, so the OpenClaw endpoint, sessions, devices, and bots were not checked for current validity.
Commit history beyond the checked-out state was not exhaustively searched for earlier or later remediation.
The analysis avoided printing or validating sensitive identifier values, so conclusions are based on presence and category of metadata rather than live exploitability.
Finding content copied
Finding content copied
```
