# CSF-008: Unsafe Markdown projection permits script-link injection

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 8a64c3c |
| Reported age | 4d ago |
| Capture method | dom-get-page-text |
| Owner area | packages/foundation/modeling/ontology |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced a security bug: the new Markdown projection does not sanitize or reject unsafe URI schemes before inserting IRIs into Markdown link destinations/autolinks. The commit introduces `projectMarkdown`, which formats ontology references as `[label](<${iri}>)` and emits several IRI/URI fields as `<${...}>` autolinks. Ontology IRIs are syntactically RFC IRIs and are not restricted to safe schemes such as `http`/`https`; `javascript:alert(1)` is a syntactically valid absolute IRI. If untrusted ontology metadata is projected to Markdown and rendered to HTML by a consumer that does not sanitize link protocols, the generated document can contain executable `javascript:` links.

## Codex Patch

No patch provided by Codex.

- Patch status: _pending P5_

## Current-HEAD Triage

- Verdict: _pending P2_
- Disposition: _pending P2_
- Rationale: _pending P2_
- Remediation status: _pending P5_
- Lane: _pending P4_
- Verification command: _pending P2_
- Changed files: _pending P5_
- Verification notes: _pending P5_

## Evidence Paths

- packages/foundation/modeling/ontology/src/projections/markdown.ts

## Validation Notes From Codex

- Confirm the commit introduced/exposed a Markdown projection path (projectMarkdown) that callers can invoke.
- Confirm Markdown link/autolink rendering inserts IRI/URI values directly and only escapes display text, not link destinations.
- Confirm untrusted ontology fields of type IRI/URI flow into those Markdown destinations/autolinks.
- Confirm repository IRI/URI syntax validation is generic RFC syntax and does not restrict schemes to http/https; specifically, javascript:alert(1) is syntactically acceptable by the parser/URI checks.
- Produce a minimal PoC against the actual projection source showing generated Markdown contains javascript: link destinations/autolinks.

## Sanitized Finding Content

```text
Finding
Unsafe Markdown projection permits script-link injection
Report
Chat
Severity
Medium

Commit
8a64c3c
7:34 PM Jun 4, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced a security bug: the new Markdown projection does not sanitize or reject unsafe URI schemes before inserting IRIs into Markdown link destinations/autolinks.

The commit introduces `projectMarkdown`. It formats ontology references as `[label](<${iri}>)` and also emits several IRI/URI fields as `<${...}>` autolinks. Ontology IRIs are syntactically RFC IRIs and are not restricted to safe schemes such as `http` or `https`; for example, `javascript:alert(1)` is a syntactically valid absolute IRI under the repository's IRI parser. If untrusted ontology metadata or JSON-LD is projected to Markdown and then rendered to HTML by a consumer that does not sanitize link protocols, the generated document can contain executable `javascript:` links. This is especially risky for desktop/webview documentation surfaces because opening or clicking the generated documentation can execute script in that renderer's origin.

Validation
Confirm the commit introduced/exposed a Markdown projection path (projectMarkdown) that callers can invoke.
Confirm Markdown link/autolink rendering inserts IRI/URI values directly and only escapes display text, not link destinations.
Confirm untrusted ontology fields of type IRI/URI flow into those Markdown destinations/autolinks.
Confirm repository IRI/URI syntax validation is generic RFC syntax and does not restrict schemes to http/https.
Produce a minimal PoC against the actual projection source showing generated Markdown contains javascript: link destinations/autolinks.

Evidence
packages/foundation/modeling/ontology/src/projections/markdown.ts
  L50-62 markdownText escapes display text; markdownLink emits `[${markdownText(label)}](<${iri}>)` with raw iri
  L175-187 renderProvenance emits `<${sourceIri}>` and `<${sourceUri}>` autolinks
  L200-208 renderClass emits `<${ontologyClass.iri}>`
  L351-360 projectMarkdown emits `<${ontology.metadata.baseIri}>`

Attack-path analysis

No elevation is justified: there is strong source evidence and PoC evidence that raw javascript: IRIs/URIs are emitted into Markdown, but exploitation is not a direct repo service compromise. It requires attacker-controlled ontology metadata, a consumer that renders the Markdown with unsafe protocol handling, and usually user interaction. That supports a medium library security issue rather than high/critical.

Path
Attacker-controlled ontology IRI/URI/reference metadata --input is assembled into ontology model--> @beep/ontology projectMarkdown/Ont.toMarkdown --raw IRI emitted as <iri> or [label](<iri>)--> Generated Markdown containing javascript: links/autolinks --consumer renders Markdown--> Downstream unsafe Markdown-to-HTML renderer --unsafe protocol allowed and user activates link--> Script execution on link activation in renderer origin

Likelihood
Low - The vulnerable projection is easy to trigger once untrusted ontology metadata reaches it, and validation evidence showed javascript: links are emitted. Overall likelihood is reduced by required downstream unsafe rendering, likely user click, and absence of network exposure or a verified repository-local renderer path.
Impact
Medium - Successful exploitation can execute script in a downstream Markdown renderer's origin. Impact is bounded because no direct in-repo privileged webview or service sink was verified and activation typically requires user interaction.
Controls
Text labels/comments are Markdown-escaped before insertion.
IRI/URI values receive syntax validation as RFC IRI/URI values.
No safe-protocol allowlist is applied to Markdown links/autolinks.
No verified in-repository Markdown-to-HTML executable sink for this projection was found.
```
