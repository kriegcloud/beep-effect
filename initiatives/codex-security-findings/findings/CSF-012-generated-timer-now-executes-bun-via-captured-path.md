# CSF-012: Generated timer now executes Bun via captured PATH

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | Closed |
| Repository | kriegcloud/beep-effect |
| Source commit | dc0a1f0 |
| Reported age | 1w ago |
| Capture method | dom-fallback |
| Owner area | packages/tooling/library/ai-metrics |
| Triage verdict | fixed |
| Codex close reason | Already fixed |

## Summary

A security regression was introduced: the generated systemd timer no longer pins the Bun executable path and instead relies on a captured PATH plus an unqualified `bun` command.

## Current-HEAD Triage

- Verdict: `fixed`
- Rationale: Generated AI metrics timer units now use an argv array with the current Bun executable path instead of a PATH-captured shell command. The systemd ExecStart command is shell-quoted from argv, and generated unit metadata is control-character sanitized.
- Remediation status: `fixed-in-branch`
- Verification command: `bun test packages/tooling/library/ai-metrics/test/ingest.test.ts --test-name-pattern "forwarder timer|timer" && bun test packages/tooling/tool/cli/test/ai-metrics-command.test.ts --test-name-pattern "forwarder timer" && bunx tsc --noEmit --pretty false -p packages/tooling/tool/cli/tsconfig.json`
- Changed files:
  - packages/tooling/library/ai-metrics/src/forwarder.ts
  - packages/tooling/library/ai-metrics/test/ingest.test.ts
  - packages/tooling/tool/cli/src/commands/AIMetrics/index.ts
  - packages/tooling/tool/cli/test/ai-metrics-command.test.ts
- Verification notes:
  - Focused timer tests pass for both the library and CLI, and the CLI typecheck passes after rebuilding the local ai-metrics package artifacts.

## Evidence Paths

- packages/tooling/library/ai-metrics/src/forwarder.ts
- packages/tooling/tool/cli/src/commands/AIMetrics/index.ts

## Validation Notes From Codex

- Confirm the checked-out commit changed AI metrics timer generation from pinned process.execPath to /usr/bin/env PATH=<captured> bun.
- Confirm the generated systemd service executes that command via bash -lc and includes an EnvironmentFile, making timer secrets available to the resolved process.
- Confirm quoting protects the PATH as one shell token but does not pin which bun executable is selected.
- Dynamically demonstrate that an attacker-controlled directory earlier in captured PATH causes /usr/bin/env ... bun to execute attacker-controlled code with the intended CLI arguments.
- Obtain debugger/dynamic evidence of the exec chain and document why crash/valgrind are not applicable or unavailable.

## Sanitized Finding Content

