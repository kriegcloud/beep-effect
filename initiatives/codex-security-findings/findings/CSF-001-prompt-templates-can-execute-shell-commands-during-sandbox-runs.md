# CSF-001: Prompt templates can execute shell commands during sandbox runs

## Metadata

| Field | Value |
|---|---|
| Severity | High |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | d1c7412 |
| Reported age | 2w ago |
| Capture method | dom-fallback |
| Owner area | packages/foundation/capability/sandbox |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: automatic execution of repository-controlled prompt shell expressions during agent orchestration. This creates a direct command-execution and secret-exfiltration path from prompt template content to sandbox or host execution, depending on the selected provider.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Current HEAD still executed marked prompt shell expressions through sandbox.exec. The branch now keeps repository-controlled !`...` prompt blocks as literal text and strips only the internal marker, removing the command-execution and unbounded expansion path.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/foundation/capability/sandbox/test/lifecycle.test.ts --test-name-pattern "preserves prompt shell expressions"`
- Changed files:
  - packages/foundation/capability/sandbox/src/Prompt.ts
  - packages/foundation/capability/sandbox/test/lifecycle.test.ts
- Verification notes:
  - The focused new/updated prompt-shell test passes.
  - The unrelated existing lifecycle timeout test still hangs under bun test and remains a broader package-test caveat.

## Evidence Paths

- packages/foundation/capability/sandbox/src/Orchestrator.ts
- packages/foundation/capability/sandbox/src/Prompt.ts
- packages/foundation/capability/sandbox/src/Run.ts
- packages/foundation/capability/sandbox/src/Sandbox.providers.ts

## Validation Notes From Codex

- Confirm repository prompt templates can contain the new !...`` syntax and are marked during template argument substitution.
- Confirm marked shell blocks are expanded automatically without an opt-in/trust check by executing sandbox.exec and replacing the block with stdout.
- Confirm orchestration sends the expanded prompt to the selected agent provider command/stdin.
- Confirm resolved/provider environment is merged before sandbox creation and is passed to noSandbox/host execution.
- Confirm noSandbox uses host shell execution and expansion concurrency is unbounded; demonstrate with a minimal PoC.

## Sanitized Finding Content

```text
Finding
Prompt templates can execute shell commands during sandbox runs
Report
Patch
Chat
Severity
High
Adjust to improve accuracy in future scans
Commit
d1c7412
2:04 PM May 1, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: automatic execution of repository-controlled prompt shell expressions during agent orchestration. This creates a direct command-execution and secret-exfiltration path from prompt template content to sandbox or host execution, depending on the selected provider.
Prompt files are repository content and are treated as attacker-controlled in the project threat model. This commit introduces a `!`command`` syntax that is detected in prompt templates, automatically executed via `sandbox.exec`, and substituted back into the prompt. Because runs also merge resolved/provider environment variables into the sandbox, a malicious prompt can include expressions such as `!`env`` or `!`cat ~/.config/...``. The stdout is then embedded in the prompt passed to the agent provider, which can leak secrets to external AI services. With the `noSandbox` provider, the same mechanism executes directly on the host. There is also no opt-in flag or trust check around this expansion, and expansion uses unbounded concurrency for all matched shell blocks, enabling prompt-file-triggered resource exhaustion.
Validation
Confirm repository prompt templates can contain the new !...`` syntax and are marked during template argument substitution.
Confirm marked shell blocks are expanded automatically without an opt-in/trust check by executing sandbox.exec and replacing the block with stdout.
Confirm orchestration sends the expanded prompt to the selected agent provider command/stdin.
Confirm resolved/provider environment is merged before sandbox creation and is passed to noSandbox/host execution.
Confirm noSandbox uses host shell execution and expansion concurrency is unbounded; demonstrate with a minimal PoC.
Validation artifact
Evidence
packages/foundation/capability/sandbox/src/Orchestrator.ts
119
const prompt = yield* expandPromptShellExpressions(
120
options.sandbox,
121
new ExpandPromptShellExpressionsOptions({
122
cwd: options.sandboxRepoDir,
123
prompt: options.prompt,
124
...(P.isUndefined(options.promptExpansionTimeoutMs) ? {} : { timeoutMs: options.promptExpansionTimeoutMs }),
125
})
126
);
127
const command = options.provider.buildPrintCommand({
128
dangerouslySkipPermissions: true,
129
prompt,
130
});
packages/foundation/capability/sandbox/src/Prompt.ts
20
const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/gu;
21
const SHELL_BLOCK_PATTERN = /!`([^`]+)`/gu;
22
23
/**
24
* Marker inserted before literal shell blocks in prompt templates.
25
*
26
* @category utilities
27
* @since 0.0.0
28
*/
29
export const SHELL_BLOCK_MARKER = "\u0000BEEP_SANDBOX_SHELL_BLOCK\u0000" as const;
30
31
const MARKED_SHELL_BLOCK_PATTERN = new RegExp(`!${SHELL_BLOCK_MARKER}\`([^\`]+)\``, "gu");
344
const expandShellExpression = Effect.fn("Prompt.expandShellExpression")(function* <R>(
345
sandbox: SandboxHandle<R>,
346
cwd: string,
347
command: string,
348
timeout: Duration.Duration
349
) {
350
const result = yield* sandbox
351
.exec(
352
command,
353
new SandboxExecOptions({
354
cwd,
355
})
356
)
357
.pipe(
358
Effect.timeoutOrElse({
359
duration: timeout,
360
orElse: () =>
361
Effect.fail(
362
PromptExpansionTimeoutError.new(
363
"prompt expansion timeout",
364
`Shell expression \`${command}\` timed out after ${Duration.toMillis(timeout)}ms`,
365
{
366
expression: command,
367
timeoutMs: timeout,
368
}
369
)
370
),
371
})
372
);
373
374
if (result.exitCode !== 0) {
375
return yield* PromptError.new(
376
result.stderr || result.stdout,
377
`Command \`${command}\` exited with code ${result.exitCode}: ${result.stderr || result.stdout}`
378
);
379
}
380
381
return Str.trimEnd(result.stdout);
397
const matches = [...options.prompt.matchAll(MARKED_SHELL_BLOCK_PATTERN)];
398
399
if (matches.length === 0) {
400
return Str.replaceAll(SHELL_BLOCK_MARKER, "")(options.prompt);
401
}
402
403
const display = yield* Display;
404
405
return yield* display.taskLog(
406
"Expanding shell expressions",
407
Effect.fn("Prompt.expandPromptShellExpressions.task")(function* (message) {
408
const results = yield* Effect.forEach(
409
matches,
410
(match) => {
411
const command = match[1] ?? "";
412
413
return expandShellExpression(sandbox, options.cwd, command, options.timeoutMs);
414
},
415
{ concurrency: "unbounded" }
416
);
417
418
for (let index = 0; index < matches.length; index++) {
419
const command = matches[index]?.[1] ?? "";
420
const result = results[index] ?? "";
421
const tokens = Math.ceil(result.length / 4);
422
423
message(`${command} => ~${tokens} tokens`);
424
}
425
426
return replaceMarkedShellBlocks(options.prompt, matches, results);
packages/foundation/capability/sandbox/src/Run.ts
770
const resolvedEnv = yield* resolveEnv(hostRepoDir);
771
const env = yield* mergeProviderEnv(
772
new MergeProviderEnvOptions({
773
agentProviderEnv: options.agent.env,
774
resolvedEnv,
775
sandboxProviderEnv: options.sandbox.env,
776
})
777
);
packages/foundation/capability/sandbox/src/Sandbox.providers.ts
297
exec: Effect.fn("NoSandboxHandle.exec")(function* (command: string, execOptions?: SandboxExecOptions) {
298
const process = yield* SandboxProcess;
299
const result = yield* process
300
.runShell(execOptions?.sudo === true ? `sudo sh -lc ${shellEscape(command)}` : command, {
301
cwd: execOptions?.cwd ?? worktreePath,
302
env: {
303
...env,
304
...options.env,
305
},
Attack-path analysis
Severity remains high. Static evidence confirms the report: repository promptFile content is resolved, !`...` blocks are marked, executed via sandbox.exec, expanded into the prompt, and passed to provider CLIs. The run environment merges resolved .sandcastle/.env/process env fallbacks plus sandbox and agent provider env, and noSandbox executes through the host shell. This provides major confidentiality impact through secret exfiltration to external providers and major integrity impact through host command execution when noSandbox is configured. It is not raised to critical because exploitation requires a victim/operator to run the sandbox workflow on a malicious repository and there is no unauthenticated public network entry point or demonstrated cross-tenant/fleet compromise.
Path
Attacker-controlled repository promptFile --promptFile read and templated--> substitutePromptArgs marks !`...` shell blocks --marked shell syntax survives substitution--> expandPromptShellExpressions enumerates marked blocks --each matched command is executed--> sandbox.exec / noSandbox host shell executes command --stdout captured--> stdout replaces shell block in prompt --expanded prompt passed to provider--> provider.buildPrintCommand sends prompt on stdin
This is a real, reachable security issue in the sandbox agent runtime. Prompt.ts defines !`...` shell blocks, marks them during promptFile substitution, then expandPromptShellExpressions executes each matched command through sandbox.exec and substitutes stdout back into the prompt. Run.ts uses this path for promptFile prompts and merges resolved, sandbox-provider, and agent-provider environment variables before sandbox creation. Orchestrator.ts expands shell expressions immediately before provider.buildPrintCommand, and Codex/Claude provider code sends the expanded prompt as stdin. Container providers receive the merged env at container start, and noSandbox runs the command through the host shell with the merged env. This creates a practical path from attacker-controlled repository prompt content to sandbox/host command execution and secret-bearing stdout being sent to an external AI provider. The issue remains high impact, but not critical, because it requires operator interaction/normal workflow execution against a malicious repository rather than unauthenticated remote reachability.
Likelihood
Medium - Exploitation is straightforward once an operator runs the sandbox workflow against an attacker-controlled repository promptFile, and no special privileges are required by the attacker beyond controlling repo content. However, it is not remotely reachable over a public network by default and requires user/operator interaction, so likelihood is medium rather than high.
Impact
High - The vulnerable path can execute attacker-supplied shell commands during normal agent orchestration. With noSandbox this is host command execution as the local user. With container/podman providers, it still executes inside the sandbox with merged provider/resolved environment variables, and command stdout is embedded into prompts sent to AI provider CLIs, enabling leakage of API keys or other environment/file data visible to the sandbox. Unbounded concurrent expansion also creates a credible resource-exhaustion vector.
Assumptions
A realistic attacker can contribute or supply repository content, including a prompt template file such as .sandcastle/prompt.md, consistent with the provided threat model.
An operator runs the sandbox/agent workflow against that repository using promptFile/template-based prompts, which is normal use for the @beep/sandbox package.
Agent provider prompts may be sent to external AI services by provider CLIs such as Codex or Claude.
Environment variables supplied to agentProviderEnv, sandboxProviderEnv, or resolved from .sandcastle/.env may contain API keys or other credentials.
attacker-controlled repository prompt template content
victim/operator runs the sandbox agent workflow with promptFile/template prompt resolution
for host command execution, noSandbox provider or equivalent host-local provider is selected
for secret exfiltration, sensitive provider/resolved environment variables are available to the sandbox run
Controls
No public ingress or listening port is required for this path; it is triggered by local/operator run workflow.
Inline prompts are not passed through the same shell-block marking path when promptArgs are absent, reducing but not eliminating exposure.
Container providers provide a sandbox boundary for host filesystem access, but the prompt-sourced command still executes and can read sandbox-visible env and mounts.
noSandbox has no sandbox boundary and runs commands as the host user.
There is a per-expression timeout, but command expansion uses unbounded concurrency and lacks a total output or command-count limit.
No trust check, opt-in flag, authorization check, or allowlist gates prompt-sourced shell expansion.
Blindspots
Repository could not be fully built/tested in this environment due dependency/registry limitations noted by validation, so this assessment relies on static code plus the provided standalone executable PoC evidence.
No cloud APIs or live provider services were called; actual provider exfiltration was inferred from provider command construction and stdin flow.
Deployment-specific sandbox choices, mounted paths, environment variable contents, and network egress policies are not visible from static repository artifacts.
The exact prevalence of noSandbox use in production workflows is not proven by the inspected files.
Finding content copied
```
