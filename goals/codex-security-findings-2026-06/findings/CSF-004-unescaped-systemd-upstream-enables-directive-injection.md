# CSF-004: Unescaped systemd upstream enables directive injection

## Metadata

| Field | Value |
|---|---|
| Severity | Medium |
| Codex status | New |
| Repository | kriegcloud/beep-effect |
| Source commit | 241a206 |
| Reported age | 21h ago |
| Capture method | dom-get-page-text |
| Owner area | packages/tooling/tool |
| Lane | _pending P4_ |
| Disposition | _pending P2_ |
| Triage verdict | _pending P2_ |
| Codex close reason | _pending P2_ |

## Summary

Introduced. Before this commit the managed service unit used a hard-coded GRAPHITI_PROXY_UPSTREAM value. The commit changed it to use config.upstreamMcpUrl sourced from options or GRAPHITI_PROXY_UPSTREAM, but did not validate that it is a URL or escape it for systemd unit syntax before writing and starting the unit.

ProxyOps now accepts an upstreamMcpUrl option and otherwise reads GRAPHITI_PROXY_UPSTREAM, stores it as an unconstrained string, and interpolates it into an Environment= line in the generated user-level systemd service. Because unit files are line-oriented, an upstream value containing newlines can terminate the Environment directive and add arbitrary [Service] directives, such as clearing ExecStart and adding a replacement ExecStart. installGraphitiProxyService writes this generated unit and immediately daemon-reloads, enables, starts, and restarts it. The practical impact is arbitrary command execution as the user running the service installation or restore command when an attacker can influence the environment/options used for the command. This is not a shell-argument injection in systemctl, but a systemd unit-file injection caused by writing untrusted text into the unit without URL validation and systemd escaping.

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

- packages/tooling/tool/cli/src/commands/Graphiti/internal/ProxyOps.ts

## Validation Notes From Codex

- Confirm the suspected commit introduced a configurable upstream value in the managed service path rather than the prior hard-coded unit value.
- Confirm the upstream value is sourced from options or GRAPHITI_PROXY_UPSTREAM without URL validation, newline rejection, or systemd escaping.
- Confirm the renderer writes that value directly into a line-oriented systemd Environment= directive.
- Confirm the install/restore path writes the rendered unit and invokes systemd reload/enable/restart so injected directives would be parsed and executed by the user service manager.
- Confirm a concrete malicious upstream produces accepted systemd syntax containing attacker-controlled service directives.

## Sanitized Finding Content

