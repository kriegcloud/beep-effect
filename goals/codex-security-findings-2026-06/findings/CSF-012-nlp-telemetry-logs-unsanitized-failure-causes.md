# CSF-012: NLP telemetry logs unsanitized failure causes

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 0b8d3fc |
| Reported age | 1w ago |
| Capture method | dom-get-page-text |
| Owner area | packages/foundation/capability/nlp |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced a telemetry information leak and metric-cardinality DoS risk in the new NLP observability path. The helper derives `cause_message` from `summarizeCause(cause).primaryMessage` and includes it, plus a message-derived fingerprint, in metric and log attributes. `ToolExport.handle` now catches every tool failure and calls `recordNlpFailure`, so malformed or failing AI/NLP tool requests can route Effect/Schema/driver error text (which can include user prompts, corpus IDs, document snippets, schema decode values) into telemetry. Because the same untrusted message is also used as a metric attribute, an attacker can generate many distinct failures to create unbounded metric-cardinality pressure. The fix should use low-cardinality stable reason codes and only log redacted/truncated details.

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

- packages/foundation/capability/nlp/src/internal/observability.ts
- packages/foundation/capability/nlp/src/Tools/ToolExport.ts

## Validation Notes From Codex

- Confirm the commit introduced the NLP observability helper and connected ToolExport failures to it.
- Confirm raw summarized cause text (primaryMessage) and a message-derived fingerprint are included in generated attributes.
- Confirm those attributes are used as metric labels and log/span attributes for NLP failure or fallback paths.
- Confirm exported tool handling catches broad failure causes and routes them to recordNlpFailure.
- Confirm attacker-controlled distinct failure messages can create distinct metric attribute sets and leak sensitive strings without redaction/truncation.

## Sanitized Finding Content

```text
Finding
NLP telemetry logs unsanitized failure causes
Report
Chat
Severity
Medium

Commit
0b8d3fc
2:35 PM May 30, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced a telemetry information leak and metric-cardinality DoS risk in the new NLP observability path.

The new NLP observability helper derives `cause_message` from `summarizeCause(cause).primaryMessage` and includes it, along with a message-derived fingerprint, in metric attributes and log attributes. `ToolExport.handle` now catches every tool failure and calls `recordNlpFailure`, so malformed or failing AI/NLP tool requests can route Effect/Schema/driver error text into telemetry. These errors can include user-controlled prompts, corpus IDs, document text snippets, schema decode values, or other sensitive inputs depending on the failure. Because the same untrusted message is also used as a metric attribute, an attacker can generate many distinct failures to create unbounded metric-cardinality pressure in the process or downstream OTLP backend.

Validation
Confirm the commit introduced the NLP observability helper and connected ToolExport failures to it.
Confirm raw summarized cause text (primaryMessage) and a message-derived fingerprint are included in generated attributes.
Confirm those attributes are used as metric labels and log/span attributes for NLP failure or fallback paths.
Confirm exported tool handling catches broad failure causes and routes them to recordNlpFailure.
Confirm attacker-controlled distinct failure messages can create distinct metric attribute sets and leak sensitive strings without redaction/truncation.

Evidence
packages/foundation/capability/nlp/src/internal/observability.ts (L34-39 causeAttributes copies cause_message=summary.primaryMessage and cause_fingerprint; L191-207 recordNlpBackendFallback uses them as metric/log attributes; L229-240 recordNlpFailure same)
packages/foundation/capability/nlp/src/Tools/ToolExport.ts (L317-325 catchCause routes broad cause to recordNlpFailure)

Attack-path analysis

Kept at medium. The code evidence confirms the vulnerable dataflow from attacker-controlled tool/backend failures into metric labels and log/span attributes. The affected code is in product library packages. The severity should not be raised to high because there is no demonstrated public ingress for the exact ToolExport adapter in the repository, exploitation depends on an embedding application and telemetry configuration, and the primary consequences are limited confidentiality leakage to telemetry/log observers plus observability DoS from high-cardinality labels.

Path
Untrusted NLP/tool input --caller-controlled args--> ToolExport.handle(args) --decode/handler failure--> Schema/backend/stream failure cause --catchCause records failure--> recordNlpFailure / recordNlpBackendFallback --summarizeCause primaryMessage copied--> cause_message and cause_fingerprint telemetry attributes --attributes used in logs/spans/metric labels--> Effect logs, span annotations, Metric.withAttributes, optional OTLP

Likelihood
Medium - Once an application exposes these tools to untrusted users, exploitation is low complexity. However, repository artifacts do not show this exact ToolExport path bound to a public HTTP ingress, and OTLP/export visibility is configuration dependent.
Impact
Medium - The issue can disclose sensitive prompts, document snippets, corpus IDs, schema decode values, or backend error details into logs/spans/metrics and can create high-cardinality metric labels. It does not grant code execution, privilege escalation, auth bypass, or direct read access to telemetry by the attacker.
Controls
Effect Schema decoding exists for tool parameters, but decode failures are also caught and routed to the vulnerable telemetry path.
The inspected @beep/nlp package has no built-in authentication or rate limiting for exported tool handles.
OTLP export is configurable and only constructed when otlpEnabled is true.
```
