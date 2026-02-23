# Production Checklist

A quick checklist to keep our production posture safe, fast, and ingestible. Focus is on logging and error reporting using our utils in `packages/common/utils/src/errors/common.ts`.

## TL;DR (defaults)

- APP_LOG_FORMAT=json
- APP_LOG_LEVEL=error
- NODE_ENV=production
- Do not enable pretty/heading/code-frame logging in hot paths in production.

---

## Supported environment variables today

Our logger stack reads the following environment variables via `readEnvLoggerConfig`:

- APP_LOG_FORMAT
  - Accepted: `pretty`, `json`, `structured`, `logfmt`
  - Note: `structured` is treated as `json`.
- APP_LOG_LEVEL
  - Accepted: `all`, `trace`, `debug`, `info`, `warning`, `error`, `fatal`, `none`
- NODE_ENV
  - `production` triggers prod defaults; anything else is considered non-prod.

Current defaults in code (`errors/common.ts`):

- If `NODE_ENV === production` → `format=json`, `level=Error`
- Else (dev/test/staging by default) → `format=pretty`, `level=All`

Use `withEnvLogging(...)` to apply these settings to any Effect.

```bash
# Example (shell) – simulate prod locally
APP_LOG_FORMAT=json APP_LOG_LEVEL=error NODE_ENV=production bun run --filter @beep/server start
```

---

## Why not use pretty/heading logs in production?

- Performance overhead
  - `formatCauseHeading()` parses stack traces and can read source files to render a code frame.
  - This adds synchronous FS reads on the error path. Great for local debugging; costly under load.
- Log ingestion/parsing
  - Pretty output is multi-line and uses Unicode/ANSI. Many log shippers prefer single‑line structured logs.
  - Colors are only useful on TTY; they pollute machine logs.
- Information leakage
  - Headings include repo-relative paths, file names, line/column, and function names.
  - Annotations can carry sensitive data. Be deliberate about what you annotate.

---

## What to use in production

- Prefer JSON (or logfmt) structured logs
  - Set `APP_LOG_FORMAT=json` (or `logfmt`).
  - Set `APP_LOG_LEVEL=error` (or `warning`) to control volume.
- Use `withEnvLogging({ ...prettyOverrides })` around your top-level effects
  - It builds a logger layer from env and applies a minimum log level.
- Keep rich pretty output for dev/staging
  - Use `APP_LOG_FORMAT=pretty` with `withPrettyLogging(...)` or `withEnvLogging(...)` outside production.

---

## Code touchpoints (for reference)

- `readEnvLoggerConfig` – reads format/level from env with prod/dev defaults.
- `makeEnvLoggerLayerFromEnv` – builds a logger layer based on env.
- `withEnvLogging` – applies env-derived logger and min level to an Effect.
- `makePrettyConsoleLogger`, `withPrettyLogging` – dev-friendly pretty logger.
- `formatCauseHeading`, `formatCausePretty` – rich error rendering helpers.
- `accumulateEffectsAndReport` – aggregates errors, prints heading + pretty cause (multi-line).
- `withSpanAndMetrics` – adds a span and optional metrics around an Effect.

---

## Pre-deploy checklist

- [ ] Ensure `APP_LOG_FORMAT=json` and `APP_LOG_LEVEL=error` (or `warning`) are set in the prod environment.
- [ ] Confirm `NODE_ENV=production` is set at runtime.
- [ ] Wrap app entrypoints in `withEnvLogging(...)` to pick up env configuration.
- [ ] Audit code for `formatCauseHeading(...)` and `accumulateEffectsAndReport(...)` usage on hot paths.
  - [ ] If used, disable code frames/headings in prod flows (or keep them only in admin/ops paths).
- [ ] Verify no PII/secrets are included in `Effect.annotateLogs({...})` fields in prod.
- [ ] Verify logs are single-line, structured (JSON or logfmt) when viewed in the aggregator.
- [ ] Validate log volume with `APP_LOG_LEVEL` set to an appropriate threshold.
- [ ] Confirm metrics (if used via `withSpanAndMetrics`) are exported/consumed by your telemetry stack.

---

## Optional future toggles (not implemented yet)

If we decide we need finer control without code changes, consider adding these env flags to `readEnvLoggerConfig` and threading them into the helpers:

- APP_LOG_CAUSE_HEADING=true|false – show/hide the heading block.
- APP_LOG_CAUSE_CODE_FRAME=true|false – include file code frames.
- APP_LOG_CAUSE_PRETTY=true|false – print `Cause.pretty`.
- APP_LOG_COLOR=true|false – force-disable colors in pretty mode.

Until these exist, prefer environment-specific wiring and only use the heading/code frame in non-prod environments.

---

## Quick verification

- Dev/staging
  - `APP_LOG_FORMAT=pretty APP_LOG_LEVEL=info NODE_ENV=staging` – logs are human-friendly with spans and annotations.
- Production smoke test
  - `APP_LOG_FORMAT=json APP_LOG_LEVEL=error NODE_ENV=production` – logs are single-line JSON and easy to ingest.

---

## Notes

- Multi-line logs (pretty/heading/code frames) are intentionally developer-focused.
- Structured logs keep production fast, cheaper to store, and easy to search.
- When in doubt, default to JSON + `withEnvLogging` in production.


# Get rid of `execute.ts` files in various packages.


# Make sure `Devtools is disabled in production`
