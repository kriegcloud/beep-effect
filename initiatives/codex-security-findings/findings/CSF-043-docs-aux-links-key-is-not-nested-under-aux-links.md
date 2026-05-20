# CSF-043: Docs aux_links key is not nested under aux_links

## Metadata

| Field | Value |
|---|---|
| Severity | Informational |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 0b3fc6e |
| Reported age | 1h ago |
| Capture method | dom-fallback |
| Owner area | apps/professional-desktop |
| Triage verdict | needs-current-head-review |
| Codex close reason | pending |

## Summary

A low-impact documentation configuration bug was introduced. No exploitable vulnerability, crash, info leak, authentication flaw, or security-sensitive behavior was introduced by this docs-only commit.

## Current-HEAD Triage

- Verdict: `needs-current-head-review`
- Rationale: Pending validation against current `HEAD`.
- Remediation status: `not-started`
- Verification command: `pending`

## Evidence Paths

- apps/professional-desktop/docs/_config.yml

## Validation Notes From Codex

- Confirm the checked-out commit and identify the touched files to determine whether runtime/security-sensitive code was changed.
- Inspect apps/professional-desktop/docs/_config.yml:7-9 and verify the suspected indentation structure.
- Parse the actual YAML with a relevant parser and confirm whether aux_links is null while the GitHub link is top-level.
- Demonstrate that the intended indentation would instead place the GitHub link under aux_links.
- Attempt crash/valgrind/debugger validation where feasible, and determine whether any security-relevant crash or runtime behavior exists.

## Sanitized Finding Content

```text
Finding
Docs aux_links key is not nested under aux_links
Report
Chat
Severity
Informational
Adjust to improve accuracy in future scans
Commit
0b3fc6e
8:30 PM May 19, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
A low-impact documentation configuration bug was introduced. No exploitable vulnerability, crash, info leak, authentication flaw, or security-sensitive behavior was introduced by this docs-only commit.
The added apps/professional-desktop/docs/_config.yml declares `aux_links:` and then places the GitHub link key at the YAML root level instead of nesting it beneath `aux_links`. YAML therefore parses `aux_links` as null and treats `@beep/professional-desktop on GitHub` as an unrelated top-level key. For just-the-docs this means the intended auxiliary navigation link will not be configured. This is a documentation configuration bug, not a security issue and not part of the desktop/runtime attack surface.
Validation
Confirm the checked-out commit and identify the touched files to determine whether runtime/security-sensitive code was changed.
Inspect apps/professional-desktop/docs/_config.yml:7-9 and verify the suspected indentation structure.
Parse the actual YAML with a relevant parser and confirm whether aux_links is null while the GitHub link is top-level.
Demonstrate that the intended indentation would instead place the GitHub link under aux_links.
Attempt crash/valgrind/debugger validation where feasible, and determine whether any security-relevant crash or runtime behavior exists.
Validation artifact
Evidence
apps/professional-desktop/docs/_config.yml
7
aux_links:
8
'@beep/professional-desktop on GitHub':
9
- 'https://github.com/kriegcloud/beep-effect/tree/main/apps/professional-desktop'
Attack-path analysis
Although the reported YAML indentation bug is real, probability × impact for security is effectively zero. The commit affects only documentation files, with evidence at apps/professional-desktop/docs/_config.yml:7-9 showing a malformed aux_links structure. The resulting behavior is a missing just-the-docs auxiliary link. It is outside the repository threat model's runtime surfaces, has no network listener or ingress, uses no service identity, references no secrets, and reaches no executable or data-access sink. Therefore it should be treated as a non-security documentation correctness issue and ignored for security criticality.
Path
Docs _config.yml --loads malformed nesting--> YAML/Jekyll parser --aux_links parsed as null--> just-the-docs navigation configuration --link not rendered in docs nav--> Missing auxiliary GitHub link
The finding is factually correct as a documentation bug: apps/professional-desktop/docs/_config.yml declares aux_links on line 7, but the intended '@beep/professional-desktop on GitHub' key starts at the YAML root on line 8, so aux_links parses as null. The commit changed only documentation files under apps/professional-desktop/docs. Static review found no ingress, listener, service account, secret reference, executable sink, or runtime path connected to this YAML. The only demonstrated impact is that a docs navigation link is not configured. This is not reachable from the product attack surfaces identified in the threat model and does not create a security boundary violation.
Likelihood
Ignore - The YAML parsing behavior is easy to trigger during docs generation, but it is not an exploitable security path. There is no attacker-controlled input or meaningful attack surface.
Impact
Ignore - Impact is limited to incorrect documentation-site navigation. There is no confidentiality, integrity, availability, identity, privilege, or code-execution impact.
Assumptions
The docs under apps/professional-desktop/docs are documentation-site artifacts and are not loaded by the desktop runtime, sidecar runtime, AI SDK services, or deployment control planes described in the threat model.
No cloud APIs or live deployment state were queried; assessment is based only on repository artifacts in the checkout.
The documentation site, if published, may be publicly readable, but the observed behavior only affects presentation/navigation.
A documentation build or reader consumes apps/professional-desktop/docs/_config.yml
The just-the-docs theme expects aux_links to contain nested link definitions
Controls
No runtime service exposure identified for the affected file
No executable sink in the affected YAML
No identity or privilege assignment in the affected artifacts
No secrets references in the affected artifacts
Blindspots
Static-only review did not build or publish the documentation site.
No live hosting configuration was queried, so public availability of the docs site was not independently verified.
Assessment excludes .specs as requested.
Finding content copied
Finding content copied
```
