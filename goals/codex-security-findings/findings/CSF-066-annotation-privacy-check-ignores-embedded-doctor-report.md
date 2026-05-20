# CSF-066: Annotation privacy check ignores embedded doctor report

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 65a4a92 |
| Reported age | post-merge follow-up |
| Capture method | authenticated-api-from-browser |
| Owner area | packages/tooling/library/ai-metrics |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

The agent-effectiveness annotation plan embeds the full doctor report, including local path fields. The privacy check previously inspected only planned annotations, allowing private paths in the embedded doctor payload to pass while the JSON renderer still emitted them.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: The follow-up branch now scans the JSON-shaped annotation-plan payload outside `annotations`, including embedded doctor path, message, summary, and inventory fields, and tightens the secret-shaped pattern to avoid benign metric-name false positives.
- Remediation status: `fixed-in-follow-up-branch`
- Verification command: `bunx --bun vitest run packages/tooling/library/ai-metrics/test/agent-effectiveness.test.ts -t "forbidden private content|plans sanitized worker annotations" --testTimeout=30000`
- Changed files:
  - packages/tooling/library/ai-metrics/src/agent-effectiveness.ts
  - packages/tooling/library/ai-metrics/test/agent-effectiveness.test.ts
- Verification notes:
  - The regression test builds a plan with `/home/...` doctor paths and verifies the privacy check fails on `plan.doctor.dataRoot`.
  - The existing safe worker-annotation case still passes after refining the secret-shaped matcher.

## Evidence Paths

- packages/tooling/library/ai-metrics/src/agent-effectiveness.ts
- packages/tooling/tool/cli/src/commands/AgentEffectiveness/index.ts

## Validation Notes From Codex

- `AgentEffectivenessAnnotationPlan` embeds `AgentEffectivenessDoctorReport`.
- The doctor report includes `dataRoot`, `derivedDuckDbPath`, and `reportPath` fields derived from local filesystem inputs.
- The JSON encoder serializes the full plan, so plan-level privacy checks must cover the embedded doctor payload.

## Sanitized Finding Content

```text
Finding: Annotation privacy check ignores embedded doctor report
Severity: Low
Commit: 65a4a92
Status at capture: new
Codex finding id: 0adeac89858c819193d10edd33be28d4

Report summary:
The annotation privacy check scanned only plan.annotations, while the emitted plan also included a doctor report with absolute local paths. A checked plan could therefore leak local user or repo path details through the doctor section.
```
