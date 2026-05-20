# CSF-008: Raw proof request is persisted in artifact transcript

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 6ae84dd |
| Reported age | 5d ago |
| Capture method | dom-fallback |
| Owner area | apps/stack-installer |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: apps/stack-installer/src/proof/capture-p1-manual-proof.ts adds artifact capture and persists the original --request-json value in commands.txt after validation instead of persisting a sanitized/canonical request.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Generated proof command transcripts no longer persist the raw proof request JSON. The command helpers now write a redacted placeholder variable and reference that variable from the generated Bash and PowerShell instructions.
- Remediation status: `fixed-in-branch`
- Verification command: `bunx vitest run apps/stack-installer/test/P1ManualProof.test.ts`
- Changed files:
  - apps/stack-installer/src/proof/P1ProofCommands.ts
  - apps/stack-installer/test/P1ManualProof.test.ts
- Verification notes:
  - The focused Vitest suite passes and asserts that generated Bash and PowerShell command text does not include the raw request JSON.

## Evidence Paths

- apps/stack-installer/src/proof/capture-p1-manual-proof.ts
- packages/installer-workspace/use-cases/src/public.ts

## Validation Notes From Codex

- Identify whether the capture CLI keeps the original raw --request-json string after decoding.
- Verify whether artifact generation uses that raw string instead of a sanitized/canonical request.
- Verify whether commands.txt is written as a captured proof artifact and intended for review/sharing.
- Check that the P1 request schema only defines expected proof fields and the capture decoder does not request strict excess-property rejection.
- Produce a minimal PoC showing an unexpected plaintext field appears in generated commands.txt while a canonical field-only request would omit it.
- Fully execute the real bun run p1:proof:capture path end-to-end; blocked by missing workspace dependencies/Bun version mismatch in this container.

## Sanitized Finding Content

