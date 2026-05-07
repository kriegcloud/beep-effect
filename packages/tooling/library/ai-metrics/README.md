# @beep/repo-ai-metrics

Schema-first metrics, transcript-ingest, scorecard, and install models for
repo-local AI-agent analytics.

This is a tooling library, not product runtime language. It owns developer
operational concepts such as Codex/Claude/OpenClaw transcript ingestion,
benchmark scorecards, local/tailnet install specs, generated local Phoenix
compose smoke targets, redacted OTLP span projections, structured labels,
recorded benchmark runs, and weekly config-impact reports. Product usage
records in `agent-capability` or `epistemic` should map to this package only
through explicit adapter code when a proof benchmark needs to compare the two
worlds.

P3 keeps backend-specific clients out of this package. Phoenix, Langfuse, Opik,
and PostHog are install/export targets until a backend-specific API is needed;
runtime OTLP wiring stays in `@beep/observability`.

P4 keeps scorecard artifacts deploy-safe: task metadata is hash-only, benchmark
prompts are stored by hash/reference only, label notes are redacted before
storage, and reports use coverage-aware neutral scoring while model/token/cost
enrichment remains sparse.

P5a keeps installer workflows contract-first: `plan`, `doctor`, and
dry-run-only `apply` use typed schemas, stdout/JSON output, Phoenix-only
concrete deployment steps, and no local or remote mutation. P5b keeps real
dankserver mutation in `@beep/infra`, where Pulumi remote commands deploy
Phoenix to the dedicated tailnet URL
`https://dankserver.tailc7c348.ts.net:8447`.
