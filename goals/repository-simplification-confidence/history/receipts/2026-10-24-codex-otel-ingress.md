# #1866 Codex OTel ingress: witness and collector repair (2026-10-24)

Issue: [#1866](https://github.com/beep-effect/beep-effect/issues/1866), "qualify desktop and native Codex OTel ingress".
Gate in [stage-6-closeout-acceptance.md](./stage-6-closeout-acceptance.md): an operator-only Claude configuration step, plus a payload-free ingress witness from the native client.

## Witness

The operator performed the authenticated step on the monitoring host on 2026-10-24. With that access, the ingress witness ran against the self-hosted OpenTelemetry Collector (`otel/opentelemetry-collector-contrib:0.163.1`), whose metrics pipeline exports to Prometheus. It used a probe `codex exec` run under a Claude Code session's environment. All evidence below is label keys, counts and timestamps only. No payload, prompt or user value was read or recorded.

The witness found a real ingress defect, which was then fixed.

## Defect: Claude-launched Codex series never reached Prometheus

Two resource attributes with different keys collapse to one Prometheus label name:

| Resource key | Source | Prometheus label |
| --- | --- | --- |
| `os.version` | `OTEL_RESOURCE_ATTRIBUTES` that the Codex child inherits from the parent Claude Code session (kernel release) | `os_version` |
| `os_version` | Codex's native resource attribute (distro release) | `os_version` |

Any Codex process started from a Claude Code session merges the inherited environment into its resource, and so carries both keys with different values. That covers Codex lanes, the Codex plugin and `codex exec`. The exporter's `resource_constant_labels: ["*"]` copies every resource attribute onto each datapoint. Once both keys sanitize to the same name, client_golang rejects the descriptor with "duplicate label names in constant and variable labels". Codex processes started outside Claude, such as the Desktop app-server or a plain terminal, carry only `os_version` and exported normally. That explains why Codex ingress looked partially healthy.

Measured on the old config:
- 109,485 duplicate-label errors in the two hours before the fix, a steady 800–856 per minute;
- 199 errors from the single probe run.

## Repair

The collector config gains one metrics-pipeline processor, `transform/prom-label-collisions`, placed after the existing PII scrub processors and before `batch`. It runs only when both keys are present: it moves the inherited `os.version` to `os.version.inherited` and keeps both values. Resources with only Codex or only Claude attributes are untouched. The PII scrub processors, their order, `resource_constant_labels`, the traces pipeline and every other container are unchanged.

`otelcol-contrib validate` passed against the new config, which was applied in place. Rewriting the file in place preserves the bind-mounted inode.

## Verification (fixed config)

| Check | Result |
| --- | --- |
| Duplicate-label errors after restart, including a fresh probe run under Claude's environment | **0**, and no error-level log lines of any kind |
| `max by (service_name)(timestamp(codex_websocket_event_total))` | fresh for `codex_exec` and `codex-app-server` |
| `max by (service_name)(timestamp(codex_turn_token_usage_count))` | fresh for `codex_exec` (the probe series; this kind of series never reached Prometheus before the fix) |
| `count by (service_name)({__name__=~"codex_.*", os_version_inherited!=""})` | 7,382 `codex_exec` series, the previously dropped Claude-launched series |
| Label keys on `codex_turn_token_usage_count{os_version_inherited!=""}` | include `os_version` and `os_version_inherited`; no `user_email` |
| `max by (service_name)(timestamp(claude_code_token_usage_tokens_total))` | Claude Code series still fresh (desktop and CLI) |
| PII: `count({__name__=~".+", user_email=~".+"})` and the 30-day `last_over_time` form | both empty |

## Acceptance

#1866's gate is met. The operator-only step was performed, the payload-free native ingress witness ran, and both Codex and Claude Code series now arrive with zero conversion errors. The witness also surfaced a defect that silently dropped every Claude-launched Codex series, and that defect is fixed at its root in the collector.

Consequence for [#1868](https://github.com/beep-effect/beep-effect/issues/1868): Claude-launched Codex sessions were never collected before about 01:36Z on 2026-10-24. Their current-regime 30-session window therefore starts at the fix.

## Rollback

On the monitoring host, restore `~/monitoring/otel/config.yaml` from its dated backup, `config.yaml.bak-2026-10-24-codex-labels`. Use `cat backup > config.yaml` so the bind-mounted inode is kept, then restart the collector container.

## Not changed here

Workstation-side, the inherited `OTEL_RESOURCE_ATTRIBUTES`/`OTEL_SERVICE_NAME` still reach Codex children. The collector guard is correct whether or not launchers later scrub them.
