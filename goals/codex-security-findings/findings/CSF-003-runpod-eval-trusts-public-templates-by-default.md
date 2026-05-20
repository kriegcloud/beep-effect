# CSF-003: Runpod eval trusts public templates by default

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 55d2735 |
| Reported age | 3d ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/tool/cli |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the commit adds the Runpod worker eval command and its template resolution logic. The unsafe behavior is that public templates are included and selected automatically by default, rather than requiring an explicit trusted template ID or using the pinned fallback image unless the operator opts into public template search.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Current HEAD still searched public Runpod templates by default when no template id or skip flag was supplied. The branch now uses the pinned fallback image by default, keeps explicit trusted template ids supported, and requires --allow-public-template-search before public template discovery is used.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/tooling/tool/cli/test/docgen.test.ts --test-name-pattern "Runpod|runpod"`
- Changed files:
  - packages/tooling/tool/cli/src/commands/Docgen/index.ts
  - packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerRunpodEval.ts
  - packages/tooling/tool/cli/test/docgen.test.ts
- Verification notes:
  - The Runpod-focused docgen tests pass and the cleanup regression test now fails if default execution attempts public template search.

## Evidence Paths

- packages/tooling/tool/cli/src/commands/Docgen/index.ts
- packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerEval.ts
- packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerRunpodEval.ts

## Validation Notes From Codex

- Confirm the checked-out commit introduced the Runpod-backed quality-worker eval path and relevant template resolution logic.
- Confirm the default CLI/runtime path searches templates unless the operator explicitly supplies --skip-template-search or a template id.
- Confirm default template listing includes public Runpod templates.
- Confirm template suitability is based only on substring matching for ollama/not serverless plus deterministic sorting, with no owner/template allowlist or digest validation.
- Confirm a selected template id is used to create the pod and that worker prompts sent to that pod include repository/package/source/remediation metadata.

## Sanitized Finding Content

```text
Finding
Runpod eval trusts public templates by default
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
55d2735
3:57 AM May 16, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the commit adds the Runpod worker eval command and its template resolution logic. The unsafe behavior is that public templates are included and selected automatically by default, rather than requiring an explicit trusted template ID or using the pinned fallback image unless the operator opts into public template search.
The new quality-worker-eval-runpod path defaults to live template search unless --skip-template-search is supplied. That search includes public Runpod templates, and the selector accepts any template whose name, image name, or readme contains "ollama" and not "serverless". The selected templateId is then used to create the GPU pod, and the worker eval routes Codex/Ollama-compatible requests containing package names, paths, source anchors, signatures, and remediation prompts to that pod. An attacker who publishes a public Runpod template with an early-sorting Ollama-looking name/image/readme can cause operators running the default command to instantiate attacker-controlled images/services. The malicious pod can exfiltrate private API surface and remediation prompts and can manipulate eval results while appearing to be a normal Ollama endpoint. Public template discovery should be opt-in, constrained to trusted owners/template IDs, or replaced by the pinned fallback image or image digest by default.
Validation
Confirm the checked-out commit introduced the Runpod-backed quality-worker eval path and relevant template resolution logic.
Confirm the default CLI/runtime path searches templates unless the operator explicitly supplies --skip-template-search or a template id.
Confirm default template listing includes public Runpod templates.
Confirm template suitability is based only on substring matching for ollama/not serverless plus deterministic sorting, with no owner/template allowlist or digest validation.
Confirm a selected template id is used to create the pod and that worker prompts sent to that pod include repository/package/source/remediation metadata.
Validation artifact
Evidence
packages/tooling/tool/cli/src/commands/Docgen/index.ts
146
const runpodTemplateIdFlag = Flag.string("template-id").pipe(
147
Flag.withDescription("Optional Runpod template id override; otherwise live templates are searched first"),
148
Flag.optional
149
);
150
const skipRunpodTemplateSearchFlag = Flag.boolean("skip-template-search").pipe(
151
Flag.withDescription("Use the repo fallback image instead of searching public Runpod templates")
152
);
packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerEval.ts
619
const workerPrompt = (candidate: PacketCandidate): string =>
620
[
621
"You are evaluating a single exported-symbol JSDoc remediation packet.",
622
"Use only the supplied packet and policy excerpt. Do not inspect files, run commands, or change source.",
623
"Return structured JSON that matches the provided schema.",
624
"",
625
compactPolicyExcerpt,
626
"",
627
`Package: ${candidate.packageName} (${candidate.packagePath})`,
628
`Source anchor: ${candidate.sourceAnchor}`,
629
`Packet id: ${candidate.packet.id}`,
630
`Subject id: ${candidate.packet.subjectId}`,
631
"",
632
"Deterministic finding codes:",
633
...A.map(candidate.findingCodes, (code) => `- ${code}`),
634
"",
635
"Remediation packet prompt:",
636
candidate.packet.prompt,
637
"",
packages/tooling/tool/cli/src/commands/Docgen/internal/QualityWorkerRunpodEval.ts
355
const templateText = (template: Template): string =>
356
pipe(
357
[template.name, template.imageName, template.readme],
358
A.map((value) =>
359
pipe(
360
O.fromUndefinedOr(value),
361
O.getOrElse(() => "")
362
)
363
),
364
A.join("\n"),
365
Str.toLowerCase
366
);
367
368
const isOllamaTemplate = (template: Template): boolean =>
369
pipe(templateText(template), (text) => Str.includes("ollama")(text) && !Str.includes("serverless")(text));
370
371
const templateSortKey = (template: Template): string =>
372
pipe(
373
O.fromUndefinedOr(template.name),
374
O.orElse(() => O.fromUndefinedOr(template.id)),
375
O.orElse(() => O.fromUndefinedOr(template.imageName)),
376
O.getOrElse(() => "")
377
);
378
379
const templateOrder = Order.mapInput(Order.String, templateSortKey);
380
381
/**
382
* Select the first suitable Ollama template from live Runpod templates.
383
*
384
* @param templates - Templates returned by Runpod.
385
* @returns The deterministic Ollama template candidate, when present.
386
* @example
387
* ```ts
388
* import { selectQualityWorkerRunpodTemplate } from "@beep/repo-cli/commands/Docgen/internal/QualityWorkerRunpodEval"
389
*
390
* console.log(selectQualityWorkerRunpodTemplate([]))
391
* ```
392
* @category utilities
393
* @since 0.0.0
394
*/
395
export const selectQualityWorkerRunpodTemplate = (templates: ReadonlyArray<Template>): O.Option<Template> =>
396
pipe(templates, A.filter(isOllamaTemplate), A.sort(templateOrder), A.head);
448
}): PodCreateInput =>
449
new PodCreateInput({
450
cloudType: "COMMUNITY",
451
computeType: "GPU",
452
containerDiskInGb: 100,
453
dockerStartCmd: ollamaBootstrapCommand(model),
454
globalNetworking: true,
455
gpuCount: 1,
456
gpuTypeIds,
457
gpuTypePriority: "availability",
458
...(templateId === undefined ? { imageName } : { templateId }),
459
interruptible: false,
460
minRAMPerGPU: minRamPerGpuGb,
461
name: podName,
462
ports: [OLLAMA_PORT_MAPPING],
463
supportPublicIp: true,
464
volumeInGb: 0,
530
const runpod = yield* Runpod;
531
const templates = yield* runpod
532
.listTemplates(
533
new ListTemplatesRequest({
534
includePublicTemplates: true,
535
includeRunpodTemplates: true,
536
})
537
)
538
.pipe(
539
Effect.mapError(
540
(cause) => new DomainError({ message: "Failed to list Runpod templates for worker eval.", cause })
541
)
542
);
543
const selected = selectQualityWorkerRunpodTemplate(templates);
544
545
if (O.isSome(selected)) {
546
return new DocgenQualityWorkerRunpodEvalTemplate({
547
imageName: selected.value.imageName ?? RUNPOD_PYTORCH_IMAGE,
548
searchIncludedPublicTemplates: true,
549
searchIncludedRunpodTemplates: true,
550
strategy: "existing-template",
551
templateId: selected.value.id ?? null,
552
templateName: selected.value.name ?? null,
1038
const acquired = yield* acquireRunpodPod({
1039
allow24GbFallback: options.allow24GbFallback ?? false,
1040
...(options.gpuTypeIds === undefined ? {} : { gpuTypeIds: options.gpuTypeIds }),
1041
model: options.model,
1042
runId,
1043
skipTemplateSearch: options.skipTemplateSearch ?? false,
1044
...(options.templateId === undefined ? {} : { templateId: options.templateId }),
1045
});
1046
1047
const workerStartedAtMs = globalThis.performance.now();
1048
const workerEval = yield* Effect.gen(function* () {
1049
yield* Console.log(`docgen: waiting for Ollama model ${options.model}`);
1050
yield* waitForOllamaReady({
1051
baseUrl: acquired.pod.baseUrl,
1052
model: options.model,
1053
timeout: Duration.millis(options.readinessTimeoutMs ?? defaultQualityWorkerRunpodEvalReadinessTimeoutMs()),
1054
});
1055
1056
yield* Console.log("docgen: running read-only worker eval packets");
1057
return yield* analyzeDocgenQualityWorkerEval({
1058
baseUrl: acquired.pod.codexBaseUrl,
1059
model: options.model,
Attack-path analysis
Adjusted from high to medium. The core bug is valid: public templates are searched by default, selected using weak text matching, and the selected templateId drives pod creation before repository-derived prompts are sent to the pod. The validation replay further supports reachability of the selection/create-pod branch. However, the attack is not a public unauthenticated endpoint in the main runtime; it depends on an operator running a specialized repo CLI command with RUNPOD_API_KEY and `--confirm-runpod-eval`. The proven impact is disclosure of packet-level code metadata/remediation prompts and advisory result manipulation, not proven credential theft, host RCE, full repository exfiltration, or broad cloud/account compromise. That supports a real medium-severity supply-chain/trust-boundary issue rather than the originally assigned high severity.
Path
Attacker public Runpod template --returned in public template listing--> CLI live template search includes public templates --filtered only by `ollama` text and `serverless` exclusion--> Substring-based Ollama template selector --selected templateId is used for pod creation--> Runpod pod created with selected templateId --CLI derives proxy base URL for selected pod--> Docgen worker prompts routed to pod codexBaseUrl --workerPrompt content is sent to remote endpoint--> Prompt/metadata disclosure and eval integrity manipulation
The finding is real in the code path reviewed. The Runpod eval command is documented and registered, requires an operator confirmation and RUNPOD_API_KEY, but by default it searches live Runpod templates including public templates. The selector trusts any template whose name, image, or readme contains `ollama` and not `serverless`, sorts deterministically, and returns the first match without owner, allowlist, or digest validation. The selected templateId is then used in the pod creation request, and the docgen worker sends repository-derived remediation packet prompts to the pod's OpenAI-compatible endpoint. This creates a credible attacker-controlled remote worker path. However, it is not unauthenticated internet exposure of the main product and requires deliberate operator execution of a specialized CLI workflow; the demonstrated impact is leakage of code-derived metadata/prompts and manipulation of advisory eval output, not proven host RCE, credential theft, or broad account compromise.
Likelihood
High - The vulnerable behavior is the default for the documented command, and attacker control of public template metadata is plausible. Exploitation still requires a victim operator to run a specialized internal CLI with a Runpod API key and confirmation, and requires the attacker's template to be returned and sort before other matching candidates. | Remote network vector
Impact
Medium - A malicious selected template can receive repository-derived worker prompts and return manipulated advisory eval results. This is meaningful confidentiality and integrity impact for private code review workflows, but static evidence does not show host compromise, direct RUNPOD_API_KEY disclosure, full source exfiltration, cross-tenant access, or persistent compromise of the main product.
Assumptions
An attacker can publish or control a public Runpod template returned by Runpod template search.
Runpod honors the selected templateId when creating the pod, while allowing the repository code to route OpenAI/Ollama-compatible traffic to that pod.
The docgen remediation packets may be derived from private repository code and therefore can contain confidential package names, paths, source anchors, signatures, prompts, or verification commands.
No cloud APIs were called; conclusions are based on static repository evidence and the provided validation replay.
Victim operator runs the repository CLI command `docgen quality-worker-eval-runpod`.
Victim provides RUNPOD_API_KEY and passes `--confirm-runpod-eval`.
Victim does not pass `--skip-template-search` or a trusted `--template-id`.
Attacker-controlled public template is returned by Runpod and sorts before other matching Ollama-looking templates.
Controls
Requires explicit `--confirm-runpod-eval` before creating a billable pod
Requires operator-provided `RUNPOD_API_KEY` environment variable
`--skip-template-search` can force fallback image behavior
`--template-id` can override live search if operator supplies a trusted ID
Provider/model are restricted for Runpod v1 to Ollama and qwen3-coder:30b
Pods are stopped/deleted by default unless `--keep-pod` is passed
Test coverage asserts RUNPOD_API_KEY is not embedded in the pod bootstrap command
Blindspots
Static-only review; no live Runpod API calls were made to confirm actual public template registry behavior or ownership metadata availability.
Exact Runpod semantics for templateId, dockerStartCmd override, inherited template environment, and image entrypoint behavior were not dynamically verified.
The sensitivity of worker prompts depends on the private repository being evaluated and the contents of generated remediation packets.
No repository IaC was found for Runpod networking; exposure is inferred from pod creation code setting global networking, supportPublicIp, port mapping, and proxy URL construction.
The validation PoC replayed code logic but did not instantiate a real malicious Runpod pod in this environment.
Finding content copied
Finding content copied
```
