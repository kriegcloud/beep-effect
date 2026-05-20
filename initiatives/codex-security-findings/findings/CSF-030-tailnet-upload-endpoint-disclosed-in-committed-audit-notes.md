# CSF-030: Tailnet upload endpoint disclosed in committed audit notes

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 8f36343 |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | initiatives/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a low-severity information disclosure by committing the tailnet upload endpoint address and port. No evidence was found that authentication tokens were committed.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Committed audit notes no longer disclose the live tailnet upload endpoint; the endpoint is represented with coordinator placeholders and live commands remain under ignored output paths.
- Remediation status: `fixed-in-branch`
- Verification command: `rg -n '100\.117\.213\.114|dankputer\.tailc7c348\.ts\.net|tailc7c348' initiatives/stack-installer apps/stack-installer || true`
- Changed files:
  - initiatives/stack-installer/history/outputs/p1-completion-audit.md
  - initiatives/stack-installer/history/outputs/p1-pause-handoff-2026-05-14.md
- Verification notes:
  - The disclosure scan returns no concrete tailnet upload endpoint after the redactions.

## Evidence Paths

- initiatives/stack-installer/history/outputs/p1-completion-audit.md

## Validation Notes From Codex

- Confirm the repository is at the target commit and identify the minimal changed scope.
- Verify the committed file contains the alleged tailnet URL/IP and port with line citations.
- Verify the disclosure was introduced by this commit, not pre-existing in the parent.
- Check whether any authentication token/operator command file was also committed.
- Attempt bounded runtime applicability checks and endpoint reachability context without relying on broad scans.

## Sanitized Finding Content

```text
Finding
Tailnet upload endpoint disclosed in committed audit notes
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
8f36343
1:55 PM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a low-severity information disclosure by committing the tailnet upload endpoint address and port. No evidence was found that authentication tokens were committed.
The new audit note discloses the internal tailnet upload endpoint `http://100.117.213.114:8765` used during a proof upload window. Although the text says the endpoint was temporary and that tokenized operator commands were kept in an ignored file, publishing the tailnet IP and port still exposes private network topology and a service target. If the endpoint or host remains reachable to anyone with tailnet access, this information can aid targeted probing or brute-force attempts against the upload service. No upload token or direct credential appears to have been committed, which limits the impact.
Validation
Confirm the repository is at the target commit and identify the minimal changed scope.
Verify the committed file contains the alleged tailnet URL/IP and port with line citations.
Verify the disclosure was introduced by this commit, not pre-existing in the parent.
Check whether any authentication token/operator command file was also committed.
Attempt bounded runtime applicability checks and endpoint reachability context without relying on broad scans.
Validation artifact
Evidence
initiatives/stack-installer/history/outputs/p1-completion-audit.md
71
- Latest upload-window wait:
72
after starting a temporary ignored tailnet upload endpoint at
73
`http://100.117.213.114:8765`, the coordinator ran
74
`bun run --filter @beep/stack-installer p1:proof:watch -- --watch-attempts 24 --watch-interval-ms 5000`.
75
The endpoint health check passed, invalid tokens returned `403`, and the
76
watch exhausted without returned bundles. The tokenized operator commands
77
live only in ignored `output/stack-installer/p1-live/proof-upload-commands.txt`
78
and are not committed.
Attack-path analysis
Severity remains low. The evidence confirms a real information disclosure at initiatives/stack-installer/history/outputs/p1-completion-audit.md:71-78: the audit note exposes http://100.117.213.114:8765. However, probability and impact are both constrained. The service is described as a temporary tailnet endpoint, not public ingress; the note says invalid tokens returned 403; the referenced tokenized commands are in an ignored /output/ path; and no credential or executable sink was found in the committed change. The attack path is therefore limited to aiding targeted probing by someone who already has tailnet reachability, not direct unauthorized access or compromise.
Path
Committed audit note --reveals http://100.117.213.114:8765--> Tailnet endpoint URL and port --targetable only with tailnet reachability--> Private upload service --no committed token; invalid token reportedly 403--> Limited probing/topology disclosure
The finding is valid as a low-severity information disclosure. The commit added a Markdown-only audit note that directly names the private tailnet upload endpoint http://100.117.213.114:8765. The same note says invalid tokens returned 403 and that tokenized operator commands live only in an ignored /output/ path. Static evidence also shows /output/ is ignored. No credential, service account, IaC exposure, public ingress, or executable sink was identified for this change. Meaningful exploitation requires additional conditions: the endpoint must still be live, the attacker must have tailnet reachability, and token protection must fail or be bypassed.
Likelihood
Low - Reading the committed value is easy for anyone with repository access, but using it for a meaningful attack requires tailnet access, the temporary service still being available, and bypassing or obtaining token authorization.
Impact
Low - The disclosure reveals internal network topology and a specific upload-service target, but it does not include an upload token, credential, source-code execution path, public ingress, or proof of reachable service compromise.
Assumptions
The committed repository artifact is readable by people outside the intended operator group, as implied by the GitHub repository URL and scan context.
The address 100.117.213.114 is treated as a Tailscale/tailnet private overlay address in the 100.64.0.0/10 range.
Static analysis cannot confirm whether the endpoint is still running, whether the tailnet allows the attacker, or whether upload tokens have since been rotated.
attacker can read the committed audit note
attacker has routing/access to the same tailnet or the service is otherwise exposed
the temporary upload endpoint or host remains available
attacker can bypass, guess, or obtain the upload token, or the service has another flaw
Controls
Private tailnet addressing rather than public internet exposure
Token-gating is indicated by the audit note reporting 403 for invalid tokens
/output/ is git-ignored
No tracked proof-upload-commands.txt file was identified
The changed artifact is Markdown documentation, not executable code or deployment configuration
Blindspots
Static-only analysis cannot verify whether the GitHub repository is publicly readable at this moment.
Static-only analysis cannot verify whether 100.117.213.114:8765 is still active.
Static-only analysis cannot verify Tailscale ACLs, tailnet membership, or whether the endpoint is reachable from other networks.
Static-only analysis cannot verify the actual upload service authentication implementation or token rotation status.
No IaC or runtime manifest in the inspected change proves whether this endpoint is part of a long-lived deployment.
Finding content copied
Finding content copied
```
