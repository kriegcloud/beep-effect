# P3 OTLP And Backend Stack

Date: 2026-05-06

Status: completed

## Delivered

- Added install-owned OTLP endpoint contracts for backend services, including
  Phoenix trace URL, protocol, trace-only signal scope, image, health URL, and
  compose service name.
- Kept Phoenix, Langfuse, Opik, and PostHog as backend target contracts; no
  backend-specific driver package was introduced in P3.
- Added generated local Phoenix compose smoke output at
  `ops/local-phoenix.compose.yaml`.
- Added redacted DuckDB-derived OTLP span projections with metadata-only
  OpenInference attributes plus safe `ai_metrics.*` attributes.
- Added `beep-cli ai-metrics install compose` and
  `beep-cli ai-metrics otlp export`.
- Added explicit OTLP enablement for `forwarder run` via flags; default
  durable ingest remains local-only.
- Added trace-only `@beep/observability` Node SDK helpers for Phoenix smoke
  targets.
- Extended `@beep/infra` import-safe outputs with backend services, default
  service, OTLP endpoint, and OTLP trace URL.

## Boundaries

- `@beep/repo-ai-metrics` owns AI metrics export semantics, derived span
  projections, install contracts, and local compose rendering.
- `@beep/observability` owns reusable Effect/OpenTelemetry runtime layer
  construction.
- `@beep/repo-cli` owns operator commands and user-facing output.
- `@beep/infra` owns deploy-plan outputs only in P3; real remote resources and
  host apply remain P5.
- P3 sends traces only to Phoenix. Metrics and logs remain instrumentable but
  are not part of the Phoenix smoke export.

## Evidence

- `bun run --filter @beep/repo-ai-metrics check`
- `bun run --filter @beep/repo-ai-metrics test`
- `bun run --filter @beep/repo-ai-metrics lint`
- `bun run --filter @beep/repo-ai-metrics docgen`
- `bun run --filter @beep/observability check`
- `bun run --filter @beep/observability test`
- `bun run --filter @beep/observability lint`
- `bun run --filter @beep/observability docgen`
- `bun run --filter @beep/repo-cli check`
- `bun run --filter @beep/repo-cli test`
- `bun run --filter @beep/repo-cli lint`
- `cd infra && bun run check && bun run test && bun run lint`
- `bun run config-sync`
- `bun run check`

Synthetic proof coverage includes:

- Local Phoenix compose YAML is generated from the install spec and matched by
  a golden test.
- Derived DuckDB rows produce one session span plus turn spans with
  OpenInference metadata and no raw prompt/output/path content.
- CLI OTLP export failures render sanitized command diagnostics.
- Non-local OTLP export accepts install secret references before attempting the
  derived DuckDB export path.
- Observability trace-only Node SDK config disables metric and log processors
  for Phoenix smoke exports.
- Pulumi plan code exposes backend and OTLP endpoint outputs without creating
  remote resources.

## Deferred To P4+

- Human label queue, benchmark execution, and scorecard generation.
- Weekly config-impact report from real derived tables.
- Dankserver Phoenix remote apply, service health checks, and tailnet routing.
- Optional LiteLLM gateway enrichment and xAI/Venice usage enrichment.
