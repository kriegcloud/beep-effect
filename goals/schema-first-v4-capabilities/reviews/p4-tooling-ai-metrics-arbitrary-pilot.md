# P4 Tooling AI-Metrics Arbitrary Pilot

Date: 2026-06-08

## Completed

- Remediated `packages/tooling/tool/cli/test/ai-metrics-command.test.ts` from
  the `SFV4-arbitrary-tests` advisory inventory.
- Added property coverage deriving report values from existing
  `@beep/repo-ai-metrics` source schemas:
  - `AiMetricsForwarderRunResult`;
  - `AiMetricsLabelQueueResult`;
  - `AiMetricsMirrorBundleResult`;
  - `AiMetricsOtlpExportResult`;
  - `AiMetricsWeeklyReportResult`.
- Proved generated values encode through `S.fromJsonString(...)`, decode back
  through the command-test decoders, and re-encode to the same JSON boundary.
- Kept exact CLI fixtures for ingest privacy, source discovery, forwarder runs,
  installs, OTLP export, mirror bundles, and weekly reports.
- Refreshed `standards/schema-first.inventory.jsonc`; live arbitrary-test
  advisories now report 7 tracked files.

## Review Notes

This pilot covers a representative cross-section of AI-metrics command outputs:
forwarder storage summaries, label queues, mirror bundle metadata, OTLP export
counts, and weekly-report envelopes. It uses the source schemas exported by
`@beep/repo-ai-metrics` rather than defining a weaker test-only schema.

The generated law intentionally avoids the broader install and source-discovery
reports for this first tooling slice. They are valid candidates, but their
derived arbitraries produce larger nested payloads and are better handled after
the packet evaluates reusable bounded arbitrary annotations for verbose report
sections.

Effect v4 source grounding: `.repos/effect-v4/packages/effect/SCHEMA.md`
documents `Schema.toArbitrary`, schema arbitrary annotations, and using generated
data to exercise schema encode/decode laws.

## Verification

```sh
cd packages/tooling/tool/cli && bun run beep:test -- ai-metrics-command.test.ts
cd packages/tooling/tool/cli && bun run check
cd packages/tooling/tool/cli && bun run lint
bun run beep lint schema-first --write
bun run beep lint schema-first
```
