# CSF-064: IntelliJ shared index auto-consent to external server

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | a6dd7e3 |
| Reported age | 1mo ago |
| Capture method | dom-fallback |
| Owner area | intellij.yaml |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

The configuration introduces a new outbound trust relationship to a non‑standard shared index server with automatic consent, creating a potential info‑leak/supply‑chain exposure for developers using IntelliJ.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The IntelliJ shared-index config no longer contains automatic consent for the external shared-index server, leaving developer trust decisions manual.
- Remediation status: `fixed-in-branch`
- Verification command: `! rg -n 'consents:|decision: allowed' intellij.yaml`
- Changed files:
  - intellij.yaml
- Verification notes:
  - The auto-consent fields are absent from intellij.yaml after the patch.

## Evidence Paths

- intellij.yaml

## Validation Notes From Codex

- Confirm the commit adds a new IntelliJ shared index config file.
- Verify the shared index URL points to a non-standard external host.
- Verify the consent decision is set to allowed (auto-consent).
- Confirm the change is configuration-only (no runtime mitigation elsewhere).
- Assess that auto-consent implies automatic trust/contact by IntelliJ when opening the project.

## Sanitized Finding Content

```text
Finding
IntelliJ shared index auto-consent to external server
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
a6dd7e3
2:15 PM Mar 31, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
The configuration introduces a new outbound trust relationship to a non‑standard shared index server with automatic consent, creating a potential info‑leak/supply‑chain exposure for developers using IntelliJ.
The commit adds an intellij.yaml that points shared indexes to https://dankserver.tailc7c348.ts.net and explicitly sets consent to "allowed". This bypasses the usual user prompt and causes IntelliJ to automatically download and trust index data from an external host whenever the project is opened. While this does not affect runtime behavior, it can leak developer metadata (IP, access patterns) and increases supply‑chain risk if the index server is compromised or malicious, potentially delivering crafted index data to exploit IDE parsing weaknesses.
Validation
Confirm the commit adds a new IntelliJ shared index config file.
Verify the shared index URL points to a non-standard external host.
Verify the consent decision is set to allowed (auto-consent).
Confirm the change is configuration-only (no runtime mitigation elsewhere).
Assess that auto-consent implies automatic trust/contact by IntelliJ when opening the project.
Validation artifact
Evidence
intellij.yaml
1
sharedIndex:
2
project:
3
- url: https://dankserver.tailc7c348.ts.net/beep-effect/project/beep-effect
4
consents:
5
- kind: project
6
decision: allowed
Attack-path analysis
The evidence shows an IntelliJ IDE configuration file that auto-consents to a remote shared index URL. This is developer tooling, not part of the runtime or deployed services described in the threat model, and it only affects developers who open the project in IntelliJ. As such it is out of scope for the product security posture and should be ignored for vulnerability criticality.
Path
Developer IntelliJ IDE --loads project config--> intellij.yaml sharedIndex config --auto-consent + download index--> External shared index server
intellij.yaml configures a sharedIndex project URL pointing to an external host and sets consents.decision to allowed, which auto-approves trust for that host. This is developer tooling configuration and does not affect runtime behavior of the product; risk is limited to developer metadata exposure and potential IDE trust of external index data.
Likelihood
Low - Requires a developer to open the project in IntelliJ and for the external shared index server to be malicious or compromised.
Impact
Low - Potentially exposes developer metadata to an external shared index host and increases supply-chain trust in IDE parsing, but does not affect the product runtime.
Assumptions
Developers open this repo in IntelliJ with shared indexes enabled
IntelliJ honors intellij.yaml and auto-consents without prompting when decision is set to allowed
The external shared index server could be compromised or malicious
Developer opens the project in IntelliJ
IntelliJ shared index feature reads intellij.yaml
Remote shared index server is reachable
Blindspots
Static analysis cannot confirm IntelliJ behavior or whether developers actually use shared indexes
No runtime or deployment manifests reference this config
Finding content copied
Finding content copied
```
