# CSF-015: Timer generator allows shell and systemd injection

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | 4a06615 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/library/ai-metrics |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

Introduced: the new forwarder timer workflow can generate systemd units containing shell metacharacter or unit-file directive injection from untrusted or attacker-influenced path/URL inputs. The fix should avoid `bash -lc` where possible, build argv safely, shell-quote every command argument, validate/reject control characters and newlines in systemd fields, and quote/sanitize generated unit filenames and service names.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: AI metrics timer generation no longer embeds attacker-controlled strings as raw systemd or shell syntax. Unit names and metadata are sanitized, and ExecStart is built by shell-quoting an argv array.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/tooling/library/ai-metrics/test/ingest.test.ts --test-name-pattern "forwarder timer|timer" && bun test packages/tooling/tool/cli/test/ai-metrics-command.test.ts --test-name-pattern "forwarder timer"`
- Changed files:
  - packages/tooling/library/ai-metrics/src/forwarder.ts
  - packages/tooling/library/ai-metrics/test/ingest.test.ts
  - packages/tooling/tool/cli/src/commands/AIMetrics/index.ts
  - packages/tooling/tool/cli/test/ai-metrics-command.test.ts
- Verification notes:
  - Focused timer tests pass and include a regression for unit-field sanitization plus shell quoting.

## Evidence Paths

- packages/tooling/library/ai-metrics/src/forwarder.ts
- packages/tooling/tool/cli/src/commands/AIMetrics/index.ts

## Validation Notes From Codex

- Confirm the commit introduced the timer renderer/CLI path and that timer input fields are plain strings without shell/systemd control-character validation.
- Confirm attacker-controlled CLI values such as --data-root, --otlp-base-url, and --repo-root reach the timer plan without safe argv construction or shell quoting.
- Dynamically demonstrate generated ExecStart=/usr/bin/env bash -lc ... executes shell metacharacters from the command path.
- Demonstrate raw WorkingDirectory= permits newline-based systemd directive injection and that systemd accepts the rendered unit shape.
- Full end-to-end bun run beep ... systemctl --user enable --now was not possible in this container because workspace dependencies are missing and systemd is not PID 1; validation used source-cited rendering plus non-interactive execution traces instead.

## Sanitized Finding Content

```text
Finding
Timer generator allows shell and systemd injection
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
4a06615
9:52 PM May 8, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
Introduced: the new forwarder timer workflow can generate systemd units containing shell metacharacter or unit-file directive injection from untrusted or attacker-influenced path/URL inputs. The fix should avoid `bash -lc` where possible, build argv safely, shell-quote every command argument, validate/reject control characters and newlines in systemd fields, and quote/sanitize generated unit filenames and service names.
The commit adds a systemd user timer generator for the AI metrics forwarder. The generated service runs `bash -lc`, and `renderAiMetricsForwarderTimerPlan` inserts `input.command` directly after `flock` without shell quoting. The CLI builds that command from user-controlled fields such as `--data-root` and `--otlp-base-url` without quoting them. For example, a data root like `/tmp/metrics; touch /tmp/pwn #` would be embedded into the generated ExecStart command and executed when the user installs/enables the rendered timer. The service file also writes `WorkingDirectory=${input.workingDirectory}` without rejecting newlines or escaping systemd unit syntax, so a malicious repo path could inject additional unit directives. This is especially risky because the renderer prints install commands that write the unit and enable the timer.
Validation
Confirm the commit introduced the timer renderer/CLI path and that timer input fields are plain strings without shell/systemd control-character validation.
Confirm attacker-controlled CLI values such as --data-root, --otlp-base-url, and --repo-root reach the timer plan without safe argv construction or shell quoting.
Dynamically demonstrate generated ExecStart=/usr/bin/env bash -lc ... executes shell metacharacters from the command path.
Demonstrate raw WorkingDirectory= permits newline-based systemd directive injection and that systemd accepts the rendered unit shape.
Full end-to-end bun run beep ... systemctl --user enable --now was not possible in this container because workspace dependencies are missing and systemd is not PID 1; validation used source-cited rendering plus non-interactive execution traces instead.
Validation artifact
Evidence
packages/tooling/library/ai-metrics/src/forwarder.ts
277
const execCommand = [
278
"set -euo pipefail",
279
`mkdir -p "$(dirname ${shellQuote(input.statusPath)})" "$(dirname ${shellQuote(input.lockPath)})"`,
280
`flock -n ${shellQuote(input.lockPath)} ${input.command} > ${shellQuote(statusTmpPath)}`,
281
`mv ${shellQuote(statusTmpPath)} ${shellQuote(input.statusPath)}`,
282
].join("; ");
283
const serviceUnit = [
284
"[Unit]",
285
"Description=Beep AI metrics forwarder collection",
286
"Documentation=AGENTS.md",
287
"",
288
"[Service]",
289
"Type=oneshot",
290
`WorkingDirectory=${input.workingDirectory}`,
291
`EnvironmentFile=${envFileUnitPath}`,
292
`ExecStart=/usr/bin/env bash -lc ${shellQuote(execCommand)}`,
327
return new AiMetricsForwarderTimerPlan({
328
installCommands: [
329
`mkdir -p ~/.config/systemd/user ~/.config/beep "$(dirname ${shellQuote(input.statusPath)})"`,
330
...writeEnvFileCommands,
331
`printf '%s\\n' ${shellQuote(serviceUnit)} > ~/.config/systemd/user/${serviceUnitName}`,
332
`printf '%s\\n' ${shellQuote(timerUnit)} > ~/.config/systemd/user/${timerUnitName}`,
333
`systemctl --user daemon-reload`,
334
`systemctl --user enable --now ${timerUnitName}`,
335
`systemctl --user status ${timerUnitName}`,
336
`journalctl --user -u ${serviceUnitName} -n 80 --no-pager`,
packages/tooling/tool/cli/src/commands/AIMetrics/index.ts
1283
const dataRootFlag = ` --data-root ${spec.storage.dataRoot}`;
1284
const hashSaltSecretRefFlagText =
1285
resolvedHashSaltSecretRef === undefined ? "" : ` --hash-salt-secret-ref ${shellQuote(resolvedHashSaltSecretRef)}`;
1286
const rawArchiveKeySecretRefFlagText =
1287
resolvedRawArchiveKeySecretRef === undefined
1288
? ""
1289
: ` --raw-archive-key-secret-ref ${shellQuote(resolvedRawArchiveKeySecretRef)}`;
1290
const otlpFlagText =
1291
target === AiMetricsDeployTarget.Enum.dankserver ? ` --otlp --otlp-base-url ${endpoint.baseUrl}` : "";
1292
const plan = renderAiMetricsForwarderTimerPlan(
1293
new AiMetricsForwarderTimerInput({
1294
command: `bun run beep ai-metrics forwarder run --target ${target}${dataRootFlag}${hashSaltSecretRefFlagText}${rawArchiveKeySecretRefFlagText}${otlpFlagText} --json`,
1297
lockPath: "%t/beep-ai-metrics-forwarder.lock",
1298
...(resolvedRawArchiveKeySecretRef === undefined
1299
? {}
1300
: { rawArchiveKeySecretRef: resolvedRawArchiveKeySecretRef }),
1301
statusPath: `${spec.storage.dataRoot}/forwarder/status/latest.json`,
1302
workingDirectory: yield* resolveRepoRoot(repoRoot),
Attack-path analysis
Adjusted from high to medium. The code evidence supports a real shell/systemd injection bug, and validation described executable traces showing shell metacharacters and newline-based unit injection. However, the affected component is local AI metrics/operator tooling, not the primary exposed sidecar or AI SDK network service. Exploitation requires user-assisted local operation: attacker-controlled values must reach --data-root, --otlp-base-url, --repo-root/current working directory, or equivalent renderer input, and the victim must install/enable the generated systemd user timer. The resulting code execution is as the same OS user rather than root/cloud identity. That is security-relevant but does not meet high severity for this repository's main threat model.
Path
Local AI metrics CLI timer command --attacker-influenced CLI fields flow into command string--> Unquoted dataRoot/otlpBaseUrl command construction --raw command string is spliced after flock--> Timer renderer creates bash -lc systemd unit --renderer prints install commands for ~/.config/systemd/user--> Operator installs/enables user timer --systemd user service runs ExecStart=/usr/bin/env bash -lc ...--> Command execution as installing OS user
The finding is technically valid: AiMetricsForwarderTimerInput accepts plain strings, the renderer inserts input.command unquoted into a bash -lc payload after flock, and the CLI builds that command using unquoted dataRoot and otlpBaseUrl. WorkingDirectory is also written directly into the systemd unit, so newline/control-character input can inject unit directives. The generated install commands write the unit under ~/.config/systemd/user and enable the timer. The main limiting factor is reachability: this is local developer/operator tooling with no network listener, and exploitation requires user-assisted influence over CLI/path inputs plus timer installation. Impact is meaningful for the local user account, but the path does not justify high severity in the main product threat model.
Likelihood
Low - The vulnerable sink is real and normal CLI output encourages installing the generated timer, but an attacker must plausibly influence local CLI/path values and rely on operator interaction. It is not exposed over the network and is not a broad product runtime endpoint.
Impact
Medium - Successful exploitation can execute arbitrary commands as the local user who installs the timer and can access that user's source code, AI metrics archives, environment, and user-readable secrets. There is no evidence of remote unauthenticated execution, root privilege escalation, or cross-tenant impact.
Assumptions
The AI metrics CLI and @beep/repo-ai-metrics timer renderer are part of repository tooling intended for developer/operator workstation use.
The attacker cannot directly call the renderer over a network service; exploitation requires influencing local CLI arguments, the working directory/repo path, or copied installation commands.
The generated systemd unit runs under the same OS user that installs/enables the user timer, not as root or a cloud service principal.
Victim/operator runs the AI metrics forwarder timer CLI or consumes its rendered plan
Attacker influences --data-root, --otlp-base-url, --repo-root/current working directory, or another value used to build the timer command/unit
Victim installs/enables the rendered systemd user timer or otherwise executes the generated ExecStart shell payload
Controls
Local-only CLI workflow; no repository evidence of public ingress, listener, load balancer, or remote API for this timer renderer
systemd user timer runs as the installing user rather than root
Some secret reference fields are shell-quoted, but dataRoot, otlpBaseUrl, input.command, WorkingDirectory, and unit names are not fully protected
Blindspots
Static review only; the full CLI could not be executed end-to-end in this environment due to missing workspace dependencies noted by validation.
No package publication/deployment manifest was reviewed to determine how widely the AI metrics CLI is distributed to end users.
No runtime systemd installation was performed; assessment relies on source evidence and prior non-interactive PoC traces.
Could not determine whether external documentation or install automation feeds untrusted dataRoot/otlpBaseUrl values into this workflow.
Finding content copied
Finding content copied
```
