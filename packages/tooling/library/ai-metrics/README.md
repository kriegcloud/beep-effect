# @beep/repo-ai-metrics

Schema-first metrics, transcript-ingest, scorecard, and install models for
repo-local AI-agent analytics.

This is a tooling library, not product runtime language. It owns developer
operational concepts such as Codex/Claude/OpenClaw transcript ingestion,
benchmark scorecards, local/tailnet install specs, and export targets. Product
usage records in `agent-capability` or `epistemic` should map to this package
only through explicit adapter code when a proof benchmark needs to compare the
two worlds.