```text
Finding
Unescaped systemd upstream enables directive injection
Report
Chat
Severity
Medium

Commit
241a206
11:57 PM Jun 7, 2026

by elpresidank

Repository
kriegcloud/beep-effect
Summary

Introduced. Before this commit the managed service unit used a hard-coded GRAPHITI_PROXY_UPSTREAM value. The commit changed it to use config.upstreamMcpUrl sourced from options or GRAPHITI_PROXY_UPSTREAM, but did not validate that it is a URL or escape it for systemd unit syntax before writing and starting the unit.

ProxyOps now accepts an upstreamMcpUrl option and otherwise reads GRAPHITI_PROXY_UPSTREAM, stores it as an unconstrained string, and interpolates it into an Environment= line in the generated user-level systemd service. Because unit files are line-oriented, an upstream value containing newlines can terminate the Environment directive and add arbitrary [Service] directives, such as clearing ExecStart and adding a replacement ExecStart. installGraphitiProxyService writes this generated unit and immediately daemon-reloads, enables, starts, and restarts it. The practical impact is arbitrary command execution as the user running the service installation or restore command when an attacker can influence the environment/options used for the command. This is not a shell-argument injection in systemctl, but a systemd unit-file injection caused by writing untrusted text into the unit without URL validation and systemd escaping.

Validation
Confirm the suspected commit introduced a configurable upstream value in the managed service path rather than the prior hard-coded unit value.
Confirm the upstream value is sourced from options or GRAPHITI_PROXY_UPSTREAM without URL validation, newline rejection, or systemd escaping.
Confirm the renderer writes that value directly into a line-oriented systemd Environment= directive.
Confirm the install/restore path writes the rendered unit and invokes systemd reload/enable/restart so injected directives would be parsed and executed by the user service manager.
Confirm a concrete malicious upstream produces accepted systemd syntax containing attacker-controlled service directives.
Validation artifact
Evidence
packages/tooling/tool/cli/src/commands/Graphiti/internal/ProxyOps.ts
39 type GraphitiProxyServiceInstallOptions = { readonly upstreamMcpUrl?: string | undefined;
122 export class ProxyServiceConfig extends S.Class<ProxyServiceConfig>($I`ProxyServiceConfig`)({ serviceFile, serviceName, stateDir, systemdUserDir, upstreamMcpUrl: S.String })
219 const proxyServiceConfig = (path, options = {}): ProxyServiceConfig => { ... const upstreamMcpUrl = pipe(O.fromUndefinedOr(options.upstreamMcpUrl), O.filter(Str.isNonEmpty), O.getOrElse(() => envValue("GRAPHITI_PROXY_UPSTREAM", DEFAULT_GRAPHITI_UPSTREAM_MCP_URL))) ...
295 upstreamMcpUrl: envValue("GRAPHITI_PROXY_UPSTREAM", DEFAULT_GRAPHITI_UPSTREAM_MCP_URL)
863 yield* installGraphitiProxyService({ upstreamMcpUrl: config.upstreamMcpUrl })
1239 const renderServiceUnit = (repoRoot, bunBin, config): string => A.join(["[Unit]", ..., "[Service]", ..., `Environment=GRAPHITI_PROXY_UPSTREAM=${config.upstreamMcpUrl}`, ...])
1333 yield* fs.writeFileString(config.serviceFile, renderServiceUnit(repoRoot, bunBin, config))
1337-1357 runInheritedStep systemctl --user daemon-reload / enable --now / restart config.serviceName

Attack-path analysis

Kept at medium. The code evidence validates a real systemd unit-file injection: unvalidated upstreamMcpUrl/GRAPHITI_PROXY_UPSTREAM reaches `Environment=GRAPHITI_PROXY_UPSTREAM=${config.upstreamMcpUrl}` and the installer immediately writes and restarts the user service. The impact can be arbitrary command execution as the invoking OS user, but the attack path is local/developer-tooling only and requires attacker control of the command environment/options plus victim execution of install/restore. There is no evidence of internet exposure, root execution, privilege escalation beyond the same user, or cross-tenant/cloud compromise, so high/critical would overstate the practical reachability.

Path
GRAPHITI_PROXY_UPSTREAM / upstreamMcpUrl --accepted without URL/newline validation--> proxyServiceConfig stores plain S.String --interpolated into line-oriented unit syntax--> renderServiceUnit writes unescaped Environment line --written to serviceFile--> user systemd unit file --daemon-reload and restart--> systemctl --user enable/restart --injected ExecStart parsed/executed--> command execution as installing OS user

Likelihood
Low - The vulnerable sink is deterministic once reached, and parser validation supports exploitability. However, reaching it requires attacker influence over a local environment variable/options and user interaction to run a local CLI service install/restore flow with user systemd available; no remote or unauthenticated product endpoint is evidenced.
Impact
High - Successful exploitation can replace or alter ExecStart and run arbitrary commands with the privileges of the user installing/restoring the Graphiti proxy service, enabling compromise of that user's files, processes, and local persistence. It does not demonstrate root privilege escalation, cloud identity compromise, or unauthenticated remote reachability.
Assumptions
The relevant attacker influence is over GRAPHITI_PROXY_UPSTREAM or the internal upstreamMcpUrl option before a victim/operator runs the Graphiti proxy service install or restore command.
A standard systemd user instance parses unit files as line-oriented configuration and honors injected Service directives after daemon-reload/restart.
Victim/operator runs `bun run beep graphiti proxy service install` or `bun run beep graphiti restore` in an environment influenced by the attacker.
Controls
No public ingress or load balancer evidenced for the vulnerable install path. Generated service is a user-level systemd service, not a root system service. Default proxy host in rendered unit is 127.0.0.1. Exploitation requires install/restore command execution by the target user.
Blindspots
Static analysis cannot prove all packaging/distribution paths for @beep/repo-cli or how often end users run the Graphiti service commands.
The validation environment lacked a live user systemd instance, so execution was not started end-to-end; systemd-analyze parser verification was provided instead.
```
