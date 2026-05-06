# Backend Shortlist

## Default

The v1 backend posture is OTLP-first with Phoenix as the default UI.

Phoenix is the first dashboard target because it accepts OTLP traces, is
open-source, is focused on AI application tracing and evaluation, and has a
lower deployment burden than heavier production LLM platforms.

## Swappable Targets

Langfuse remains a strong candidate for production LLM engineering features:
tracing, generations, scoring, prompt management, datasets, and self-hosting.
It is heavier operationally because production self-hosting uses multiple
services such as application containers, Postgres, ClickHouse, cache, and blob
storage.

Opik remains a strong candidate for evaluation and optimization workflows. It
is open source, self-hostable, and focused on traces, annotation, scoring,
LLM-as-judge metrics, prompt engineering, and agent optimization.

PostHog remains useful for product analytics and broad event analysis. It is
not the default for this initiative because the first data product is coding
agent effectiveness, not customer product analytics.

## Data Model Rule

No backend owns the canonical data model. The canonical model lives in
`@beep/repo-ai-metrics`, raw archive files, and derived tables. Backend
adapters receive redacted, low-cardinality projections.

## References

- Langfuse self-hosting: https://langfuse.com/self-hosting
- Langfuse OTLP: https://langfuse.com/integrations/native/opentelemetry
- Phoenix docs: https://arize.com/docs/phoenix/
- Phoenix tracing: https://arize.com/docs/phoenix/tracing/llm-traces
- Opik docs: https://www.comet.com/docs/opik/
- PostHog LLM analytics: https://posthog.com/llm-analytics
