# CSF-038: AI metrics privacy output leaks transcript identifiers

## Metadata

| Field | Value |
|---|---|
| Severity | Low |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | aa86796 |
| Reported age | 2w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/library/ai-metrics |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the newly added AI metrics privacy and ingest helpers treat untrusted transcript metadata fields as safe labels instead of allowlisting known event names or hashing/private-redacting identifiers. The included test even asserts that a missing Claude type is summarized as the raw sessionId.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: AI metrics event names now pass through source-specific allowlisting and fallback normalization, while session ids, paths, parent ids, agent roles, and raw event lines are represented only as private hashes.
- Remediation status: `fixed-in-current-head`
- Verification command: `bunx --bun vitest run packages/tooling/library/ai-metrics/test/ingest.test.ts --testNamePattern 'bounded event names|privacy proof without exposing'`
- Changed files:
  - none
- Verification notes:
  - The privacy proof test asserts prompt, output, path, and secret-shaped values are absent from the JSON result.

## Evidence Paths

- packages/tooling/library/ai-metrics/src/ingest.ts
- packages/tooling/library/ai-metrics/src/privacy.ts
- packages/tooling/library/ai-metrics/test/ingest.test.ts
- packages/tooling/tool/cli/src/commands/AIMetrics/index.ts

## Validation Notes From Codex

- Confirm the decoder accepts untrusted raw metadata fields (type, event, sessionId, timestamp) from transcript JSONL.
- Confirm event-name selection uses raw metadata instead of an allowlist, hash, or redaction step.
- Confirm the privacy result marked safe for derived UI serializes those raw values in sanitized.eventNames and rawEventEnvelopes.
- Confirm the CLI --json path emits the privacy result directly to stdout.
- Produce concrete reproduction evidence showing a Claude line missing type leaks raw sessionId, and secret-shaped metadata leaks despite safeForDerivedUi: true.

## Sanitized Finding Content