```text
Finding
Raw proof request is persisted in artifact transcript
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
6ae84dd
10:36 AM May 14, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: apps/stack-installer/src/proof/capture-p1-manual-proof.ts adds artifact capture and persists the original --request-json value in commands.txt after validation instead of persisting a sanitized/canonical request.
The capture flow decodes --request-json into P1ManualProofRequest, but it keeps the original requestJson string and passes it into buildP1ProofCommandsText. That function embeds the raw JSON in the generated command transcript, and captureProofArtifacts writes that transcript to commands.txt. Since the request schema only defines the expected proof fields, an input JSON object can include additional properties such as a resolved token or other plaintext credential. Even if those fields are not used by the proof and are absent from proof.json, they remain in commands.txt, which is one of the captured proof artifacts intended for later sharing/audit. The safer pattern is to reject excess properties or re-encode the decoded request and use only that canonical sanitized JSON in the transcript.
Validation
Identify whether the capture CLI keeps the original raw --request-json string after decoding.
Verify whether artifact generation uses that raw string instead of a sanitized/canonical request.
Verify whether commands.txt is written as a captured proof artifact and intended for review/sharing.
Check that the P1 request schema only defines expected proof fields and the capture decoder does not request strict excess-property rejection.
Produce a minimal PoC showing an unexpected plaintext field appears in generated commands.txt while a canonical field-only request would omit it.
Fully execute the real bun run p1:proof:capture path end-to-end; blocked by missing workspace dependencies/Bun version mismatch in this container.
Validation artifact
Evidence
apps/stack-installer/src/proof/capture-p1-manual-proof.ts
80
export const buildP1ProofCommandsText = (
81
request: P1ManualProofRequest,
82
requestJson: string,
83
outputDir: string
84
): string =>
85
A.join("\n")([
86
"# Stack Installer P1 Manual Mode proof commands",
87
"# This transcript records the commands required for the fresh-machine proof.",
88
"# Inputs must contain only 1Password references, never plaintext secrets.",
89
`targetPlatform=${request.targetPlatform}`,
90
`operatorLabel=${request.operatorLabel}`,
91
`outputDir=${outputDir}`,
92
"",
93
"git status --short --branch",
94
"bun install",
95
"bun run config-sync:check",
96
"(cd apps/stack-installer && bun run build)",
97
"(cd apps/stack-installer/src-tauri && cargo check)",
98
"command -v op",
99
"command -v claude",
100
"command -v codex",
101
"op whoami",
102
"claude auth status",
103
"codex login status",
104
`(cd apps/stack-installer && bun run p1:proof:capture -- --request-json ${shellQuote(requestJson)} --output-dir ${shellQuote(outputDir)})`,
105
"",
106
"# After recording screencast.*, refresh checksums without re-sending the Discord proof message:",
107
`(cd apps/stack-installer && bun run p1:proof:checksums -- --output-dir ${shellQuote(outputDir)})`,
108
"",
151
const captureProofArtifacts = Effect.fn("StackInstaller.captureProofArtifacts")(function* (
152
request: P1ManualProofRequest,
153
requestJson: string,
154
outputDir: string
155
) {
156
const fs = yield* FileSystem.FileSystem;
157
const path = yield* Path.Path;
158
const result = yield* runP1ManualProof(request);
159
const proofJson = yield* encodeProofResult(result);
160
const commandsText = buildP1ProofCommandsText(request, requestJson, outputDir);
161
162
yield* fs.makeDirectory(outputDir, { recursive: true });
163
yield* fs.writeFileString(path.join(outputDir, PROOF_FILE_NAME), `${proofJson}\n`);
164
yield* fs.writeFileString(path.join(outputDir, COMMANDS_FILE_NAME), commandsText);
170
const captureMode = Effect.gen(function* () {
171
const requestJson = yield* O.match(argAfter("--request-json"), {
172
onNone: () => Effect.die("Missing --request-json"),
173
onSome: Effect.succeed,
174
});
175
const request = yield* decodeRequestJson(requestJson);
176
const defaultOutputDir = yield* resolveDefaultOutputDir(request);
177
const outputDir = pipe(
178
argAfter("--output-dir"),
179
O.getOrElse(() => defaultOutputDir)
180
);
181
182
return yield* captureProofArtifacts(request, requestJson, outputDir);
packages/installer-workspace/use-cases/src/public.ts
64
export class P1ManualProofRequest extends S.Class<P1ManualProofRequest>($I`P1ManualProofRequest`)(
65
{
66
discordBotTokenReference: OnePasswordReference,
67
discordChannelDisplayName: S.NonEmptyString,
68
discordChannelId: S.NonEmptyString,
69
discordGuildId: S.NonEmptyString,
70
operatorLabel: S.NonEmptyString,
71
targetPlatform: StackInstallerPlatform,
72
testMessageContent: S.NonEmptyString,
73
},
Attack-path analysis
The original medium severity is supportable but should be understood as a local artifact secret-leak, not a remotely exploitable service flaw. Static evidence shows raw --request-json is retained after decoding and written to commands.txt, and documentation makes commands.txt part of the proof artifact set. Impact can be meaningful if a Discord bot token or other credential is accidentally included and then shared. Likelihood is reduced by local-only reachability, /output being gitignored, and documented manual sanitization requirements; these controls prevent escalation to high but do not eliminate the bug.
Path
Operator/developer local CLI --supplies local proof request--> Raw --request-json string --validated/decoded--> decodeRequestJson(P1ManualProofRequest) --decoded request is used, but raw JSON is retained--> buildP1ProofCommandsText(request, requestJson, outputDir) --written as command transcript--> commands.txt proof transcript --may be reviewed/shared as required proof artifact--> Reviewer/audit/share destination
The finding is real in the checked-out source. The Stack Installer capture CLI is a local operator tool, not a public service. It reads raw --request-json, decodes it, but then passes the original string into artifact generation. buildP1ProofCommandsText embeds that original JSON into a replay command and captureProofArtifacts writes it to commands.txt. The request schema only models intended fields such as a 1Password reference, while documentation lists commands.txt as a proof artifact to review and sanitize. This creates a credible local artifact secret-leak path if the raw JSON contains an extra plaintext credential and the artifact is later shared. The severity remains medium rather than high because there is no public ingress, no automatic exfiltration, outputs are under ignored /output, and documented manual review is required before sharing.
Likelihood
Low - Exploitation is not remotely reachable and requires local operator action, secret-bearing JSON, and later artifact disclosure. However, commands.txt is explicitly generated as a proof artifact and prior validation showed the transcript-retention behavior with an extra plaintext field, so the path is plausible in normal proof/audit workflow.
Impact
Medium - If a plaintext credential such as a Discord bot token is present in the raw request JSON, it is persisted into commands.txt and can be disclosed through proof/audit artifact sharing. The likely exposed asset is a service credential rather than arbitrary host files or code execution.
Assumptions
Effect Schema decoding for P1ManualProofRequest does not reject excess JSON properties at this capture decode site because no strict excess-property option is passed.
Exploitation requires a local operator/developer proof run with a raw --request-json value that contains plaintext secret material, either accidentally or because an attacker supplied/socially engineered that JSON.
The leaked value becomes externally exposed only if commands.txt is later shared, committed, uploaded, or otherwise provided as proof/audit evidence without successful manual sanitization.
No cloud APIs were queried; conclusions are based only on repository source, package scripts, documentation, and prior validation evidence.
Local access by an operator/developer to run apps/stack-installer p1:proof:capture
A --request-json payload containing an unexpected or accidental plaintext credential field
Later sharing or publishing of the generated commands.txt artifact before the secret is removed
Controls
Local CLI/operator workflow only; no public ingress or listener is introduced by this finding.
Generated artifacts are placed under /output, which is gitignored.
Runbook requires raw artifacts to be reviewed and sanitized before commit/share.
shellQuote is used for command rendering, reducing command-injection concern; the issue is data persistence, not executable sink control.
Desktop form path constructs a typed request object and validates the bot token field as a 1Password reference, but the vulnerable capture CLI still accepts arbitrary raw JSON text.
Blindspots
The full Bun proof command was not executed end-to-end in this environment because dependencies/Bun workspace catalog resolution were unavailable in prior validation.
Runtime Effect Schema excess-property behavior was inferred from source and prior validation rather than confirmed through the real application execution path.
Static analysis cannot prove whether operators will actually share raw commands.txt or whether organizational secret-scanning controls exist outside the repository.
No cloud, CI, or artifact-storage integrations were queried; exposure beyond the local repository workflow is unknown.
Finding content copied
Finding content copied
```
