# CSF-011: Worker eval exposes repo files to prompt-injected Codex runs

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | e572119 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/tool/cli |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced a new AI worker execution path that relies on prompt-only instructions to keep the worker packet-only while actually granting the worker read access to the whole repository root.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Docgen worker eval no longer runs prompt-driven packet evaluation from the repository root. The branch creates an isolated temporary working directory for each worker evaluation run, writes only a small marker README there, and removes it after evaluation.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/tooling/tool/cli/test/docgen.test.ts --test-name-pattern "worker packets|Runpod|runpod"`
- Changed files:
  - packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerEval.ts
  - packages/tooling/tool/cli/test/docgen.test.ts
- Verification notes:
  - The worker-eval focused docgen tests pass and assert that the evaluator working directory is not the repository root.

## Evidence Paths

- packages/tooling/tool/cli/src/commands/Docgen/index.ts
- packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerEval.ts

## Validation Notes From Codex

- Confirm the new CLI path accepts attacker-influenced saved input or generated remediation packet content and forwards it to worker eval.
- Confirm the remediation packet prompt field is accepted as arbitrary string content and is inserted verbatim into the worker prompt.
- Confirm the only packet-only restriction is natural-language prompt text, not an enforced SDK/filesystem restriction.
- Confirm the Codex SDK thread is started with the repository root as workingDirectory and sandboxMode: "read-only", which still permits reads.
- Attempt practical validation paths: direct CLI run, valgrind, debugger, and then code/dataflow PoC when runtime dependencies/tools prevented full hosted execution.

## Sanitized Finding Content

```text
Finding
Worker eval exposes repo files to prompt-injected Codex runs
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
e572119
12:55 AM May 12, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced a new AI worker execution path that relies on prompt-only instructions to keep the worker packet-only while actually granting the worker read access to the whole repository root.
The commit adds `quality-worker-eval`, which accepts either a saved quality report or generates remediation packets from repository contents, then passes the packet prompt verbatim to a Codex SDK thread. The prompt text only asks the model not to inspect files or run commands, but this is not enforced by configuration. The Codex thread is started with `workingDirectory` set to the repository root and `sandboxMode: "read-only"`. Read-only prevents writes, but it still exposes repository files for reading; `networkAccessEnabled: false` and disabled web search do not prevent file contents/tool outputs from being sent through the Codex SDK session to the hosted provider. An attacker who can influence a saved quality report, package/source text that becomes packet content, or another field included in the prompt can inject instructions to inspect files such as `.env`, credentials, private source, or config files. Even if the command is intended to be read-only, this creates a confidentiality risk when run against untrusted repositories or reports, especially with `--provider codex`.
Validation
Confirm the new CLI path accepts attacker-influenced saved input or generated remediation packet content and forwards it to worker eval.
Confirm the remediation packet prompt field is accepted as arbitrary string content and is inserted verbatim into the worker prompt.
Confirm the only packet-only restriction is natural-language prompt text, not an enforced SDK/filesystem restriction.
Confirm the Codex SDK thread is started with the repository root as workingDirectory and sandboxMode: "read-only", which still permits reads.
Attempt practical validation paths: direct CLI run, valgrind, debugger, and then code/dataflow PoC when runtime dependencies/tools prevented full hosted execution.
Validation artifact
Evidence
packages/tooling/tool/cli/src/commands/Docgen/index.ts
796
const source = O.isSome(input)
797
? {
798
report: yield* fs.readFileString(input.value).pipe(Effect.flatMap(decodeDocgenQualityReportForWorkerEval)),
799
scope: "input" as const,
800
sourceQualityReport: input.value,
801
}
802
: yield* Effect.gen(function* () {
803
const { scope, targets } = yield* resolveDocgenQualityTargets({
804
all,
805
changedFiles: false,
806
packageSelector,
807
});
808
809
if (targets.length === 0) {
810
return yield* new DomainError({
811
message: "No packages selected for docgen quality-worker-eval.",
812
});
813
}
814
815
return {
816
report: yield* analyzeDocgenQuality({
817
packetLimit: qualityWorkerEvalSourcePacketLimit(packetLimit),
818
scope,
819
scoreMode: "codex",
820
targets,
821
}),
822
scope: scope === "all" ? ("all" as const) : ("package" as const),
823
sourceQualityReport: `generated:${scope}`,
824
};
825
});
826
827
const report = yield* analyzeDocgenQualityWorkerEval({
828
model,
829
packetLimit,
830
provider,
831
...reasoningOptions,
832
report: source.report,
833
scope: source.scope,
834
sourceQualityReport: source.sourceQualityReport,
835
});
packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerEval.ts
561
const workerPrompt = (candidate: PacketCandidate): string =>
562
[
563
"You are evaluating a single exported-symbol JSDoc remediation packet.",
564
"Use only the supplied packet and policy excerpt. Do not inspect files, run commands, or change source.",
565
"Return structured JSON that matches the provided schema.",
566
"",
567
compactPolicyExcerpt,
568
"",
569
`Package: ${candidate.packageName} (${candidate.packagePath})`,
570
`Source anchor: ${candidate.sourceAnchor}`,
571
`Packet id: ${candidate.packet.id}`,
572
`Subject id: ${candidate.packet.subjectId}`,
573
"",
574
"Deterministic finding codes:",
575
...A.map(candidate.findingCodes, (code) => `- ${code}`),
576
"",
577
"Remediation packet prompt:",
578
candidate.packet.prompt,
579
"",
580
"Expected verification command:",
581
candidate.packet.verificationCommand,
582
"",
583
"Draft a replacement JSDoc block, score it from 1-10, explain policy concerns, and classify the draft as candidate, needs-human-review, or reject.",
584
].join("\n");
782
const thread = yield* Effect.try({
783
try: () =>
784
codex.startThread({
785
approvalPolicy: "never",
786
model,
787
networkAccessEnabled: false,
788
sandboxMode: "read-only",
789
webSearchMode: "disabled",
790
workingDirectory,
791
...reasoningThreadOptions,
792
}),
793
catch: (cause) =>
794
new DomainError({
795
message: `Failed to start Codex worker thread for provider "${provider}" and model "${model}": ${errorMessage(cause)} ${providerHint(provider)}`,
796
cause,
797
}),
798
});
799
const turn = yield* Effect.tryPromise({
800
try: (signal) => thread.run(prompt, { outputSchema: qualityWorkerEvalWorkerOutputJsonSchema, signal }),
1080
const startedAtMs = globalThis.performance.now();
1081
const workingDirectory = yield* findRepoRoot();
1082
const sdkVersion = codexSdkVersion ?? (yield* resolveCodexSdkVersionOrUnknown);
1083
const candidates = A.map(report.remediationPackets, (packet) => packetCandidate(report, packet));
1084
const selected = selectQualityWorkerEvalPackets(candidates, packetLimit);
1085
const packets = yield* Effect.forEach(
1086
selected,
1087
(candidate) => {
1088
const reasoningInput = pipe(
1089
O.fromNullishOr(reasoningEffort),
1090
O.map((value) => ({ reasoningEffort: value })),
1091
O.getOrElse(() => ({}))
1092
);
1093
1094
return runPacketEval({
1095
candidate,
1096
model,
1097
provider,
1098
...reasoningInput,
1099
runner,
1100
timeout,
1101
workingDirectory,
1102
});
Attack-path analysis
Kept as medium. Static evidence and validation support a real prompt-injection/data-disclosure issue: untrusted packet prompt strings are appended verbatim, and the default Codex runner is given repo-root read access. However, the attack is not remotely exposed, requires a local developer/operator to run `quality-worker-eval` with a provider/model, and does not provide write access or code execution. The likely impact is serious confidentiality exposure to an AI provider or report output, but the exploitation preconditions and local tooling scope prevent high/critical severity.
Path
Attacker-controlled report or repository content ----input, --package, or --all source--> quality-worker-eval command --decoded/generated report is evaluated--> workerPrompt with verbatim packet.prompt --prompt passed to runner--> Codex SDK read-only thread at repo root --workingDirectory=findRepoRoot(), sandbox read-only--> Repository files readable by invoking user --file contents can enter model/tool output--> Hosted provider/eval JSON receives disclosed data
The finding is a real confidentiality issue in the newly added worker-eval lane. The command accepts saved reports or generated packets, the report schema treats remediation packet prompts as plain strings, and `workerPrompt` appends that text verbatim after only a natural-language instruction not to inspect files. The default runner then starts a Codex SDK thread with the repository root as `workingDirectory` and `sandboxMode: "read-only"`; read-only prevents writes but not reads. Reachability is plausible for malicious reports or untrusted repository content, and the validation artifact demonstrated a read-only Codex-like runner reading a repo-root sentinel. Severity remains medium because exploitation requires explicit local CLI use with a provider/model and victim interaction, with no public network service or write/RCE impact.
Likelihood
Low - The path is realistic for a malicious saved report or untrusted repository, but it requires victim interaction: running an experimental local command with a configured provider/model and nonzero packet limit. There is no unauthenticated network endpoint.
Impact
High - Successful prompt injection can disclose files readable from the repository root, potentially including private source, configuration, local secret files, and derived reports. The impact is confidentiality-only; read-only mode and approval settings reduce integrity and availability impact.
Assumptions
The Codex SDK read-only sandbox permits reading files under the configured workingDirectory even though it prevents writes.
An attacker can plausibly influence either a saved quality report passed with --input or repository source/package text that is transformed into remediation packet prompt content.
For hosted provider runs, prompt text and any model-visible tool/file output may be transmitted to the hosted model provider through the SDK session.
Victim runs the local beep docgen quality-worker-eval command
Victim selects a provider/model and leaves packetLimit above zero, which is the default
Attacker controls or influences remediation packet prompt text through --input report data or repository content
The worker provider has credentials/connectivity when using hosted codex
Controls
Local CLI only; no public listener or ingress
Explicit `--provider` and `--model` are required
Default worker packet limit is five
Codex thread uses `approvalPolicy: "never"`
Codex thread uses `sandboxMode: "read-only"`
Codex thread sets `networkAccessEnabled: false` and `webSearchMode: "disabled"`
Worker turns run sequentially with a timeout
These controls do not enforce packet-only filesystem visibility
Blindspots
Static review did not execute the real CLI because dependency installation/build was unavailable in the validation environment.
The exact Codex SDK tool/file-read semantics are inferred from configuration and the validation PoC rather than live hosted-provider execution.
Actual exploitability depends on whether attackers can place malicious text into reports or repository content that a victim will process.
Actual disclosed data depends on what sensitive files exist in the victim repository and on model/tool behavior.
Finding content copied
Finding content copied
```
