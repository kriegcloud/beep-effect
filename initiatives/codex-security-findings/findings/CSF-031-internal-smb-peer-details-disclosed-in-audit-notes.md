# CSF-031: Internal SMB peer details disclosed in audit notes

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 6ec9c16 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | initiatives/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a low-severity information disclosure in documentation by committing internal network/service reconnaissance details.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The committed audit note now redacts the concrete Windows proof peer MagicDNS host while preserving the operational note about denied anonymous SMB access.
- Remediation status: `fixed-in-branch`
- Verification command: `rg -n '<redacted-tailnet-ip>|<redacted-tailnet-host>|<redacted-tailnet-suffix>' initiatives/stack-installer apps/stack-installer || true`
- Changed files:
  - initiatives/stack-installer/history/outputs/p1-completion-audit.md
- Verification notes:
  - The disclosure scan returns no concrete tailnet domain suffix after the redaction.

## Evidence Paths

- initiatives/stack-installer/history/outputs/p1-completion-audit.md

## Validation Notes From Codex

- Confirm the repository is at the specified commit and the target audit Markdown file is tracked.
- Confirm the suspected lines are present at the cited file and line numbers.
- Confirm the checked-out commit introduced the lines and the parent revision does not contain the same hostname/service details.
- Confirm the content discloses concrete infrastructure reconnaissance details: Tailscale DNS peer name, SMB exposure/reachability, and anonymous SMB listing result.
- Confirm severity scope: no credentials are disclosed and anonymous access was denied, so impact is limited to confidentiality of internal host/service metadata; crash/Valgrind/debugger validation is not applicable to a Markdown-only disclosure.

## Sanitized Finding Content

```text
Finding
Internal SMB peer details disclosed in audit notes
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
6ec9c16
12:50 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a low-severity information disclosure in documentation by committing internal network/service reconnaissance details.
The added audit note records the full Tailscale DNS name of a Windows peer and states that SMB is exposed, along with the result of an anonymous share-listing attempt. No credentials are disclosed and anonymous access was denied, so this is not a direct authentication bypass or code execution issue. However, publishing internal hostnames and reachable services is an information disclosure risk because it gives attackers concrete infrastructure targets and confirms SMB exposure.
Validation
Confirm the repository is at the specified commit and the target audit Markdown file is tracked.
Confirm the suspected lines are present at the cited file and line numbers.
Confirm the checked-out commit introduced the lines and the parent revision does not contain the same hostname/service details.
Confirm the content discloses concrete infrastructure reconnaissance details: Tailscale DNS peer name, SMB exposure/reachability, and anonymous SMB listing result.
Confirm severity scope: no credentials are disclosed and anonymous access was denied, so impact is limited to confidentiality of internal host/service metadata; crash/Valgrind/debugger validation is not applicable to a Markdown-only disclosure.
Validation artifact
Evidence
initiatives/stack-installer/history/outputs/p1-completion-audit.md
59
The Windows peer `<redacted-windows-tailnet-peer>` is reachable and exposes
60
SMB service access, but anonymous `smbclient -L` share listing fails with
61
`NT_STATUS_ACCESS_DENIED`; no SMB credential was available or guessed.
Attack-path analysis
Severity remains low. Evidence at initiatives/stack-installer/history/outputs/p1-completion-audit.md:59-61 confirms a real information disclosure: a specific Tailscale Windows peer and SMB service are named. However, the same evidence also records NT_STATUS_ACCESS_DENIED for anonymous share listing and says no SMB credential was available or guessed. The affected artifact is committed documentation rather than product runtime code, there is no public ingress/LB definition for the SMB service, and no code-execution, authentication-bypass, secret-disclosure, or data-access path is demonstrated. Probability and impact therefore support low severity rather than medium/high; it is not ignored because the repository artifact does disclose actionable internal network metadata.
Path
Repository/commit readable by attacker --read committed documentation--> P1 completion audit Markdown --extract full internal DNS name--> Disclosed Tailscale Windows peer --identify reachable SMB service--> SMB reconnaissance --anonymous share listing already reported as denied--> Anonymous listing denied / no credentials
The finding is real: the committed audit note names a specific Windows Tailscale peer and confirms SMB reachability. It is reachable to anyone who can read the repository contents. The security impact is limited to reconnaissance because the same lines state anonymous SMB listing returned NT_STATUS_ACCESS_DENIED and no credentials were available or guessed. No executable sink, credential disclosure, auth bypass, or direct path to SMB access is evidenced.
Likelihood
Low - Extraction from the repository is trivial for any repository reader, but practical exploitation beyond reconnaissance requires additional preconditions such as tailnet reachability or valid SMB credentials. Anonymous SMB access was explicitly denied.
Impact
Low - The disclosure gives attackers concrete internal reconnaissance data for a single SMB peer, but does not disclose credentials, does not bypass SMB authorization, and does not prove public network reachability. The main harm is reduced uncertainty for a future attacker.
Assumptions
The repository or commit contents are readable by actors outside the trusted operator group; static analysis cannot verify GitHub visibility without calling external APIs.
The disclosed Tailscale DNS name represents an internal Windows peer and SMB was reachable at the time the audit note was written.
Attackers do not receive SMB credentials from this disclosure and would need separate network reachability into the tailnet or another exposure path to interact with the SMB service.
attacker can read the repository contents or the committed audit note
attacker can make use of internal host/service metadata for reconnaissance
direct SMB probing would require tailnet/local-network reachability or another path to the peer
Controls
SMB anonymous share listing denied
No SMB credentials disclosed
Tailscale/tailnet-only hostname suggests internal/private network exposure rather than public internet ingress
Markdown-only documentation artifact with no executable sink
Blindspots
Static-only review cannot verify whether the GitHub repository is public or private.
No cloud, GitHub, DNS, Tailscale, or SMB network APIs were called, so current reachability and current ACLs were not validated.
The analysis cannot determine whether the disclosed Windows peer still exists or whether the hostname has been rotated.
The review did not inspect .specs content per instruction.
Other committed tailnet hostnames may exist and should be handled by a broader repository data-classification review.
Finding content copied
Finding content copied
```