```text
Finding
Generated timer now executes Bun via captured PATH
Report
Chat
Severity
Medium
Adjust to improve accuracy in future scans
Commit
dc0a1f0
3:22 AM May 9, 2026
by elpresidank
Repository
kriegcloud/beep-effect
Summary
A security regression was introduced: the generated systemd timer no longer pins the Bun executable path and instead relies on a captured PATH plus an unqualified `bun` command.
Previously, the rendered timer command invoked the exact executable from process.execPath. The new code emits `/usr/bin/env PATH=<captured PATH> bun ...`, so systemd ultimately runs `bun` by searching the captured PATH. If any directory earlier in that captured PATH is attacker-writable, or if an attacker can influence PATH before an operator renders and installs the timer, the scheduled service can execute an attacker-controlled `bun` binary in the timer user's context. That context can include AI metrics environment-file secrets and access to the user's local files. Shell quoting prevents straightforward shell metacharacter injection into the PATH value, but it does not mitigate executable search-order hijacking, and the captured PATH is embedded into a generated unit that is later executed repeatedly.
Validation
Confirm the checked-out commit changed AI metrics timer generation from pinned process.execPath to /usr/bin/env PATH=<captured> bun.
Confirm the generated systemd service executes that command via bash -lc and includes an EnvironmentFile, making timer secrets available to the resolved process.
Confirm quoting protects the PATH as one shell token but does not pin which bun executable is selected.
Dynamically demonstrate that an attacker-controlled directory earlier in captured PATH causes /usr/bin/env ... bun to execute attacker-controlled code with the intended CLI arguments.
Obtain debugger/dynamic evidence of the exec chain and document why crash/valgrind are not applicable or unavailable.
Validation artifact
Evidence
packages/tooling/library/ai-metrics/src/forwarder.ts
313
`WorkingDirectory=${input.workingDirectory}`,
314
`EnvironmentFile=${envFileUnitPath}`,
315
"# The command may capture PATH at render time so user-local Bun can be found; rerender after changing Bun install paths.",
316
`ExecStart=/usr/bin/env bash -lc ${shellQuote(execCommand)}`,
packages/tooling/tool/cli/src/commands/AIMetrics/index.ts
1319
const cliCommand = `/usr/bin/env PATH=${shellQuote(process.env.PATH ?? "")} bun packages/tooling/tool/cli/src/bin.ts --`;
1320
const plan = renderAiMetricsForwarderTimerPlan(
1321
new AiMetricsForwarderTimerInput({
1322
command: `${cliCommand} ai-metrics forwarder run --target ${target}${dataRootFlag}${hashSaltSecretRefFlagText}${rawArchiveKeySecretRefFlagText}${otlpFlagText}${maxFileBytesFlagText}${maxFilesFlagText} --json`,
Attack-path analysis
Medium is retained. The code evidence directly supports the vulnerability: an unqualified `bun` is executed via a captured PATH in a generated systemd user service, and the service loads an AI metrics EnvironmentFile. This creates credible local code execution and secret exposure if a PATH directory is attacker-writable or PATH is attacker-influenced. Severity should not be raised because the vulnerable component is local tooling/workstation ops, has no public ingress, requires operator interaction to render/install the timer, and runs as the user rather than root. It should not be ignored because the timer workflow is a real CLI/ops path in the repository and protects real AI metrics secret references.
Path
Operator runs bun run beep ai-metrics forwarder timer --normal CLI render path--> CLI embeds process.env.PATH and unqualified bun --command embedded in service plan--> Rendered systemd user service ExecStart runs bash -lc --systemd loads EnvironmentFile--> systemd service loads %h/.config/beep/ai-metrics.env --ExecStart evaluates command and resolves bun by PATH--> PATH search executes attacker-controlled bun --malicious executable inherits service context--> Code execution as timer user; AI metrics env secrets/data exposed
The finding is real: the commit changed timer rendering from a quoted absolute `process.execPath` to `/usr/bin/env PATH=${shellQuote(process.env.PATH ?? "")} bun ...`, and the timer service later runs that command through `ExecStart=/usr/bin/env bash -lc ...`. Shell quoting keeps PATH as one token, but it does not bind the executable identity; `/usr/bin/env` will search the captured PATH for `bun` each time the timer runs. The service also declares `EnvironmentFile=%h/.config/beep/ai-metrics.env`, and install commands populate that file with AI metrics secret environment variables resolved from secret refs. The attack is not remotely exposed and requires local/operator-environment preconditions, so medium is appropriate rather than high or critical. Impact is still security-relevant because a malicious Bun can execute as the timer user and inherit AI metrics secrets and local user file access.
Likelihood
Low - Exploitation requires local preconditions: attacker influence over the operator's render-time PATH or write access to an earlier PATH directory, plus operator installation of the generated timer. These are plausible in unsafe developer environments but not default remote exposure.
Impact
High - Successful exploitation executes attacker-controlled code as the timer user and can expose or modify that user's AI metrics data, local files, and environment-file secrets such as the AI metrics hash salt and raw archive key. The impact is bounded to the local user context; there is no evidence of root execution or public service compromise.
Assumptions
Operators use the repository CLI to render the AI metrics forwarder timer and install the printed systemd user units.
The attacker can either influence PATH before timer rendering or can write a malicious executable named bun into a directory that appears before the legitimate Bun executable in the captured PATH.
The generated service runs in the operator's systemd --user context, not as root.
No cloud APIs were queried; conclusions are based on repository artifacts and supplied validation evidence.
Operator renders the timer using the affected CLI command.
Operator installs/enables the rendered systemd user timer.
Captured PATH contains an attacker-writable or attacker-influenced directory before the trusted Bun executable.
The timer later starts and resolves the unqualified bun command through that PATH.
Controls
Affected service is a systemd user service, not a repository-evidenced root service.
No public ingress, listener, load balancer, or network port is required for the vulnerable path.
Environment file is rendered with install -m 0600.
Secret values are referenced through environment variables and 1Password-style refs rather than committed plaintext.
shellQuote prevents straightforward shell metacharacter injection into PATH and other flags.
Operator must render and install the timer before the vulnerable runtime path exists.
Blindspots
Repository artifacts cannot prove the actual PATH contents or directory permissions on operator workstations.
Static review cannot verify whether any production workstation has already installed the generated timer.
The analysis did not build or execute the full CLI; dependency/runtime behavior is taken from source and supplied validation evidence.
Bun's exact script-runner PATH augmentation is environment-dependent and was not relied on for final severity.
The AI metrics tooling is less central than the desktop sidecar/AI SDK services, so deployment prevalence is uncertain.
Finding content copied
Finding content copied
```