```text
Finding
AI metrics privacy output leaks transcript identifiers
Report
Chat
Severity
Low
Adjust to improve accuracy in future scans
Commit
aa86796
8:45 PM May 5, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the newly added AI metrics privacy and ingest helpers treat untrusted transcript metadata fields as safe labels instead of allowlisting known event names or hashing/private-redacting identifiers. The included test even asserts that a missing Claude type is summarized as the raw sessionId.
The commit adds a privacy-check path intended to emit only redacted, dashboard-safe transcript projections. However, GenericTranscriptLine accepts raw string fields from transcript JSONL, and eventNameFor uses type, event, then sessionId directly as the public event name. rawEventEnvelopes then serializes that eventName, and the CLI writes the encoded privacy result to stdout with --json. This means Claude lines without a type leak their raw sessionId into sanitized.eventNames and rawEventEnvelopes[].eventName. More generally, any secret-shaped or prompt-shaped value placed in type/event/timestamp is copied into the privacy JSON without applying redactAiMetricsSensitiveText, while redaction.safeForDerivedUi is still set to true. This violates the stated hash-only/private-identifier boundary and can expose local session identifiers or sensitive transcript metadata to derived metrics files, dashboards, or logs.
Validation
Confirm the decoder accepts untrusted raw metadata fields (type, event, sessionId, timestamp) from transcript JSONL.
Confirm event-name selection uses raw metadata instead of an allowlist, hash, or redaction step.
Confirm the privacy result marked safe for derived UI serializes those raw values in sanitized.eventNames and rawEventEnvelopes.
Confirm the CLI --json path emits the privacy result directly to stdout.
Produce concrete reproduction evidence showing a Claude line missing type leaks raw sessionId, and secret-shaped metadata leaks despite safeForDerivedUi: true.
Validation artifact
Evidence
packages/tooling/library/ai-metrics/src/ingest.ts
77
const claudeTurn = (sourcePath: string, lineNumber: number, line: ClaudeTranscriptLine): AgentTurn =>
78
new AgentTurn({
79
eventName: pipe(
80
firstString(line.type, line.sessionId, line.cwd),
81
O.getOrElse(() => "message")
82
),
83
lineNumber,
84
sourceKind: AiMetricsTranscriptSource.Enum.claude,
85
sourcePath,
86
...optionalTimestamp(line.timestamp),
87
});
88
89
const openClawTurn = (sourcePath: string, lineNumber: number, line: OpenClawTranscriptLine): AgentTurn =>
90
new AgentTurn({
91
eventName: pipe(
92
firstString(line.event, line.type, line.message),
93
O.getOrElse(() => "event")
packages/tooling/library/ai-metrics/src/privacy.ts
197
class GenericTranscriptLine extends S.Class<GenericTranscriptLine>($I`GenericTranscriptLine`)(
198
{
199
event: S.optionalKey(S.String),
200
sessionId: S.optionalKey(S.String),
201
timestamp: S.optionalKey(S.String),
202
type: S.optionalKey(S.String),
203
},
290
const redactionResultFor = (content: string): AiMetricsRedactionResult =>
291
new AiMetricsRedactionResult({
292
authHeaderCount: countMatches(AUTH_HEADER_PATTERN, content),
293
bearerTokenCount: countMatches(BEARER_PATTERN, content),
294
excludedRawTextFieldCount: countMatches(/"message"|"payload"|"prompt"|"content"|"text"|"result"/gu, content),
295
openAiKeyCount: countMatches(OPENAI_KEY_PATTERN, content),
296
safeForDerivedUi: true,
297
secretAssignmentCount: countMatches(SECRET_ASSIGNMENT_PATTERN, content),
298
});
299
300
const eventNameFor = (decoded: GenericTranscriptLine): string =>
301
pipe(
302
firstString(decoded.type, decoded.event, decoded.sessionId),
303
O.getOrElse(() => "event")
304
);
335
return O.some(
336
new AiMetricsRawEventEnvelope({
337
eventName: eventNameFor(decoded.value),
338
lineNumber: index + 1,
339
rawEventHash: yield* hashPrivateIdentifier(line, hashSalt),
340
sourceKind,
341
sourcePathHash,
342
...optionalTimestamp(decoded.value.timestamp),
packages/tooling/library/ai-metrics/test/ingest.test.ts
78
it.effect(
79
"summarizes Claude JSONL with missing type",
80
Effect.fn(function* () {
81
const content = '{"sessionId":"claude-session","timestamp":"2026-05-05T11:00:00Z","message":{"role":"user"}}';
82
83
const summary = yield* summarizeTranscriptText({
84
content,
85
sourceKind: AiMetricsTranscriptSource.Enum.claude,
86
sourcePath: "claude.jsonl",
87
});
88
89
expect(summary.acceptedEvents).toBe(1);
90
expect(summary.eventNames).toEqual(["claude-session"]);
91
})
packages/tooling/tool/cli/src/commands/AIMetrics/index.ts
486
const { absolutePath, content } = yield* readPrivacyInput(input);
487
const resolvedHashSalt = yield* resolveHashSalt(hashSalt);
488
const summary = yield* summarizeTranscriptText({
489
content,
490
sourceKind: source,
491
sourcePath: absolutePath,
492
});
493
const result = yield* makeAiMetricsPrivacyCheckResult({
494
content,
495
sourcePath: absolutePath,
496
summary,
497
...(resolvedHashSalt === undefined ? {} : { hashSalt: resolvedHashSalt }),
498
});
499
500
if (json) {
501
yield* Console.log(yield* privacyCheckToJson(result));
Attack-path analysis
Kept at low. The source evidence confirms a real privacy boundary violation: untrusted metadata is copied into `sanitized.eventNames` and `rawEventEnvelopes` while marked safe for derived UI, contrary to the AI metrics privacy contract. The issue is in-scope because the repository documents AI metrics privacy checks and derived dashboard outputs as product workflows. Severity does not increase because the entry point is a local/internal CLI and metrics workflow, not a public unauthenticated service; exploitation requires transcript metadata influence and operator/automation processing; and the demonstrated impact is limited metadata/session-id disclosure rather than raw transcript body disclosure, credential compromise, privilege escalation, or RCE.
Path
Transcript JSONL metadata --accepts raw strings--> GenericTranscriptLine decode --type/event/sessionId selected--> eventNameFor raw fallback --serialized as eventName--> AiMetricsRawEventEnvelope / sanitized.eventNames --printed/exported as safe JSON--> CLI --json stdout or derived metrics consumer
The finding is valid. Repository code accepts raw transcript metadata strings, selects raw type/event/sessionId as public event names, and serializes those values plus raw timestamps into structures described as safe for derived UI. The CLI then prints the privacy result directly when `--json` is used, and the planned install workflow includes the privacy check. This violates the project’s own privacy contract for derived metrics. However, the reachable path is local/operator-driven and internal/tailnet-oriented, with no evidence of public unauthenticated network exposure or executable sink. Impact is limited to confidentiality of transcript metadata/session identifiers rather than code execution or broad credential compromise, so the original low severity is appropriate.
Likelihood
Low - The vulnerable code is reachable through normal CLI workflows and planned commands, and a malformed/missing-type transcript naturally triggers raw sessionId fallback. Exploitation as an attacker-driven issue is less likely because the path is local/operator-run and requires influence over transcript metadata plus downstream capture of the JSON output.
Impact
Low - The bug can disclose local session identifiers and secret-shaped transcript metadata into outputs that are explicitly intended to be privacy-safe. It does not expose full prompt/output bodies by this path, does not grant access, and does not enable code execution. Potential exposure is primarily local logs, derived metrics files, or internal/tailnet dashboards.
Assumptions
Analysis is limited to repository artifacts in the checked-out commit.
The AI metrics privacy output is intended to be consumed by local smoke workflows and optional tailnet-only derived metrics dashboards, as described by the initiative specification.
Transcript JSONL metadata fields can contain local identifiers or attacker-influenced values when files come from AI agent tools, gateway logs, or copied/imported transcript sources.
An operator or automation runs the local AI metrics privacy check or ingest workflow on transcript JSONL.
A transcript line has missing/unsafe event type metadata, or contains secret-shaped/private values in type, event, sessionId, cwd, message, or timestamp metadata fields.
The resulting sanitized JSON is printed, logged, archived, or forwarded into derived metrics/dashboard outputs.
Controls
Default local publicBaseUrl is loopback and production target is documented as tailnet-only, reducing public exposure.
Source path and raw event line are hashed with hashPrivateIdentifier.
Optional operator hash salt can be supplied through --hash-salt or BEEP_AI_METRICS_HASH_SALT.
No executable sink, shell execution, or cloud IAM privilege path is involved in this finding.
Existing redaction helper detects some secret patterns, but it is not applied to eventName/timestamp metadata before serialization.
Blindspots
The TypeScript workspace could not be fully built/executed in the provided environment, so runtime validation relies on static source review and the earlier standalone PoC output.
Downstream derived table, OTLP export, and dashboard implementations are scaffolded/incomplete in this commit, so exact propagation beyond CLI JSON cannot be fully traced.
No deployment manifests proving actual public internet exposure were present; exposure assessment is based on install spec defaults and project documentation.
Static review cannot determine how often real Claude/Codex/OpenClaw transcript metadata contains sensitive values in production use.
Finding content copied
Finding content copied
```
