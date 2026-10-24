# #1866 Codex OTel ingress: witness and collector repair (2026-10-24)

Issue: [#1866](https://github.com/beep-effect/beep-effect/issues/1866), "qualify desktop and native Codex OTel ingress".
Gate in [stage-6-closeout-acceptance.md](./stage-6-closeout-acceptance.md): an operator-only Claude configuration step, plus a payload-free ingress witness from the native client.

## Witness

The operator performed the authenticated step on the monitoring host on 2026-10-24. With that access, the ingress witness ran against the self-hosted OpenTelemetry Collector (`otel/opentelemetry-collector-contrib:0.163.1`), whose metrics pipeline exports to Prometheus. The fix agent reproduced the defect with a probe `codex exec` whose environment it set by hand to Claude Code's resource attributes. That probe is a reproduction, not evidence of how real Codex processes get their attributes (see Provenance). All evidence below is label keys, counts and timestamps only. No payload, prompt or user value was read or recorded.

The witness found a real ingress defect, which was then fixed.

## Defect: Codex series carrying both `os.version` and `os_version` never reached Prometheus

Two resource attributes with different keys collapse to one Prometheus label name:

| Resource key | Source | Prometheus label |
| --- | --- | --- |
| `os.version` | unattributed second resource source (kernel release); see Provenance | `os_version` |
| `os_version` | Codex's native resource attribute (distro release) | `os_version` |

A Codex resource that carries both keys, with different values, cannot be exported. The exporter's `resource_constant_labels: ["*"]` copies every resource attribute onto each datapoint. Once both keys sanitize to the same name, client_golang rejects the descriptor with "duplicate label names in constant and variable labels". Codex resources with only `os_version` exported normally, which is why Codex ingress looked partially healthy.

Measured on the old config:
- 109,485 duplicate-label errors in the two hours before the fix, a steady 800–856 per minute;
- 199 errors from the single probe run.

## Repair

The collector config gains one metrics-pipeline processor, `transform/prom-label-collisions`, placed after the existing PII scrub processors and before `batch`. It runs only when both keys are present: it moves the second `os.version` key (of unattributed origin; see Provenance) to `os.version.inherited` and keeps both values. The `os.version.inherited` / `os_version_inherited` name is kept only to stay consistent with the deployed collector config; it does not assert where the key came from. Resources with only Codex or only Claude attributes are untouched. The PII scrub processors, their order, `resource_constant_labels`, the traces pipeline and every other container are unchanged.

`otelcol-contrib validate` passed against the new config, which was applied in place. Rewriting the file in place preserves the bind-mounted inode.

## Verification (fixed config)

| Check | Result |
| --- | --- |
| Duplicate-label errors after restart, including a fresh probe run under Claude's environment | **0**, and no error-level log lines of any kind |
| `max by (service_name)(timestamp(codex_websocket_event_total))` | fresh for `codex_exec` and `codex-app-server` |
| `max by (service_name)(timestamp(codex_turn_token_usage_count))` | fresh for `codex_exec` (the probe series; this kind of series never reached Prometheus before the fix) |
| `count by (service_name)({__name__=~"codex_.*", os_version_inherited!=""})` | 7,382 `codex_exec` series, all from the single 01:36:15Z reproduction probe (see Provenance) |
| Label keys on `codex_turn_token_usage_count{os_version_inherited!=""}` | include `os_version` and `os_version_inherited`; no `user_email` |
| `max by (service_name)(timestamp(claude_code_token_usage_tokens_total))` | Claude Code series still fresh (desktop and CLI) |
| PII: `count({__name__=~".+", user_email=~".+"})` and the 30-day `last_over_time` form | both empty |

## Acceptance

#1866's gate is met. The operator-only step was performed, the payload-free native ingress witness ran, and both Codex and Claude Code series now arrive with zero conversion errors. The witness also surfaced a defect that silently dropped every Codex series carrying both version keys. The collector now accepts such resources and keeps both values.

Consequence for [#1868](https://github.com/beep-effect/beep-effect/issues/1868): any Codex series that carried both keys was dropped before about 01:36Z on 2026-10-24. Codex series with only `os_version` were collected throughout, and those are all of the post-fix traffic so far.

## Rollback

On the monitoring host, restore `~/monitoring/otel/config.yaml` from its dated backup, `config.yaml.bak-2026-10-24-codex-labels`. Use `cat backup > config.yaml` so the bind-mounted inode is kept, then restart the collector container.

## Provenance of the second `os.version` (corrected in review)

An earlier version of this receipt said Codex children inherit Claude Code's resource attributes. That claim was wrong, and the workstation evidence rules it out:
- A Claude Code tool subprocess has no `OTEL_*` variables set, and `OTEL_RESOURCE_ATTRIBUTES` is empty.
- Claude's settings env sets exporter keys only.
- The interactive `claude()` zsh wrapper stamps only `beep.*` keys and `host.name`, never `os.version` or `claude.deployment_mode`.
- Systemd lane units carry no OTEL env.

Prometheus confirms this, using label keys and sample times only:
- `group by (claude_deployment_mode, os_type, host_arch, env)` over 12h: the collided `codex_turn_token_usage_count` series carry `claude_deployment_mode`, `host_arch` and `os_type`. Clean `codex_exec` series carry only `env`. Neither has a `beep_*` key, so the zsh wrapper is not the source.
- `min`/`max_over_time(timestamp(…)[12h:30s])` over the collided series: both are 2026-10-24T01:36:15Z. Every collided series is the single hand-injected reproduction probe.
- `count by (service_name, originator, app_version, session_source)` over 12h: collided series exist only for `codex_exec` 0.164.0 (`session_source=exec`). Desktop, app-server and CLI surfaces show none.

The pre-fix errors (273,338 in the last 6 hours of collector logs) name the metric but not the failing resource, and the failed series never reached Prometheus. Their origin therefore cannot be attributed from stored data, and since the fix no real process has emitted both keys. The source is recorded as unattributed. The collector transform covers it whatever the source turns out to be. If a real collided series ever appears, this query identifies its surface: `count by (service_name, originator, app_version, session_source) ({__name__=~"codex_.*", os_version_inherited!=""})`.
